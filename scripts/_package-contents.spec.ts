import { describe, expect, it } from 'vitest';
import { parseEntryExports } from './generate-agent-docs.mjs';
import { documentedExports, missingDerivedNoticeLines, missingPackageEntries } from './check-package-contents.mjs';

const complete = (names: string[]) => [
  'package/package.json',
  'package/docs/llms.txt',
  'package/skills/vanguard/SKILL.md',
  ...names.map((n) => `package/docs/components/${n}.md`),
];

describe('package contents gate (agent docs, Track 2)', () => {
  it('passes a tarball with llms.txt, the skill and one page per value export', () => {
    expect(missingPackageEntries(complete(['Button', 'Text']), ['Button', 'Text'])).toEqual([]);
  });

  it('names every missing entry', () => {
    const entries = complete(['Button']).filter((e) => !e.endsWith('llms.txt') && !e.endsWith('SKILL.md'));
    expect(missingPackageEntries(entries, ['Button', 'Text'])).toEqual([
      'package/docs/llms.txt',
      'package/skills/vanguard/SKILL.md',
      'package/docs/components/Text.md',
    ]);
  });

  it('checks every value export of src/index.ts (298 when Track 2 landed)', () => {
    expect(documentedExports('src/index.ts').size).toBeGreaterThanOrEqual(298);
  });

  it('exempts constants defined inline in the entry (no source to document, e.g. the lottieAnimation dummy)', () => {
    const names = documentedExports('src/index.ts');
    expect(parseEntryExports('src/index.ts').has('lottieAnimation')).toBe(true);
    expect(names.has('lottieAnimation')).toBe(false);
    expect(names.has('Button')).toBe(true);
  });

  it('requires the "Portions derived from" section with MUI and Popper notices (watchdog licence point)', () => {
    const full = [
      'Portions derived from',
      '@mui/material@9.5.0 (MIT)',
      'Copyright (c) 2014 Call-Em-All',
      '@popperjs/core@2.11.8 (MIT)',
      'Copyright (c) 2019 Federico Zivolo',
      'Permission is hereby granted, free of charge',
    ].join('\n');
    expect(missingDerivedNoticeLines(full)).toEqual([]);
    expect(missingDerivedNoticeLines('bundled only')).toEqual([
      'Portions derived from',
      '@mui/material@9.5.0 (MIT)',
      'Copyright (c) 2014 Call-Em-All',
      '@popperjs/core@2.11.8 (MIT)',
      'Copyright (c) 2019 Federico Zivolo',
      'Permission is hereby granted, free of charge',
    ]);
  });
});
