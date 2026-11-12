import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, test } from 'vitest';

/**
 * Checks the publishable package against the built output: every `exports` target, the `main`/`module`/`types`
 * fields and every relative module specifier inside the shipped declarations must resolve to a file that
 * `pnpm pack` would include (the `files` allow-list). Needs a prior `pnpm run build`; skipped without dist/.
 */
const root = path.resolve(__dirname, '..');
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const built = fs.existsSync(path.join(root, 'dist/index.js')) && fs.existsSync(path.join(root, 'dist-wordpress/index.js'));

// npm always drops these, whatever `files` says.
const alwaysIgnored = /(^|\/)(\.DS_Store|node_modules|\.git|npm-debug\.log|\.npmrc|[^/]*\.orig)(\/|$)/;

function walk(dir: string, out: string[]): string[] {
  for (const entry of fs.readdirSync(path.join(root, dir), { withFileTypes: true })) {
    const relative = `${dir}/${entry.name}`;
    if (alwaysIgnored.test(relative)) continue;
    if (entry.isDirectory()) walk(relative, out);
    else out.push(relative);
  }
  return out;
}

/** Files the tarball would contain, following the `files` allow-list. */
function packedFiles(): Set<string> {
  const files = new Set<string>(['package.json']);
  for (const entry of pkg.files as string[]) {
    const absolute = path.join(root, entry);
    if (!fs.existsSync(absolute)) continue;
    if (fs.statSync(absolute).isDirectory()) for (const file of walk(entry, [])) files.add(file);
    else files.add(entry);
  }
  return files;
}

type Target = string | { [condition: string]: Target };

function conditionTargets(target: Target): Record<string, string> {
  if (typeof target === 'string') return { default: target };
  const flat: Record<string, string> = {};
  for (const [condition, value] of Object.entries(target)) {
    for (const [nested, file] of Object.entries(conditionTargets(value))) flat[nested === 'default' ? condition : `${condition}.${nested}`] = file;
  }
  return flat;
}

const strip = (target: string) => target.replace(/^\.\//, '');
const escape = (text: string) => text.replace(/[.+?^${}()|[\]\\]/g, '\\$&');

/** Every packed file matching a (possibly `*`) target, keyed by what the `*` stood for. */
function matches(target: string, packed: Set<string>): Map<string, string> {
  const found = new Map<string, string>();
  const pattern = strip(target);
  if (!pattern.includes('*')) {
    if (packed.has(pattern)) found.set('', pattern);
    return found;
  }
  const regex = new RegExp(`^${pattern.split('*').map(escape).join('(.+)')}$`);
  for (const file of packed) {
    const match = regex.exec(file);
    if (match) found.set(match[1], file);
  }
  return found;
}

const specifierPattern = /(?:\bfrom\s*|\bimport\s*\(\s*|\bimport\s+)(["'])(\.{1,2}\/[^"'\n]+)\1/g;

/** A relative specifier in a .d.ts resolves like TS does: .d.ts sibling, explicit TS/JS extension, or index. */
function resolvesDeclaration(fromFile: string, specifier: string, packed: Set<string>): boolean {
  const base = path.posix.normalize(path.posix.join(path.posix.dirname(fromFile), specifier));
  const stem = base.replace(/\.(d\.ts|tsx?|jsx?|mjs)$/, '');
  return [`${stem}.d.ts`, `${base}`, `${stem}/index.d.ts`].some((candidate) => packed.has(candidate) && candidate.endsWith('.d.ts'))
    || (/\.(s?css|svg|png|gif|json)$/.test(base) && packed.has(base));
}

describe.skipIf(!built)('published package contents (run `pnpm run build` first)', () => {
  const packed = built ? packedFiles() : new Set<string>();

  test('main, module and types point at packed files', () => {
    const missing = ['main', 'module', 'types'].filter((field) => pkg[field] && !packed.has(strip(pkg[field])));
    expect(missing).toEqual([]);
  });

  test('every exports target resolves to a packed file, and every JS target has its declaration', () => {
    const problems: string[] = [];
    for (const [key, target] of Object.entries(pkg.exports as Record<string, Target>)) {
      const targets = conditionTargets(target);
      const hasJs = Object.entries(targets).some(([condition, file]) => condition !== 'types' && /\.(c|m)?js$/.test(file));
      if (hasJs && typeof target !== 'string' && !targets.types) problems.push(`${key}: JS target without a "types" condition`);
      for (const [condition, file] of Object.entries(targets)) {
        const found = matches(file, packed);
        if (found.size === 0) {
          problems.push(`${key} [${condition}] -> ${file}: no packed file`);
          continue;
        }
        if (condition === 'types' || !targets.types) continue;
        for (const star of found.keys()) {
          const declaration = strip(targets.types).replace('*', star);
          if (!packed.has(declaration)) problems.push(`${key} [${condition}] ${found.get(star)}: missing ${declaration}`);
        }
      }
    }
    expect(problems).toEqual([]);
  });

  test('the WordPress bundle ships its entry declaration as dist-wordpress/types/index.d.ts', () => {
    expect(packed.has('dist-wordpress/types/index.d.ts')).toBe(true);
    expect(packed.has('dist-wordpress/types/index-wordpress.d.ts')).toBe(false);
  });

  test.each(['dist/types', 'dist-wordpress/types'])('every relative import in %s resolves to a packed declaration', (typesRoot) => {
    const unresolved: string[] = [];
    for (const file of packed) {
      if (!file.startsWith(`${typesRoot}/`) || !file.endsWith('.d.ts')) continue;
      const source = fs.readFileSync(path.join(root, file), 'utf8');
      for (const [, , specifier] of source.matchAll(specifierPattern)) {
        if (!resolvesDeclaration(file, specifier, packed)) unresolved.push(`${file}: ${specifier}`);
      }
    }
    expect(unresolved.slice(0, 25)).toEqual([]);
  });
});
