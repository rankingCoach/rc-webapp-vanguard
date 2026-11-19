#!/usr/bin/env node
/**
 * D10 measurement (read-only): per public export of dist/index.js, the static import closure in dist/ (raw and
 * gzip bytes, summed per file), the bytes only that export pulls in, which heavy libraries it pulls in EAGERLY
 * (static imports only; `import()` targets are listed separately as lazy), and base64 assets > 4 KB inlined anywhere.
 * Also: which heavy libraries and base64 assets the single WordPress bundle contains.
 *
 * Usage: node agentic-plans/uisdk-tools-b/measure-exports.mjs > out.json   (run after `pnpm run build`)
 */
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const root = process.cwd();
const dist = path.join(root, 'dist');
const wp = path.join(root, 'dist-wordpress', 'index.js');

const LIBS = {
  apexcharts: /ApexCharts|apexcharts/,
  lottie: /lottie|bodymovin/i,
  'video.js': /videojs|video\.js/,
  'xlsx/jszip/file-saver': /XLSX\.utils|SheetJS|JSZip|saveAs\(/,
  lexical: /\$getRoot|LexicalComposer|lexical/,
  moment: /moment\.version|isMoment|momentProperties/,
  'google-maps': /maps\.googleapis\.com|google\.maps\./,
  'react-date-range': /rdrCalendarWrapper|react-date-range/,
  imask: /IMask|imask/,
  cropperjs: /cropperjs|Cropper\.prototype|cropper-container/,
  // Bundled MUI loses its paths and own-core code carries Mui* alias class strings, so detect the emotion runtime
  // (MUI's styling engine) instead.
  'mui/emotion runtime': /__EMOTION_TYPE_PLEASE_DO_NOT_USE__|emotion-react|@emotion\/react/,
};

const files = fs.readdirSync(dist).filter((f) => f.endsWith('.js'));
const src = new Map(files.map((f) => [f, fs.readFileSync(path.join(dist, f), 'utf8')]));
const gz = new Map();
const gzSize = (f) => {
  if (!gz.has(f)) gz.set(f, zlib.gzipSync(src.get(f), { level: 9 }).length);
  return gz.get(f);
};

const STATIC_RE = /(?:^|[;\n])\s*(?:import|export)\s*(?:[^'"()]*?\sfrom\s*)?["']\.\/([^"']+\.js)["']/g;
const DYN_RE = /import\(\s*["']\.\/([^"']+\.js)["']\s*\)/g;
const deps = new Map();
const lazy = new Map();
for (const [f, s] of src) {
  deps.set(f, [...new Set([...s.matchAll(STATIC_RE)].map((m) => m[1]).filter((d) => src.has(d)))]);
  lazy.set(f, [...new Set([...s.matchAll(DYN_RE)].map((m) => m[1]).filter((d) => src.has(d)))]);
}
const closure = (start) => {
  const seen = new Set();
  const stack = [start];
  while (stack.length) {
    const f = stack.pop();
    if (seen.has(f)) continue;
    seen.add(f);
    for (const d of deps.get(f) ?? []) stack.push(d);
  }
  return seen;
};

const libsOf = (set) => {
  const hit = {};
  for (const f of set) for (const [lib, re] of Object.entries(LIBS)) if (re.test(src.get(f))) (hit[lib] ??= []).push(f);
  return hit;
};

// Public exports: `import { X as a } from "./file.js"` + `export { a as X }` in dist/index.js.
const index = src.get('index.js');
const local = new Map();
for (const m of index.matchAll(/import\s*\{([^}]*)\}\s*from\s*["']\.\/([^"']+\.js)["']/g)) {
  for (const part of m[1].split(',')) {
    const [orig, alias] = part.trim().split(/\s+as\s+/);
    if (orig) local.set((alias ?? orig).trim(), { orig: orig.trim(), file: m[2] });
  }
}
for (const m of index.matchAll(/import\s*\*\s*as\s*(\w+)\s*from\s*["']\.\/([^"']+\.js)["']/g)) local.set(m[1], { orig: '*', file: m[2] });
const exportsMap = new Map();
for (const m of index.matchAll(/export\s*\{([^}]*)\}/g)) {
  for (const part of m[1].split(',')) {
    const [l, pub] = part.trim().split(/\s+as\s+/);
    const name = (pub ?? l)?.trim();
    const target = local.get(l?.trim());
    if (name && target) exportsMap.set(name, target.file);
  }
}

const closures = new Map([...exportsMap].map(([name, file]) => [name, closure(file)]));
const owners = new Map();
for (const [name, set] of closures) for (const f of set) owners.set(f, (owners.get(f) ?? 0) + 1);

const rows = [...closures].map(([name, set]) => {
  let raw = 0;
  let gzip = 0;
  let uniqueGzip = 0;
  for (const f of set) {
    raw += src.get(f).length;
    gzip += gzSize(f);
    if (owners.get(f) === 1) uniqueGzip += gzSize(f);
  }
  const lazyTargets = new Set([...set].flatMap((f) => lazy.get(f)));
  return { name, file: exportsMap.get(name), files: set.size, raw, gzip, uniqueGzip, eagerLibs: Object.keys(libsOf(set)), lazyChunks: lazyTargets.size };
});
rows.sort((a, b) => b.gzip - a.gzip);

const B64_RE = /data:([a-z]+\/[a-z0-9.+-]+);base64,([A-Za-z0-9+/=]{5462,})/g; // 5462 chars ≈ 4096 bytes decoded
const base64 = [];
for (const [f, s] of src) for (const m of s.matchAll(B64_RE)) base64.push({ file: f, mime: m[1], bytes: Math.floor((m[2].length * 3) / 4) });
const wpSrc = fs.existsSync(wp) ? fs.readFileSync(wp, 'utf8') : '';
const wpBase64 = [...wpSrc.matchAll(B64_RE)].map((m) => ({ mime: m[1], bytes: Math.floor((m[2].length * 3) / 4) }));
const wpLibs = Object.fromEntries(Object.entries(LIBS).map(([lib, re]) => [lib, re.test(wpSrc)]));

// Library footprint: files whose own source matches the library signature, and which exports reach them eagerly.
const libFootprint = Object.fromEntries(
  Object.entries(LIBS).map(([lib, re]) => {
    const own = files.filter((f) => re.test(src.get(f)));
    return [lib, { files: own.length, gzip: own.reduce((a, f) => a + gzSize(f), 0), eagerFrom: rows.filter((r) => r.eagerLibs.includes(lib)).map((r) => r.name) }];
  }),
);
const wpExports = new Set(
  [...fs.readFileSync(path.join(root, 'src', 'index-wordpress.ts'), 'utf8').matchAll(/export\s*\{([^}]*)\}\s*from/g)].flatMap((m) =>
    m[1].split(',').map((p) => p.trim()).filter((p) => p && !p.startsWith('type ')).map((p) => p.split(/\s+as\s+/).pop().trim()),
  ),
);
for (const r of rows) r.wordpress = wpExports.has(r.name);

const whole = closure('index.js');
let wholeGz = 0;
for (const f of whole) wholeGz += gzSize(f);

console.log(
  JSON.stringify(
    {
      method: 'static import closure over dist/*.js from each dist/index.js export; gzip level 9 per file, summed (a real bundler gzips whole chunks, so absolute numbers are upper bounds; ranking is the point). uniqueGzip = files reached by exactly one export.',
      distFiles: files.length,
      wholeRootStaticClosure: { files: whole.size, gzip: wholeGz },
      exports: rows,
      libFootprint,
      base64Over4KB: base64.sort((a, b) => b.bytes - a.bytes),
      wordpress: { bytes: wpSrc.length, gzip: zlib.gzipSync(wpSrc, { level: 9 }).length, libsPresent: wpLibs, base64Over4KB: wpBase64.sort((a, b) => b.bytes - a.bytes) },
    },
    null,
    1,
  ),
);
