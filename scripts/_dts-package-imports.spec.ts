import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
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
