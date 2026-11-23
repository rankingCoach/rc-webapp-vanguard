import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import ts from 'typescript5';
import { describe, expect, it } from 'vitest';

/**
 * Published declarations may only import packages a consumer is guaranteed to have: Vanguard's `dependencies` or
 * `peerDependencies` (or `@types/*`). A `.d.ts` that imports anything else silently degrades to `any` in a consumer
 * that does not have it (measured for @mui when MUI leaves `dependencies`, plan §24).
 *
 * KNOWN_UNDECLARED freezes the pre-existing gap (the "undeclared types" release limitation; `vanguard` is a path
 * alias leaking into styles.d.ts). New entries fail; a fixed entry that is still listed fails too, so the list only
 * shrinks.
 */
const KNOWN_UNDECLARED = [
  '@googlemaps/markerclusterer',
  '@lexical/react',
  '@react-google-maps/api',
  '@react-google-maps/marker-clusterer',
  '@use-gesture/react',
  'apexcharts',
  'compressorjs',
  'cropperjs',
  'csstype',
  'history',
  'immer',
  'lexical',
  'libphonenumber-js',
  'lottie-web',
  'moment',
  'react-date-range',
  'react-spring',
  'redux',
  'rxjs',
  'vanguard',
  'video.js',
];

const root = resolve(__dirname, '..');
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')) as Record<string, Record<string, string>>;
const declared = new Set([...Object.keys(pkg.dependencies ?? {}), ...Object.keys(pkg.peerDependencies ?? {})]);

const declarationExcludes = (viteConfig: string) => {
  const source = ts.createSourceFile(viteConfig, readFileSync(join(root, viteConfig), 'utf8'), ts.ScriptTarget.Latest);
  let exclude: string[] | undefined;
  let found = false;
  const visit = (node: ts.Node) => {
    if (ts.isCallExpression(node) && node.expression.getText(source) === 'dts') {
      if (found) throw new Error(`Multiple dts calls in ${viteConfig}`);
      found = true;
      const options = node.arguments[0];
      if (!options || !ts.isObjectLiteralExpression(options)) throw new Error(`Cannot read dts options in ${viteConfig}`);
      const property = options.properties.find(
        (item): item is ts.PropertyAssignment => ts.isPropertyAssignment(item) && item.name.getText(source) === 'exclude',
      );
      if (property) {
        if (!ts.isArrayLiteralExpression(property.initializer)) throw new Error(`Cannot read dts exclude in ${viteConfig}`);
        exclude = property.initializer.elements.map((item) => {
          if (!ts.isStringLiteral(item)) throw new Error(`Non-literal dts exclude in ${viteConfig}`);
          return item.text;
        });
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  if (!found) throw new Error(`Missing dts call in ${viteConfig}`);
  return exclude;
};

describe.each(['vite.config.lib.ts', 'vite.config.wordpress.ts'])('%s declaration boundary', (viteConfig) => {
  it('excludes frozen MUI fixtures while keeping actual picker declarations', () => {
    const projectPath = join(root, 'tsconfig.dts.json');
    const project = ts.readConfigFile(projectPath, ts.sys.readFile);
    expect(project.error).toBeUndefined();
    // Check each effective exclude against the shared source set. WordPress narrows its emit further to its entry graph.
    const explicitExcludes = declarationExcludes(viteConfig);
    const exclude = explicitExcludes?.length ? explicitExcludes : project.config.exclude;
    const config = ts.parseJsonConfigFileContent({ ...project.config, exclude }, ts.sys, root, undefined, projectPath);
    const files = config.fileNames.map((file) => relative(root, file).replaceAll('\\', '/'));
    const reference = 'src/core/DatePicker/_DateCalendar.mui-reference.tsx';
    expect(existsSync(join(root, reference))).toBe(true);
    expect(existsSync(join(root, 'src/core/DatePicker/_DatePicker.mui-reference.tsx'))).toBe(true);
    expect(files.filter((file) => /\.mui-reference\.[cm]?tsx?$/.test(file))).toEqual([]);
    expect(files).toContain('src/core/DatePicker/DatePicker.tsx');
    expect(files).toContain('src/core/DatePicker/DateCalendar.tsx');

    const legacyFixtures = [
      ['src/core/Accordion/_AccordionMui.reference.tsx', 'src/core/Accordion/Accordion.tsx'],
      ['src/core/Breadcrumbs/_BreadcrumbsMui.reference.tsx', 'src/core/Breadcrumbs/Breadcrumbs.tsx'],
      ['src/core/Button/_ButtonMui.reference.tsx', 'src/core/Button/Button.tsx'],
      ['src/core/Chip/_ChipMui.reference.tsx', 'src/core/Chip/Chip.tsx'],
      ['src/core/List/ListShowMore/_ListShowMoreMui.reference.tsx', 'src/core/List/ListShowMore/ListShowMore.tsx'],
      ['src/core/Pagination/_PaginationMui.reference.tsx', 'src/core/Pagination/Pagination.tsx'],
      ['src/core/Slider/_SliderMui.reference.tsx', 'src/core/Slider/Slider.tsx'],
      ['src/core/StyledSVG/_StyledSVGLegacy.reference.tsx', 'src/core/StyledSVG/StyledSVG.tsx'],
    ];
    for (const [fixture, component] of legacyFixtures) {
      expect(existsSync(join(root, fixture))).toBe(true);
      expect(files).toContain(component);
    }
    expect(files.filter((file) => /\.reference\.[cm]?tsx?$/.test(file)).sort()).toEqual([]);
  });
});

const walk = (dir: string): string[] =>
  readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : path.endsWith('.d.ts') ? [path] : [];
  });

const packageOf = (specifier: string) =>
  specifier.startsWith('@') ? specifier.split('/').slice(0, 2).join('/') : specifier.split('/')[0];

const importedPackages = (dir: string) => {
  const found = new Map<string, string>();
  for (const file of walk(dir)) {
    for (const m of readFileSync(file, 'utf8').matchAll(/(?:from|import\()\s*['"]([^.'"/][^'"]*)['"]/g)) {
      const name = packageOf(m[1]);
      if (!found.has(name)) found.set(name, file.slice(root.length + 1));
    }
  }
  return found;
};

describe.each([['default', 'dist/types'], ['WordPress', 'dist-wordpress/types']])(
  'published %s declarations import only declared packages',
  (_name, rel) => {
    const dir = join(root, rel);
    it.skipIf(!existsSync(dir))('no undeclared package outside the frozen list', () => {
      const undeclared = [...importedPackages(dir)].filter(
        ([name]) => !declared.has(name) && !name.startsWith('@types/') && !name.startsWith('node:'),
      );
      const unexpected = undeclared.filter(([name]) => !KNOWN_UNDECLARED.includes(name));
      expect(unexpected.map(([name, file]) => `${name} (first in ${file})`)).toEqual([]);
    });
  },
);

describe('frozen list only shrinks', () => {
  const dir = join(root, 'dist/types');
  it.skipIf(!existsSync(dir))('every KNOWN_UNDECLARED entry is still imported and still undeclared', () => {
    const imported = importedPackages(dir);
    const stale = KNOWN_UNDECLARED.filter((name) => !imported.has(name) || declared.has(name));
    expect(stale).toEqual([]);
  });
});
