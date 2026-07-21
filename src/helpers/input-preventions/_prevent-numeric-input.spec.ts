import { describe, expect, test } from 'vitest';

import { isBlockedNumericKey, numericPasteIsInvalid } from './prevent-numeric-input';

const state = (value = '', badInput = false) => ({ value, validity: { badInput } });

describe('prevent-numeric-input', () => {
  /**
   * FN: isBlockedNumericKey
   * -------------------------------------------------------------------------------------------------------------------
   */
  test('blocks e / E always (scientific notation)', () => {
    expect(isBlockedNumericKey('e', state('12'))).toBe(true);
    expect(isBlockedNumericKey('E', state(''))).toBe(true);
  });

  test('allows a leading sign into an empty field', () => {
    expect(isBlockedNumericKey('-', state(''))).toBe(false);
    expect(isBlockedNumericKey('+', state(''))).toBe(false);
  });

  test('blocks a sign when the field already has a value (non-leading)', () => {
    expect(isBlockedNumericKey('-', state('12'))).toBe(true);
    expect(isBlockedNumericKey('+', state('12'))).toBe(true);
  });

  test('blocks a second sign while badInput (a lone "-" reports value="")', () => {
    // native reports value === "" for an intermediate lone "-", so use badInput
    expect(isBlockedNumericKey('-', state('', true))).toBe(true);
  });

  test('allows digits and decimal point', () => {
    expect(isBlockedNumericKey('5', state('12'))).toBe(false);
    expect(isBlockedNumericKey('.', state('12'))).toBe(false);
  });

  /**
   * FN: numericPasteIsInvalid
   * -------------------------------------------------------------------------------------------------------------------
   */
  test('rejects scientific-notation chars anywhere', () => {
    expect(numericPasteIsInvalid('12e3', '')).toBe(true);
    expect(numericPasteIsInvalid('1E5', '')).toBe(true);
  });

  test('rejects a non-leading sign', () => {
    expect(numericPasteIsInvalid('4+1', '')).toBe(true);
    expect(numericPasteIsInvalid('4-1', '')).toBe(true);
  });

  test('accepts a clean numeric paste regardless of current value', () => {
    expect(numericPasteIsInvalid('123', '')).toBe(false);
    expect(numericPasteIsInvalid('12.5', '')).toBe(false);
    expect(numericPasteIsInvalid('99', '50')).toBe(false);
  });

  test('accepts a leading-sign paste into an empty field', () => {
    expect(numericPasteIsInvalid('-5', '')).toBe(false);
    expect(numericPasteIsInvalid('+5', '')).toBe(false);
  });

  test('rejects a leading-sign paste when the field already has content (would append: -2 + "+3" = -2+3)', () => {
    expect(numericPasteIsInvalid('+3', '-2')).toBe(true);
    expect(numericPasteIsInvalid('-3', '50')).toBe(true);
  });

  test('trims surrounding whitespace before checking', () => {
    expect(numericPasteIsInvalid('  -5  ', '')).toBe(false);
    expect(numericPasteIsInvalid('  12e3 ', '')).toBe(true);
  });
});