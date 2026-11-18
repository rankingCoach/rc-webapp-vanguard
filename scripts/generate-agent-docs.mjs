#!/usr/bin/env node
/**
 * Generates the agent-readable docs shipped in the package: docs/llms.txt (index) and docs/components/<Name>.md (one
 * page per value export of src/index.ts). Inputs, all in the repo: src/index.ts and src/index-wordpress.ts (export
 * lists), src/exports-meta/*.json (summaries), the TS compiler path of scripts/generate-exports-props.js (props), each
 * component's stories/*.story.tsx (examples) and data-slot literals in its source (DOM contract).
 *
 * Deterministic: sorted, no timestamps, no absolute paths. scripts/_agent-docs.spec.ts regenerates and diffs.
 *
 * Usage: node scripts/generate-agent-docs.mjs [outDir]   (default: docs)
 */
import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PKG = '@rankingcoach/vanguard';
const MAX_EXAMPLE_LINES = 40;
const MAX_EXAMPLES = 2;
const MAX_TYPE_LENGTH = 90;

const rel = (p) => path.relative(ROOT, p).split(path.sep).join('/');
const read = (p) => fs.readFileSync(p, 'utf8');

/** Value names exported by an entry file (`export { A, B as C } from`, `export const A`). Types are skipped. */
export const parseEntryExports = (file) => {
  const src = read(file);
  const names = new Set();
  for (const m of src.matchAll(/export\s*\{([^}]*)\}\s*from/g)) {
    for (const part of m[1].split(',')) {
      const p = part.trim();
      if (!p || p.startsWith('type ')) continue;
      names.add(p.split(/\s+as\s+/).pop().trim());
    }
  }
  for (const m of src.matchAll(/export\s+(?:const|function|class)\s+([A-Za-z0-9_$]+)/g)) names.add(m[1]);
  return names;
};

