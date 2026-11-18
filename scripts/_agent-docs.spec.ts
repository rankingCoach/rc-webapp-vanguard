import { mkdtempSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

// @ts-expect-error: plain .mjs generator without type declarations
import { generate, parseEntryExports, scrapeSlots } from './generate-agent-docs.mjs';

/**
 * docs/ is build output of scripts/generate-agent-docs.mjs (gitignored, shipped in the tarball). This spec generates it
 * into temp directories and checks determinism and the content rules; skills/vanguard/SKILL.md is hand-written.
 */
const root = resolve(__dirname, '..');

const listFiles = (dir: string): string[] =>
  readdirSync(dir, { recursive: true, withFileTypes: true })
    .filter((d) => d.isFile())
    .map((d) => join(d.parentPath, d.name).slice(dir.length + 1))
    .sort();

let fresh = '';
let second = '';
let sources: Record<string, string> = {};

beforeAll(() => {
  fresh = mkdtempSync(join(tmpdir(), 'vg-agent-docs-'));
  second = mkdtempSync(join(tmpdir(), 'vg-agent-docs-'));
  sources = generate(fresh).sources;
  generate(second);
}, 120_000);

afterAll(() => {
  rmSync(fresh, { recursive: true, force: true });
  rmSync(second, { recursive: true, force: true });
});

describe('agent docs (docs/)', () => {
  it('are deterministic (two runs are byte-identical)', () => {
    const a = listFiles(fresh);
    expect(listFiles(second)).toEqual(a);
    for (const f of a) expect(readFileSync(join(second, f), 'utf8'), f).toBe(readFileSync(join(fresh, f), 'utf8'));
  });

  it('link every page from llms.txt and every link resolves', () => {
    const llms = readFileSync(join(fresh, 'llms.txt'), 'utf8');
    const links = [...llms.matchAll(/\]\((components\/[^)]+\.md)\)/g)].map((m) => m[1]).sort();
    const pages = listFiles(join(fresh, 'components')).map((f) => `components/${f}`);
    expect(links).toEqual(pages);
  });

  it('give every PascalCase value export of src/index.ts that is a component a page', () => {
    const exported = [...parseEntryExports(join(root, 'src', 'index.ts'))] as string[];
    const pages = new Set(listFiles(join(fresh, 'components')).map((f) => f.replace(/\.md$/, '')));
    for (const name of ['Text', 'Button', 'Input', 'Select', 'Switch', 'Form', 'Modal', 'DataTable', 'useFormStore']) {
      expect(exported, name).toContain(name);
      expect(pages.has(name), name).toBe(true);
    }
  });

  it('name only slots that exist in the component source', () => {
    for (const f of listFiles(join(fresh, 'components'))) {
      const md = readFileSync(join(fresh, 'components', f), 'utf8');
      const slotLine = md.match(/^Slots: (.*)$/m);
      if (!slotLine) continue;
      const source = sources[f.replace(/\.md$/, '')];
      const real = new Set(scrapeSlots(join(root, source)).slots);
      for (const m of slotLine[1].matchAll(/data-slot="([a-z0-9-]+)"/g)) expect(real.has(m[1]), `${f}: ${m[1]}`).toBe(true);
    }
  });

  it('contain no local paths, e-mail addresses or internal hostnames; examples stay short', () => {
    for (const f of listFiles(fresh)) {
      const text = readFileSync(join(fresh, f), 'utf8');
      expect(text, f).not.toMatch(/\/Users\/|\/home\/|[A-Z]:\\/);
      expect(text, f).not.toMatch(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/);
      expect(text, f).not.toMatch(/\b[a-z0-9.-]*rankingcoach\.(?:com|de|net|io|local)\b/i);
      for (const block of text.matchAll(/```tsx\n([\s\S]*?)```/g)) {
        expect(block[1].split('\n').length, `${f} example`).toBeLessThanOrEqual(41);
        expect(block[1], `${f} example`).not.toMatch(/from\s+['"]\.|storybook|play:|expect\(/);
      }
      expect(text, f).not.toMatch(/\bsrc\//);
    }
  });

  it('are not imported by any source file (no runtime or bundle change)', () => {
    const offenders = listFiles(join(root, 'src'))
      .filter((f) => /\.(tsx?|jsx?|s?css)$/.test(f))
      .filter((f) => /from\s+['"][^'"]*\/(docs|skills)\//.test(readFileSync(join(root, 'src', f), 'utf8')));
    expect(offenders).toEqual([]);
  });
});

describe('skills/vanguard/SKILL.md', () => {
  const skill = readFileSync(join(root, 'skills', 'vanguard', 'SKILL.md'), 'utf8');

  it('has the skill frontmatter', () => {
    expect(skill).toMatch(/^---\nname: vanguard\ndescription: .+\n---\n/);
  });

  it('only names exports that exist and pages that exist', () => {
    const exported = parseEntryExports(join(root, 'src', 'index.ts')) as Set<string>;
    const named = new Set(
      [...skill.matchAll(/`(?:<)?([A-Z][A-Za-z0-9]+|use[A-Z][A-Za-z0-9]+|snackbarService)\b/g)].map((m) => m[1]),
    );
    const notExports = new Set(['Values', 'Name', 'Mui']);
    for (const n of named) if (!notExports.has(n)) expect(exported.has(n), n).toBe(true);
    for (const m of skill.matchAll(/docs\/components\/([A-Za-z0-9]+)\.md/g)) {
      expect(listFiles(join(fresh, 'components')), m[1]).toContain(`${m[1]}.md`);
    }
  });
});
