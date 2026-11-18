import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import postcss from 'postcss';
import { describe, expect, it } from 'vitest';
import { appendMuiCompat, compileMuiCompat, MUI_COMPAT_MARKER } from '../config/mui-compat-last';

/**
 * D15 build guard: the CSS ported from MUI's emotion output wins/loses equal-specificity ties by POSITION, so it
 * must be the last block of vanguard.css in both bundles, and no compat rule may also appear earlier (a component
 * importing a compat partial would put a copy in the import-order part and silently change the ties).
 */
const selectorsOf = (css: string) => {
  const out = new Set<string>();
  postcss.parse(css).walkRules((rule) => {
    const atParent = rule.parent?.type === 'atrule' ? `@${(rule.parent as postcss.AtRule).params} ` : '';
    out.add(atParent + rule.selector.replace(/\s+/g, ' '));
  });
  return out;
};

describe('appendMuiCompat', () => {
  const bundle = () => ({
    'vanguard.css': { type: 'asset', fileName: 'vanguard.css', source: '.skin{color:red}\n' },
    'index.js': { type: 'chunk', fileName: 'index.js' },
  });

  it('appends after everything else, behind the marker', () => {
    const b = bundle() as never as Parameters<typeof appendMuiCompat>[0];
    expect(appendMuiCompat(b, '.compat{color:blue}')).toBe(true);
    expect((b['vanguard.css'] as { source: string }).source).toBe(
      `.skin{color:red}\n${MUI_COMPAT_MARKER}\n.compat{color:blue}`,
    );
  });

  it('refuses to append twice and is a no-op without vanguard.css', () => {
    const b = bundle() as never as Parameters<typeof appendMuiCompat>[0];
    appendMuiCompat(b, '.compat{}');
    expect(() => appendMuiCompat(b, '.compat{}')).toThrow(/already contains/);
    expect(appendMuiCompat({} as never, '.x{}')).toBe(false);
  });
});

describe.each([
  ['default', 'dist/vanguard.css'],
  ['WordPress', 'dist-wordpress/vanguard.css'],
])('built %s vanguard.css (D15 order)', (_name, file) => {
  const path = resolve(__dirname, '..', file);
  const built = existsSync(path);

  it.skipIf(!built)('ends with exactly one compat block, identical to src/styles/mui-compat.scss', () => {
    const css = readFileSync(path, 'utf8');
    const parts = css.split(MUI_COMPAT_MARKER);
    expect(parts).toHaveLength(2);
    expect(parts[1].trim()).toBe(compileMuiCompat(true).trim());
  });

  it.skipIf(!built)('has no compat rule in the import-order part before it', () => {
    const [before, compat] = readFileSync(path, 'utf8').split(MUI_COMPAT_MARKER);
    const early = [...selectorsOf(compat)].filter((s) => selectorsOf(before).has(s));
    expect(early).toEqual([]);
  });
});
