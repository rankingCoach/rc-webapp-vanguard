#!/usr/bin/env node
// Package gate (Track 2): the packed tarball must ship docs/llms.txt, skills/vanguard/SKILL.md and one
// docs/components/<Name>.md per value export of src/index.ts. Usage: node scripts/check-package-contents.mjs <tgz>
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseEntryExports } from './generate-agent-docs.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/** Required tarball entries that are absent, in a stable order (llms.txt, skill, then pages by export order). */
export const missingPackageEntries = (entries, exportNames) => {
  const present = new Set(entries.map((e) => e.replace(/\/$/, '')));
  const required = [
    'package/docs/llms.txt',
    'package/skills/vanguard/SKILL.md',
    ...[...exportNames].map((n) => `package/docs/components/${n}.md`),
  ];
  return required.filter((e) => !present.has(e));
};

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const tgz = process.argv[2];
  if (!tgz) {
    console.error('usage: check-package-contents.mjs <tgz>');
    process.exit(2);
  }
  const entries = execFileSync('tar', ['-tzf', tgz], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })
    .split('\n')
    .filter(Boolean);
  const names = parseEntryExports(path.join(ROOT, 'src/index.ts'));
  const missing = missingPackageEntries(entries, names);
  if (missing.length > 0) {
    console.error(`package contents: ${missing.length} missing\n${missing.join('\n')}`);
    process.exit(1);
  }
  console.log(`package contents: llms.txt, SKILL.md and ${names.size} component pages present`);
}
