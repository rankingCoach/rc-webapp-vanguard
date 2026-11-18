#!/usr/bin/env node
/**
 * Generates the agent-readable docs shipped in the package: docs/llms.txt (index) and docs/components/<Name>.md (one
 * page per value export of src/index.ts). Build output (gitignored), produced during the library build so it ships
 * in the tarball. Inputs, all in the repo: src/index.ts and src/index-wordpress.ts (export lists),
 * src/exports-meta/*.json (summaries), the TS compiler path of scripts/generate-exports-props.js (props), the `args`
 * of each component's stories/*.story.tsx (usage examples) and data-slot literals in its source (DOM contract).
 *
 * Deterministic: sorted, no timestamps, no absolute paths. Checked by scripts/_agent-docs.spec.ts.
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
const MAX_ARGS_EXAMPLES = 3;

/** JSX attribute for one story arg, or null when the value is not a plain literal (then the story is skipped). */
const attrFor = (ts, key, node, exported, uses) => {
  const lit = (n) => {
    if (ts.isStringLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n)) return JSON.stringify(n.text);
    if (ts.isNumericLiteral(n)) return n.text;
    if (n.kind === ts.SyntaxKind.TrueKeyword) return 'true';
    if (n.kind === ts.SyntaxKind.FalseKeyword) return 'false';
    if (n.kind === ts.SyntaxKind.NullKeyword) return 'null';
    if (ts.isPrefixUnaryExpression(n) && ts.isNumericLiteral(n.operand)) return `-${n.operand.text}`;
    if (ts.isPropertyAccessExpression(n) && ts.isIdentifier(n.expression) && exported.has(n.expression.text)) {
      uses.add(n.expression.text);
      return `${n.expression.text}.${n.name.text}`;
    }
    if (ts.isArrayLiteralExpression(n)) {
      const items = n.elements.map(lit);
      return items.includes(null) ? null : `[${items.join(', ')}]`;
    }
    if (ts.isObjectLiteralExpression(n)) {
      const items = n.properties.map((pr) => {
        if (!ts.isPropertyAssignment(pr)) return null;
        const v = lit(pr.initializer);
        const k = ts.isIdentifier(pr.name) ? pr.name.text : ts.isStringLiteral(pr.name) ? JSON.stringify(pr.name.text) : null;
        return v === null || k === null ? null : `${k}: ${v}`;
      });
      return items.includes(null) ? null : `{ ${items.join(', ')} }`;
    }
    return null;
  };
  const v = lit(node);
  if (v === null) return null;
  if (v === 'true') return key;
  if ((ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) && !node.text.includes('"')) return `${key}=${v}`;
  return `${key}={${v}}`;
};

/**
 * Usage examples generated from story `args` (not story source): `import { X } from '<pkg>'` plus the JSX the args
 * describe. Stories with a custom `render`, spread args or non-literal values are skipped; event-handler and test-id
 * args (`on*`, `testId`) are dropped. At most three examples with distinct args.
 */