/** Strips `import("/abs/path").` prefixes so no local path leaks into the docs. */
const cleanType = (t) => (t || '').replace(/import\("[^"]*"\)\./g, '').replace(/\s+/g, ' ').trim();

/** Short form of a type: long unions (typically MUI-derived) are cut at a member boundary. */
export const shortType = (t) => {
  const c = cleanType(t);
  if (c.length <= MAX_TYPE_LENGTH) return c;
  const cut = c.slice(0, MAX_TYPE_LENGTH);
  const bar = cut.lastIndexOf(' | ');
  return `${(bar > 20 ? cut.slice(0, bar) : cut).trim()} | …`;
};

const SLOT_RE = /data-slot=(?:\{\s*)?['"`]([a-z0-9-]+)['"`]/g;
const STATE_RE = /\b(data-(?!slot\b|testid\b)[a-z][a-z0-9-]*)=/g;

/** data-slot values and state attributes in a source file and in the src/primitives files it imports directly. */
export const scrapeSlots = (file) => {
  const files = [file];
  const src = read(file);
  for (const m of src.matchAll(/from\s+['"]([^'"]*primitives\/[^'"]+)['"]/g)) {
    const base = path.resolve(path.dirname(file), m[1]);
    for (const ext of ['.tsx', '.ts', '/index.tsx', '/index.ts']) {
      if (fs.existsSync(base + ext)) {
        files.push(base + ext);
        break;
      }
    }
  }
  const slots = new Set();
  const states = new Set();
  for (const f of files) {
    const s = read(f);
    for (const m of s.matchAll(SLOT_RE)) slots.add(m[1]);
    if (s.includes('data-slot')) for (const m of s.matchAll(STATE_RE)) states.add(m[1]);
  }
  return { slots: [...slots].sort(), states: [...states].sort(), files: files.map(rel) };
};

const prodFiles = (dir) =>
  fs
    .readdirSync(dir, { recursive: true })
    .map((f) => path.join(dir, String(f)))
    .filter((f) => /\.(tsx?|jsx?)$/.test(f) && !/\.(spec|stories|story|test)\./.test(f) && !f.includes(`${path.sep}stories${path.sep}`));

/** True when the component's own folder still imports MUI at runtime (plan §23: internals pending rebuild). */
const usesMui = (file) => {
  const dir = path.dirname(file);
  if (!dir.includes(`${path.sep}src${path.sep}core${path.sep}`) && !dir.includes(`${path.sep}src${path.sep}common${path.sep}`)) return false;
  return prodFiles(dir).some((f) => /from\s+['"]@mui\//.test(read(f)));
};

const EMAIL_RE = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/;
const INTERNAL_HOST_RE = /\b[a-z0-9.-]*rankingcoach\.(?:com|de|net|io|local)\b/i;
const ABS_PATH_RE = /(?:\/Users\/|\/home\/|[A-Z]:\\)/;

/** Story examples for the component whose folder name equals its export name. */
const examplesFor = (name, file) => {
  const dir = path.dirname(file);
  if (path.basename(dir) !== name) return [];
  const storyDir = path.join(dir, 'stories');
  if (!fs.existsSync(storyDir)) return [];
  return fs
    .readdirSync(storyDir)
    .filter((f) => f.endsWith('.story.tsx'))
    .sort()
    .map((f) => ({ file: rel(path.join(storyDir, f)), code: read(path.join(storyDir, f)).trim() }))
    .filter(({ code }) => code.split('\n').length <= MAX_EXAMPLE_LINES)
    .filter(({ code }) => !EMAIL_RE.test(code) && !INTERNAL_HOST_RE.test(code) && !ABS_PATH_RE.test(code))
    .slice(0, MAX_EXAMPLES);
};

const kindOf = (r) => {
  if (/^use[A-Z]/.test(r.name)) return 'hook';
  if (/^[A-Z]/.test(r.name) && r.from.endsWith('.tsx') && r.expandedProps && Object.keys(r.expandedProps).length)
    return 'component';
  return 'helper';
};

const loadMeta = (name) => {
  const p = path.join(ROOT, 'src', 'exports-meta', `${name}.json`);
  return fs.existsSync(p) ? JSON.parse(read(p)) : null;
};

const esc = (s) => String(s).replace(/\|/g, '\\|').replace(/\n+/g, ' ');

const propsSection = (r) => {
  const entries = Object.entries(r.expandedProps || {}).sort(([a], [b]) => a.localeCompare(b));
  const own = entries.filter(([, v]) => (v.source || '').startsWith('src/'));
  const inherited = {};
  for (const [, v] of entries) {
    if ((v.source || '').startsWith('src/')) continue;
    const src = v.source || '';
    const key = src.includes('@types/react') ? 'React DOM attributes' : src.includes('@mui/') ? 'MUI props' : 'other';
    inherited[key] = (inherited[key] || 0) + 1;
  }
  const lines = ['## Props', ''];
  if (own.length) {
    lines.push('| Prop | Type | Required | Description |', '|---|---|---|---|');
    for (const [k, v] of own) lines.push(`| \`${k}\` | \`${esc(shortType(v.type))}\` | ${v.optional ? 'no' : 'yes'} | ${esc(v.description || '')} |`);
  } else lines.push('No own props.');
  const inh = Object.entries(inherited).sort(([a], [b]) => a.localeCompare(b));
  if (inh.length) lines.push('', `Also accepts: ${inh.map(([k, n]) => `${n} ${k}`).join(', ')} (not listed).`);
  return lines;
};

export const buildPages = (records, wordpress) => {
  const pages = new Map();
  for (const r of records) {
    const file = path.join(ROOT, r.from);
    const meta = loadMeta(r.name);
    const kind = kindOf(r);
    const lines = [`# ${r.name}`, ''];
    if (meta?.summary) lines.push(meta.summary, '');
    lines.push(`- Kind: ${kind}`, `- Import: \`import { ${r.name} } from '${PKG}';\``);
    lines.push(`- WordPress bundle: ${wordpress.has(r.name) ? 'yes' : 'no'}`, `- Source: \`${r.from}\``);
    if (meta?.keywords?.length) lines.push(`- Keywords: ${meta.keywords.join(', ')}`);
    lines.push('');
    if (kind === 'component') {
      if (usesMui(file)) lines.push('> Internals pending rebuild: this component still renders MUI internally. Its DOM contract (data-slot parts) is not final yet; style it through the props and classes it documents.', '');
      const { slots, states } = scrapeSlots(file);
      lines.push('## DOM contract', '');
      if (slots.length) {
        lines.push(`Slots: ${slots.map((s) => `\`[data-slot="${s}"]\``).join(', ')}`);
        if (states.length) lines.push('', `State / variant attributes: ${states.map((s) => `\`${s}\``).join(', ')}`);
      } else lines.push('No slots yet.');
      lines.push('', ...propsSection(r), '');
    } else if (r.props && kind === 'hook') {
      lines.push('## Parameters', '', `\`${esc(shortType(r.props))}\``, '');
      if (r.expandedProps && Object.keys(r.expandedProps).length) lines.push(...propsSection(r).slice(1), '');
    }
    const related = (meta?.recommendations || []).filter((x) => x.reason);
    if (related.length) {
      lines.push('## Related', '');
      for (const x of related) lines.push(`- ${x.id ? `\`${x.id}\`: ` : ''}${esc(x.reason)}`);
      lines.push('');
    }
    const ex = kind === 'component' ? examplesFor(r.name, file) : [];
    if (ex.length) {
      lines.push('## Examples', '');
      for (const e of ex) lines.push(`From \`${e.file}\`:`, '', '```tsx', e.code, '```', '');
    }
    pages.set(r.name, `${lines.join('\n').trimEnd()}\n`);
  }
  return pages;
};

const LLMS_HEAD = `# ${PKG}

> rankingCoach React component library (React 19). This file and docs/components/*.md ship inside the package, so they always match the installed version (see ../package.json).

## Imports

- Everything public is a named export of the root: \`import { Button, Text } from '${PKG}';\`. Load the stylesheet once: \`import '${PKG}/style.css';\`.
- WordPress hosts use the single bundle in \`dist-wordpress/\` (its export list is a curated subset; each component page says "WordPress bundle: yes/no").
- Deep paths that must keep working: \`${PKG}/dist/*\` (e.g. \`dist/index-OverlayStackingService.js\`). Do not import other internal paths.

## Stylesheet order (consumers get this wrong)

Vanguard's CSS decides equal-specificity ties by position. Keep the head order: 1. the app's entry-chunk CSS, 2. \`${PKG}/style.css\`, 3. route-chunk (lazy) CSS. Load the Vanguard stylesheet after the entry CSS and before any route chunk (e.g. a dynamic \`import('${PKG}/style.css')\` right after the first render). Moving it into a route chunk or bundling it ahead of the app's entry CSS flips which rules win.

## DOM contract: data-slot is the contract, Mui* classes are an alias

- Rebuilt components mark their parts with \`data-slot="<component>"\` / \`data-slot="<component>-<part>"\` (kebab-case) and expose state as attributes on the same element: booleans present-empty or absent (\`data-disabled\`, \`data-selected\`, \`data-open\`, \`data-pressed\`, \`data-checked\`, \`data-loading\`, ...), enums as values (\`data-size\`, \`data-variant\`, \`data-type\`, \`data-orientation\`). Style and test against these: \`[data-slot="switch"][data-checked]\`.
- \`Mui*\` class names still present on some elements are a compatibility alias kept during the rebuild; they will go away. Never introduce new selectors on them.
- Components whose page says "Internals pending rebuild" still render MUI internally and have no final slots yet.

## Forms

- New forms: \`const form = useFormStore<Values>({ initialValues, inputs, action })\`, render \`<Form config={form.formConfig} action={form.formAction}>\` and bind inputs by name with \`field="email"\` (any depth, no prop drilling; \`index\` for array fields). The action receives typed values; read pending with React's \`useFormStatus()\` in a child of the form; \`form.result\` holds the action's result. No Redux store or Provider needed.
- Legacy (supported, do not use for new code): \`useFormConfig\` + a Redux slice, inputs receive \`formconfig={...}\`. Existing forms keep working unchanged.

## Components, hooks and helpers
`;

export const buildLlms = (records, wordpress) => {
  const groups = { component: [], hook: [], helper: [] };
  for (const r of records) {
    const meta = loadMeta(r.name);
    const wp = wordpress.has(r.name) ? ' (WordPress)' : '';
    groups[kindOf(r)].push(`- [${r.name}](components/${r.name}.md)${wp}${meta?.summary ? `: ${esc(meta.summary)}` : ''}`);
  }
  const out = [LLMS_HEAD];
  for (const [title, key] of [['Components', 'component'], ['Hooks', 'hook'], ['Helpers and values', 'helper']]) {
    out.push(`### ${title}`, '', ...groups[key].sort((a, b) => a.localeCompare(b)), '');
  }
  return `${out.join('\n').trimEnd()}\n`;
};

export const generate = (outDir) => {
  const { main } = require('./generate-exports-props.js');
  const names = [...parseEntryExports(path.join(ROOT, 'src', 'index.ts'))].sort();
  const records = main({ write: false, quiet: true, names }).sort((a, b) => a.name.localeCompare(b.name));
  const wordpress = parseEntryExports(path.join(ROOT, 'src', 'index-wordpress.ts'));
  const pages = buildPages(records, wordpress);
  fs.rmSync(outDir, { recursive: true, force: true });
  fs.mkdirSync(path.join(outDir, 'components'), { recursive: true });
  fs.writeFileSync(path.join(outDir, 'llms.txt'), buildLlms(records, wordpress));
  for (const [name, md] of pages) fs.writeFileSync(path.join(outDir, 'components', `${name}.md`), md);
  return { count: pages.size };
};

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const outDir = path.resolve(ROOT, process.argv[2] || 'docs');
  const { count } = generate(outDir);
  console.log(`[generate-agent-docs] ${count} pages + llms.txt → ${rel(outDir) || outDir}`);
}
