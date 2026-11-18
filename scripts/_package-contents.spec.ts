import { describe, expect, it } from 'vitest';
import { parseEntryExports } from './generate-agent-docs.mjs';
import { missingPackageEntries } from './check-package-contents.mjs';

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
    expect(parseEntryExports('src/index.ts').size).toBeGreaterThanOrEqual(298);
  });
});
