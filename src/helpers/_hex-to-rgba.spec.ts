import { hexToRgba } from '@helpers/hex-to-rgba';
import { describe, expect, it } from 'vitest';

/**
 * MUI contract for `hexToRgba`: it delegates the parsing to `hexToRgb` from `@mui/system` (v5.16) and then
 * rewrites the `rgb(...)` string. These cases lock the exact output strings so a change in MUI's parser
 * (the import path, the alpha rounding, the `rgba` prefix for 4/8 digit input, or invalid-input handling)
 * goes red after the bump.
 */
describe('hexToRgba (MUI hexToRgb contract)', () => {
  describe('valid #-prefixed input', () => {
    it.each([
      ['#fff', 0.5, 'rgba(255, 255, 255,0.5)'],
      ['#abc', 1, 'rgba(170, 187, 204,1)'],
      ['#ffffff', 0.5, 'rgba(255, 255, 255,0.5)'],
      ['#000000', 0, 'rgba(0, 0, 0,0)'],
      ['#1A2b3C', 0.25, 'rgba(26, 43, 60,0.25)'],
      ['#AbCdEf', 1, 'rgba(171, 205, 239,1)'],
    ])('converts %s with alpha %s to %s', (hex, alpha, expected) => {
      expect(hexToRgba(hex, alpha)).toBe(expected);
    });

    it('expands 3-digit shorthand to the same channels as the 6-digit form', () => {
      expect(hexToRgba('#abc', 0.4)).toBe(hexToRgba('#aabbcc', 0.4));
    });

    it('is case-insensitive', () => {
      expect(hexToRgba('#ABCDEF', 0.3)).toBe(hexToRgba('#abcdef', 0.3));
    });
  });

  describe('alpha is appended verbatim (no clamping or rounding)', () => {
    it.each([
      [1.5, 'rgba(255, 0, 0,1.5)'],
      [-1, 'rgba(255, 0, 0,-1)'],
      [0.123456, 'rgba(255, 0, 0,0.123456)'],
    ])('[v5-quirk] alpha %s -> %s', (alpha, expected) => {
      // Baseline characterization: not a promised contract.
      expect(hexToRgba('#ff0000', alpha)).toBe(expected);
    });
  });

  describe('input that already carries an alpha channel', () => {
    // CURRENT BEHAVIOUR (suspected bug): MUI returns `rgba(r, g, b, a)` for 4/8-digit hex, so the 'rgb' -> 'rgba'
    // rewrite produces an invalid `rgbaa(...)` string with two alpha values.
    it.each([
      ['#ffff', 0.5, 'rgbaa(255, 255, 255, 1,0.5)'],
      ['#ff000080', 0.3, 'rgbaa(255, 0, 0, 0.502,0.3)'],
    ])('[bug-lock] %s with alpha %s -> %s', (hex, alpha, expected) => {
      // Baseline characterization: not a promised contract.
      expect(hexToRgba(hex, alpha)).toBe(expected);
    });
  });

  describe('input without a leading #', () => {
    // CURRENT BEHAVIOUR (suspected bug): MUI's hexToRgb always drops the first character, so a hex without `#`
    // loses its first digit and is re-split (5 chars -> 1-char channels).
    it.each([
      ['fff', 1, 'rgba(255, 255,1)'],
      ['ffffff', 1, 'rgba(255, 255, 255, 1, 1,1)'],
    ])('[bug-lock] %s with alpha %s -> %s', (hex, alpha, expected) => {
      // Baseline characterization: not a promised contract.
      expect(hexToRgba(hex, alpha)).toBe(expected);
    });
  });

  describe('invalid input', () => {
    it.each([
      ['', 0.5, ''],
      ['#', 0.5, ''],
    ])('[v5-quirk] empty hex %j returns an empty string', (hex, alpha, expected) => {
      // Baseline characterization: not a promised contract.
      expect(hexToRgba(hex, alpha)).toBe(expected);
    });

    // CURRENT BEHAVIOUR (suspected bug): no validation; non-hex digits yield NaN channels and odd lengths
    // yield extra channels instead of throwing.
    it.each([
      ['#ggg', 0.5, 'rgba(NaN, NaN, NaN,0.5)'],
      ['#12345', 0.5, 'rgba(17, 34, 51, 0.267, 0.333,0.5)'],
      ['#1234567', 1, 'rgbaa(18, 52, 86, 0.027,1)'],
    ])('[bug-lock] %s with alpha %s -> %s (no throw)', (hex, alpha, expected) => {
      // Baseline characterization: not a promised contract.
      expect(() => hexToRgba(hex, alpha)).not.toThrow();
      expect(hexToRgba(hex, alpha)).toBe(expected);
    });
  });
});
