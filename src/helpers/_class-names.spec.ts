import { describe, expect, it } from 'vitest';
import { classNames } from './classNames';

/**
 * Track (h): `classNames` drops non-string and empty / whitespace-only entries and nothing else. For every input
 * without such entries its output is byte-identical to the former plain `args.join(' ')` (inlined here as the
 * reference), so every existing all-string call renders exactly as before; order is kept.
 */
const legacy = (...args: unknown[]) => args.join(' ');

// Deterministic pseudo-random inputs (mulberry32), so a failure is reproducible.
const rng = (seed: number) => () => {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const TOKENS = [
  'a',
  'btn',
  'Mui-disabled',
  'root_oG',
  '_chip_ec9e72',
  'vg-typography-vanguard',
  'mt-2',
  'x1',
  'Form-container',
  'icon-left',
  'π',
  'false-positive',
  'undefinedish',
  'nullable',
  'NaNa',
  'truecolor',
];

describe('classNames', () => {
  it('is byte-identical to the former join for every junk-free input (2000 random calls, 0–8 args)', () => {
    const next = rng(1234);
    for (let n = 0; n < 2000; n++) {
      const args = Array.from({ length: Math.floor(next() * 9) }, () => {
        // An entry is one real token or several separated by single spaces (e.g. `${styles.a} ${styles.b}`).
        const count = 1 + Math.floor(next() * 3);
        return Array.from({ length: count }, () => TOKENS[Math.floor(next() * TOKENS.length)]).join(' ');
      });
      expect(classNames(...args)).toBe(legacy(...args));
    }
  });

  it('keeps every real token, in order, including words that merely contain junk words', () => {
    expect(classNames('a', 'false-positive', 'undefinedish', 'b')).toBe('a false-positive undefinedish b');
    expect(classNames('Mui-root MuiChip-root', 'x')).toBe('Mui-root MuiChip-root x');
  });

  it('drops non-string and empty / whitespace-only entries only', () => {
    const junk = [false, true, undefined, null, Number.NaN, 0, '', ' ', '   '] as unknown[];
    for (const j of junk) {
      expect(classNames('a', j as string, 'b')).toBe('a b');
      expect(classNames(j as string, 'a')).toBe('a');
      expect(classNames('a', j as string)).toBe('a');
      expect(classNames(j as string)).toBe('');
    }
    expect(classNames()).toBe('');
    expect(classNames('root_oG', false as unknown as string)).toBe('root_oG');
    expect(classNames('Form-container', undefined)).toBe('Form-container');
  });

  it('never yields a junk token, a double space or a leading/trailing space', () => {
    const next = rng(99);
    const pool: unknown[] = [...TOKENS, false, true, undefined, null, Number.NaN, '', ' '];
    for (let n = 0; n < 1000; n++) {
      const args = Array.from({ length: Math.floor(next() * 10) }, () => pool[Math.floor(next() * pool.length)]);
      const out = classNames(...(args as string[]));
      expect(out).not.toMatch(/(^|\s)(false|true|undefined|null|NaN)(\s|$)|\s{2,}|^\s|\s$/);
      expect(out.split(' ').filter(Boolean)).toEqual(
        args.filter((x): x is string => typeof x === 'string' && x.trim() !== ''),
      );
    }
  });
});
