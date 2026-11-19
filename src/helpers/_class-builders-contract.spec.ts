import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { cx } from '../primitives/react/class-names';
import { classNames } from './classNames';

/**
 * Track (h), decided by the watchdog: two class builders with two contracts, on purpose. Do not unify them.
 * - `classNames` (public API, rc-webapp imports it): drops non-string / empty entries, but every all-string call
 *   stays byte-identical to the former plain join, so an internal double space inside a string argument is KEPT.
 * - `cx` (internal, own-core MUI markup, never exported): clsx semantics, every part split on whitespace, so the
 *   same input COLLAPSES to single spaces.
 */
describe('class builders: two contracts', () => {
  it('same input with an internal double space: classNames keeps it, cx collapses it', () => {
    expect(classNames('a  b', 'c')).toBe('a  b c');
    expect(cx('a  b', 'c')).toBe('a b c');
  });

  it('both drop junk entries', () => {
    expect(classNames('a', false as unknown as string, undefined, null, '', 'b')).toBe('a b');
    expect(cx('a', false, undefined, null, '', 'b')).toBe('a b');
  });

  it('cx is not a public export (neither package entry re-exports it)', () => {
    for (const entry of ['../index.ts', '../index-wordpress.ts']) {
      const source = readFileSync(join(__dirname, entry), 'utf8');
      expect(source, entry).not.toMatch(/\bcx\b|primitives\/react\/class-names/);
    }
  });
});
