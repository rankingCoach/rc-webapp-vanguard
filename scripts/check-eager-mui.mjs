#!/usr/bin/env node
/**
 * Plan §36.2 B.3 gate: for every public export of the ESM build (dist/index.js), walk the EAGER import graph (static
 * imports only; `import()` is a lazy boundary) and report the exports whose graph contains any `node_modules/@mui/*`
 * module. Reads `.vg-build/module-graph.dist.json` (config/module-graph.ts, written by `pnpm build`).
 *
 * Usage: node scripts/check-eager-mui.mjs [--assert-zero] [--wordpress-table]
 *   default        prints the count and the exports with eager @mui code
 *   --assert-zero  exits 1 unless the count is 0 (the target once every fallback sits behind a lazy boundary)
 *   --wordpress-table  per WordPress export (src/index-wordpress.ts), the @mui bytes its graph pulls in
 */
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const graph = JSON.parse(fs.readFileSync(path.join(root, '.vg-build/module-graph.dist.json'), 'utf8'));
const isMui = (id) => /[\\/]node_modules[\\/](\.pnpm[\\/][^\\/]+[\\/]node_modules[\\/])?@mui[\\/]/.test(id);
const isMuiOrEmotion = (id) => isMui(id) || /[\\/]node_modules[\\/](\.pnpm[\\/][^\\/]+[\\/]node_modules[\\/])?@emotion[\\/]/.test(id);

/**
 * Context-only @mui modules allowed in an eager graph (watchdog decision, plan §36.3): a React context works by object
 * identity, so MUI's own context module is kept instead of a copy that would silently stop honouring MUI's provider.
 * Each entry: exact module path inside node_modules, byte cap, one-line reason. On the next-major removal list.
 */
const ALLOW_LIST = [
  {
    module: '@mui/system/RtlProvider/index',
    capBytes: 2048,
    reason: "MUI's RtlContext (Menu routes RTL to MUI; _MenuOwnRouting uses RtlProvider directly)",
  },
];
const allowEntry = (id) =>
  ALLOW_LIST.find((a) => id.replace(/\\/g, '/').replace(/\.[cm]?js$/, '').endsWith(`/node_modules/${a.module}`));

const closureOf = (start, withDynamic) => {
  const seen = new Set();
  const stack = [start];
  while (stack.length) {
    const f = stack.pop();
    if (seen.has(f) || !graph[f]) continue;
    seen.add(f);
    for (const d of graph[f].imports) stack.push(d);
    if (withDynamic) for (const d of graph[f].dynamicImports) stack.push(d);
  }
  return seen;
};
const eagerClosure = (start) => closureOf(start, false);
// The WordPress build is one file: lazy fallback modules are inlined there, so its table follows import() too.
const fullClosure = (start) => closureOf(start, true);

// export name → file, from `export { a as b } from './index-X.js'` / `export * from` lines of dist/index.js
const indexSrc = fs.readFileSync(path.join(root, 'dist/index.js'), 'utf8');
const exportsToFile = new Map();
for (const m of indexSrc.matchAll(/export\s*\{([^}]*)\}\s*from\s*["']\.\/([^"']+)["']/g)) {
  for (const spec of m[1].split(',')) {
    const name = spec.trim().split(/\s+as\s+/).pop()?.trim();
    if (name) exportsToFile.set(name, m[2]);
  }
}
// also `import {a as b} from './x.js'; export {b}` shapes of minified output
const importMap = new Map();
for (const m of indexSrc.matchAll(/import\s*\{([^}]*)\}\s*from\s*["']\.\/([^"']+)["']/g))
  for (const spec of m[1].split(',')) {
    const local = spec.trim().split(/\s+as\s+/).pop()?.trim();
    if (local) importMap.set(local, m[2]);
  }
for (const m of indexSrc.matchAll(/export\s*\{([^}]*)\}\s*;?\s*$/gm))
  for (const spec of m[1].split(',')) {
    const [local, alias] = spec.trim().split(/\s+as\s+/).map((s) => s.trim());
    const file = importMap.get(local);
    if (file) exportsToFile.set(alias ?? local, file);
  }

const muiBytes = (files) => {
  let bytes = 0;
  const pkgs = new Set();
  for (const f of files)
    for (const [id, n] of Object.entries(graph[f]?.modules ?? {}))
      if (isMui(id) && !allowEntry(id)) {
        bytes += n;
        pkgs.add(id.match(/@mui[\\/][^\\/]+/)[0].replace('\\', '/'));
      }
  return { bytes, pkgs: [...pkgs].sort() };
};

const rowsFor = (closure) =>
  [...exportsToFile.entries()]
    .map(([name, file]) => ({ name, ...muiBytes(closure(file)) }))
    .filter((r) => r.bytes > 0)
    .sort((a, b) => b.bytes - a.bytes || a.name.localeCompare(b.name));
const rows = rowsFor(eagerClosure);

// Allow-list guards: each allow-listed module stays under its cap and its own eager graph pulls no further
// @mui/* or @emotion/* module (so the entry cannot quietly grow).
const allowProblems = [];
const allowSeen = new Set();
for (const [file, info] of Object.entries(graph))
  for (const [id, n] of Object.entries(info.modules)) {
    const entry = allowEntry(id);
    if (!entry) continue;
    allowSeen.add(entry.module);
    if (n > entry.capBytes) allowProblems.push(`${entry.module}: ${n} B > cap ${entry.capBytes} B`);
    for (const dep of eagerClosure(file))
      for (const other of Object.keys(graph[dep]?.modules ?? {}))
        if (other !== id && isMuiOrEmotion(other) && !allowEntry(other))
          allowProblems.push(`${entry.module}: its graph pulls ${other.replace(/.*node_modules[\\/]/, '')}`);
  }

const args = new Set(process.argv.slice(2));
if (args.has('--wordpress-table')) {
  const wpSrc = fs.readFileSync(path.join(root, 'src/index-wordpress.ts'), 'utf8');
  const wpNames = new Set();
  for (const m of wpSrc.matchAll(/export\s*(?:type\s*)?\{([^}]*)\}/g))
    if (!/export\s+type/.test(m[0])) for (const spec of m[1].split(',')) wpNames.add(spec.trim().split(/\s+as\s+/).pop()?.trim());
  const wpRows = rowsFor(fullClosure).filter((r) => wpNames.has(r.name));
  console.log(
    `WordPress exports with @mui code in their graph (single file: lazy fallbacks inlined): ${wpRows.length} of ${wpNames.size}`,
  );
  for (const r of wpRows) console.log(`  ${r.name}\t${r.bytes} B\t${r.pkgs.join(', ')}`);
} else {
  console.log(
    `eager @mui: ${rows.length} of ${exportsToFile.size} public exports (+${allowSeen.size} allow-listed context modules)`,
  );
  for (const r of rows) console.log(`  ${r.name}\t${r.bytes} B\t${r.pkgs.join(', ')}`);
}
for (const p of allowProblems) console.log(`ALLOW-LIST VIOLATION: ${p}`);
if (allowProblems.length > 0) process.exit(1);
if (args.has('--assert-zero') && rows.length > 0) process.exit(1);
