#!/usr/bin/env node
// Package gate (Track 2): the packed tarball must ship docs/llms.txt, skills/vanguard/SKILL.md and one
// docs/components/<Name>.md per value export of src/index.ts. Usage: node scripts/check-package-contents.mjs <tgz>
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseEntryExports } from './generate-agent-docs.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/**
 * Value exports that get a docs page: every name the entry exports (generator's parseEntryExports) except constants
 * defined inline in the entry itself (backward-compat dummies such as `lottieAnimation`, no source to document).
 */
export const documentedExports = (entryFile) => {
  const names = parseEntryExports(entryFile);
  const src = fs.readFileSync(entryFile, 'utf8');
  for (const m of src.matchAll(/export\s+(?:const|function|class)\s+([A-Za-z0-9_$]+)/g)) names.delete(m[1]);
  return names;
};

/** Lines the "Portions derived from" section of THIRD_PARTY_NOTICES.txt must contain (licence of ported code). */
export const DERIVED_NOTICE_LINES = [
  'Portions derived from',
  '@mui/material@9.5.0 (MIT)',
  'Copyright (c) 2014 Call-Em-All',
  '@popperjs/core@2.11.8 (MIT)',
  'Copyright (c) 2019 Federico Zivolo',
  'Permission is hereby granted, free of charge',
];

export const missingDerivedNoticeLines = (text) => DERIVED_NOTICE_LINES.filter((line) => !text.includes(line));

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
  const names = documentedExports(path.join(ROOT, 'src/index.ts'));
  const missing = missingPackageEntries(entries, names);
  for (const notices of ['package/dist/THIRD_PARTY_NOTICES.txt', 'package/dist-wordpress/THIRD_PARTY_NOTICES.txt']) {
    if (!entries.includes(notices)) {
      missing.push(notices);
      continue;
    }
    const text = execFileSync('tar', ['-xOzf', tgz, notices], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
    for (const line of missingDerivedNoticeLines(text)) missing.push(`${notices}: ${line}`);
  }
  if (missing.length > 0) {
    console.error(`package contents: ${missing.length} missing\n${missing.join('\n')}`);
    process.exit(1);
  }
  console.log(
    `package contents: llms.txt, SKILL.md, ${names.size} component pages and the derived-code notices (both bundles) present`,
  );
}
