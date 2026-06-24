// Generates src/core/_showcase/CssUpdatesShowcase/data.ts
// Run from repo root:  node scripts/gen-css-showcase-data.mjs
/* eslint-disable no-console, @typescript-eslint/explicit-function-return-type, unicorn/prefer-node-protocol */
import { execSync } from 'child_process';
import fs from 'fs';
import http from 'http';
import https from 'https';

const BASE = process.env.BASE || 'master';
const OUT = 'src/core/_showcase/CssUpdatesShowcase/data.ts';
const STORYBOOK_INDEX_URL = process.env.STORYBOOK_INDEX_URL;

const isNoise = (t) => /^[{}();,\s]*$/.test(t) || t === '';

function changesFor(scssPath) {
  const lines = execSync(`git diff ${BASE} -- "${scssPath}"`, { encoding: 'utf8', maxBuffer: 1 << 26 }).split('\n');
  let cur = { r: [], a: [] };
  const blocks = [];
  const flush = () => {
    if (cur.r.length || cur.a.length) {
      blocks.push(cur);
      cur = { r: [], a: [] };
    }
  };
  for (const ln of lines) {
    if (ln.startsWith('+++') || ln.startsWith('---') || ln.startsWith('diff ') || ln.startsWith('index ')) continue;
    if (ln.startsWith('@@')) {
      flush();
      continue;
    }
    if (ln.startsWith('-')) cur.r.push(ln.slice(1).trim());
    else if (ln.startsWith('+')) cur.a.push(ln.slice(1).trim());
    else flush();
  }
  flush();
  const out = [];
  for (const b of blocks) {
    const r = b.r.filter((x) => !isNoise(x)),
      a = b.a.filter((x) => !isNoise(x));
    const n = Math.max(r.length, a.length);
    for (let i = 0; i < n; i++) {
      const o = r[i],
        nw = a[i];
      if (o && nw) {
        if (o !== nw) out.push(`Changed \`${o}\` to \`${nw}\`.`);
      } else if (o) out.push(`Removed \`${o}\`.`);
      else if (nw) out.push(`Added \`${nw}\`.`);
    }
  }
  return out;
}

function readUrl(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https:') ? https : http;
    const req = client.get(url, (res) => {
      let data = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) resolve(data);
        else reject(new Error(`HTTP ${res.statusCode}`));
      });
    });
    req.setTimeout(1000, () => {
      req.destroy(new Error('Timed out reading Storybook index'));
    });
    req.on('error', reject);
  });
}

async function readStorybookIndex() {
  if (STORYBOOK_INDEX_URL) {
    try {
      return {
        index: JSON.parse(await readUrl(STORYBOOK_INDEX_URL)),
        source: STORYBOOK_INDEX_URL,
      };
    } catch (error) {
      console.warn(`Could not read ${STORYBOOK_INDEX_URL}: ${error.message}`);
    }
  }

  return {
    index: JSON.parse(fs.readFileSync('storybook-static/index.json', 'utf8')),
    source: 'storybook-static/index.json',
  };
}

const dir = (p) => p.split('/').slice(0, -1).join('/');
const file = (p) => p.split('/').pop();
const storyDir = (entry) => {
  const storyFileDir = dir(entry.imp);
  return storyFileDir.endsWith('/stories') ? dir(storyFileDir) : storyFileDir;
};

function storyScore(scssPath, entry) {
  const scssDir = dir(scssPath);
  const baseDir = storyDir(entry);
  const title = titleOf(scssPath);
  const storyFile = file(entry.imp).toLowerCase();
  const titleSlug = title.toLowerCase();
  let score = 0;

  if (scssDir === baseDir) score = 100;
  else if (scssDir.startsWith(`${baseDir}/`)) score = 80 - scssDir.slice(baseDir.length + 1).split('/').length;
  else if (baseDir.startsWith(`${scssDir}/`)) score = 70 - baseDir.slice(scssDir.length + 1).split('/').length;
  else return 0;

  if (storyFile === `_${titleSlug}.stories.tsx`) score += 30;
  if (entry.name.toLowerCase() === 'default') score += 5;
  if (`${entry.id} ${entry.name}`.toLowerCase().includes(titleSlug)) score += 10;

  return score;
}

function storyIdFor(scssPath, entries) {
  const cands = entries
    .map((entry) => ({ entry, score: storyScore(scssPath, entry) }))
    .filter(({ score }) => score >= 70)
    .sort((a, b) => b.score - a.score);
  return cands.length ? cands[0].entry.id : undefined;
}

const titleOf = (scssPath) =>
  scssPath
    .split('/')
    .pop()
    .replace(/\.module\.scss$/, '')
    .replace(/\.scss$/, '');

async function main() {
  // --- story ids from a Storybook index (real ids, not guessed) ---
  const storybook = await readStorybookIndex();
  const entries = Object.values(storybook.index.entries || storybook.index.stories || {})
    .filter((e) => e.type !== 'docs')
    .map((e) => ({
      id: e.id,
      imp: e.importPath.replace(/^\.\//, ''),
      name: e.name || '',
      type: e.type,
    }));

  const files = execSync(`git diff --name-only ${BASE} -- 'src/**/*.scss'`, { encoding: 'utf8' })
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean)
    .filter((path) => !path.startsWith('src/common/'))
    .sort();

  const records = files.map((path) => {
    const rec = { title: titleOf(path), path };
    const sid = storyIdFor(path, entries);
    if (sid) rec.storyId = sid;
    rec.changes = changesFor(path);
    return rec;
  });

  const withStory = records.filter((r) => r.storyId).length;
  console.error(`records=${records.length}  withStory=${withStory}  live=${records.length - withStory}`);
  console.error(`storybookIndex=${storybook.source}`);

  const body = `// GENERATED by scripts/gen-css-showcase-data.mjs — do not hand-edit.
// Source of truth: \`git diff ${BASE}\` (changes) + Storybook index (storyId).

export type CssUpdateRecord = {
  title: string;
  path: string;
  changes: string[];
  storyId?: string;
};

export const cssUpdateRecords: CssUpdateRecord[] = ${JSON.stringify(records, null, 2)};
`;

  fs.writeFileSync(OUT, body);
  console.error(`wrote ${OUT}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