const examplesFor = (name, file, exported) => {
  const dir = path.dirname(file);
  if (path.basename(dir) !== name) return [];
  const storyDir = path.join(dir, 'stories');
  if (!fs.existsSync(storyDir)) return [];
  const ts = require('typescript5');
  const seen = new Set();
  const out = [];
  for (const f of fs.readdirSync(storyDir).filter((x) => x.endsWith('.story.tsx')).sort()) {
    const src = read(path.join(storyDir, f));
    const sf = ts.createSourceFile(f, src, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    for (const stmt of sf.statements) {
      if (!ts.isVariableStatement(stmt) || !stmt.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)) continue;
      for (const decl of stmt.declarationList.declarations) {
        const init = decl.initializer;
        if (!init || !ts.isObjectLiteralExpression(init)) continue;
        const keys = init.properties.map((p) => (p.name && ts.isIdentifier(p.name) ? p.name.text : '?'));
        if (keys.includes('render') || init.properties.some((p) => ts.isSpreadAssignment(p))) continue;
        const argsProp = init.properties.find((p) => ts.isPropertyAssignment(p) && ts.isIdentifier(p.name) && p.name.text === 'args');
        if (!argsProp || !ts.isObjectLiteralExpression(argsProp.initializer)) continue;
        const uses = new Set([name]);
        const attrs = [];
        let children = null;
        let ok = true;
        for (const p of argsProp.initializer.properties) {
          if (!ts.isPropertyAssignment(p)) {
            ok = false;
            break;
          }
          const key = ts.isIdentifier(p.name) ? p.name.text : ts.isStringLiteral(p.name) ? p.name.text : null;
          if (!key || /^on[A-Z]/.test(key) || key === 'testId' || key.startsWith('data-')) continue;
          if (key === 'children' && (ts.isStringLiteral(p.initializer) || ts.isNoSubstitutionTemplateLiteral(p.initializer))) {
            children = p.initializer.text;
            continue;
          }
          if (!/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(key)) {
            ok = false;
            break;
          }
          const a = attrFor(ts, key, p.initializer, exported, uses);
          if (a === null) {
            ok = false;
            break;
          }
          attrs.push(a);
        }
        if (!ok) continue;
        const open = [name, ...attrs].join(' ');
        const jsx = children !== null ? `<${open}>${children}</${name}>` : `<${open} />`;
        if (seen.has(jsx) || EMAIL_RE.test(jsx) || INTERNAL_HOST_RE.test(jsx) || ABS_PATH_RE.test(jsx)) continue;
        seen.add(jsx);
        out.push(`import { ${[...uses].sort().join(', ')} } from '${PKG}';\n\n${jsx}`);
        if (out.length >= MAX_ARGS_EXAMPLES) return out;
      }
    }
  }
  return out;
};

/**
 * Plan §23 ("Paths still on MUI") is more precise than a folder-level `@mui` import for components that are partly on
 * the own core. `null` = fully on the own core (no note even if the folder still imports MUI for a type or a fallback).
 */
const MUI_NOTES = {
  Input: 'Outlined text field: own core. Filled/standard variants (`textFieldProps.variant`) and a custom `inputComponent`: pending rebuild (MUI).',
  Textarea: 'Outlined multiline field: own core. Filled/standard variants: pending rebuild (MUI).',
  Select: 'Outlined select and its menu: own core. Native select (`SelectProps.native`) and filled/standard variants: pending rebuild (MUI).',
  ToggleButton: null,
  ToggleButtonGroup: null,
  PopoverPopper: 'Positioning: own core (own Popper). The surrounding popper shell: pending rebuild (MUI).',
  MenuItem: 'Inside Select and Menu it renders the own-core menu option; standalone rendering: pending rebuild (MUI).',
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
  const exported = new Set(records.map((r) => r.name));
  for (const r of records) {
    const file = path.join(ROOT, r.from);
    const meta = loadMeta(r.name);
    const kind = kindOf(r);
    const lines = [`# ${r.name}`, ''];
    if (meta?.summary) lines.push(meta.summary, '');
    lines.push(`- Kind: ${kind}`, `- Import: \`import { ${r.name} } from '${PKG}';\``);
    lines.push(`- WordPress bundle: ${wordpress.has(r.name) ? 'yes' : 'no'}`);
    if (meta?.keywords?.length) lines.push(`- Keywords: ${meta.keywords.join(', ')}`);
    lines.push('');
    if (kind === 'component') {
      const note = Object.hasOwn(MUI_NOTES, r.name)
        ? MUI_NOTES[r.name]
        : usesMui(file)
          ? 'Internals pending rebuild: this component still renders MUI internally. Its DOM contract (data-slot parts) is not final yet; style it through the props and classes it documents.'
          : null;
      if (note) lines.push(`> ${note}`, '');
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
    const ex = kind === 'component' ? examplesFor(r.name, file, exported) : [];
    if (ex.length) {
      lines.push('## Examples', '');
      for (const e of ex) lines.push('```tsx', e, '```', '');
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
  return { count: pages.size, sources: Object.fromEntries(records.map((r) => [r.name, r.from])) };
};

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const outDir = path.resolve(ROOT, process.argv[2] || 'docs');
  const { count } = generate(outDir);
  console.log(`[generate-agent-docs] ${count} pages + llms.txt → ${rel(outDir) || outDir}`);
}
