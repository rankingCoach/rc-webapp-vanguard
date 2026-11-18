// Per-component guard: every relative import/export in emitted declarations resolves to an emitted file.
// Usage: node agentic-plans/uisdk-tools/check-dts-imports.mjs [dist/types ...]
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

const roots = process.argv.slice(2).length ? process.argv.slice(2) : ['dist/types'];
const walk = (d) => readdirSync(d).flatMap((f) => (statSync(join(d, f)).isDirectory() ? walk(join(d, f)) : [join(d, f)]));
const re = /(?:import|export)[^'"]*?from\s*['"](\.{1,2}\/[^'"]+)['"]|import\(\s*['"](\.{1,2}\/[^'"]+)['"]\s*\)/g;
let bad = 0;
let files = 0;
for (const root of roots) {
  if (!existsSync(root)) {
    console.error(`missing ${root}`);
    process.exit(2);
  }
  for (const f of walk(root).filter((x) => x.endsWith('.d.ts'))) {
    files++;
    const src = readFileSync(f, 'utf8');
    for (const m of src.matchAll(re)) {
      const spec = (m[1] ?? m[2]).replace(/\.(tsx?|jsx?)$/, '');
      const base = resolve(dirname(f), spec);
      const ok = [`${base}.d.ts`, join(base, 'index.d.ts')].some(existsSync) || (/\.(s?css|svg|png|json)$/.test(spec));
      if (!ok) {
        bad++;
        console.log(`${f}: unresolved ${m[1] ?? m[2]}`);
      }
    }
  }
}
console.log(`${files} declaration files, ${bad} unresolved relative imports`);
process.exit(bad ? 1 : 0);
