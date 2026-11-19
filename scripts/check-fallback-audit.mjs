#!/usr/bin/env node
/**
 * Plan §36.4 gate 3.1 / §36.5: shared test setup preloads no lazy MUI fallback route. Specs and stories that
 * deliberately render a MUI route preload explicitly (`preloadMuiFallbacks`). This check asserts the
 * set of files that preload equals the checked-in allow-list (agentic-plans/mui-upgrade-gates/
 * fallback-audit-allowlist.json: file → reason). Together with a green full spec run that is the reachability audit:
 * any other spec reaching a lazy route renders empty and fails.
 *
 * Usage: node scripts/check-fallback-audit.mjs
 */
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const listPath = path.join(root, 'agentic-plans/mui-upgrade-gates/fallback-audit-allowlist.json');
const allow = JSON.parse(fs.readFileSync(listPath, 'utf8'));

const walk = (dir, out = []) => {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (/\.(spec|test)\.tsx?$|\.stories\.tsx$/.test(e.name)) out.push(p);
  }
  return out;
};
const preloading = walk(path.join(root, 'src'))
  .filter((f) => /preloadMuiFallbacks\s*\(/.test(fs.readFileSync(f, 'utf8')))
  .map((f) => path.relative(root, f))
  .sort();

const unexpected = preloading.filter((f) => !(f in allow));
const stale = Object.keys(allow).filter((f) => !preloading.includes(f));
const noReason = Object.entries(allow).filter(([, r]) => typeof r !== 'string' || r.trim().length < 10);
const sharedPreloads = ['src/test-utils/vitest.setup.tsx', '.storybook/vitest.setup.ts'].filter((file) =>
  fs.readFileSync(path.join(root, file), 'utf8').split('\n').some(
    (line) => !/^\s*(\/\/|\*)/.test(line) && /\bpreloadMuiFallbacks\b/.test(line),
  ),
);
console.log(
  `fallback audit: ${preloading.length} files preload MUI fallbacks, ${Object.keys(allow).length} allow-listed, ` +
    `${unexpected.length} unexpected, ${stale.length} stale, ${noReason.length} without a reason`,
);
for (const f of unexpected) console.log(`  UNEXPECTED preload (needs an allow-list reason or a modelled prop): ${f}`);
for (const f of stale) console.log(`  STALE allow-list entry: ${f}`);
for (const [f] of noReason) console.log(`  NO REASON: ${f}`);
for (const f of sharedPreloads) console.log(`  GLOBAL preload (move to the tests or stories that need it): ${f}`);
process.exit(unexpected.length || stale.length || noReason.length || sharedPreloads.length ? 1 : 0);
