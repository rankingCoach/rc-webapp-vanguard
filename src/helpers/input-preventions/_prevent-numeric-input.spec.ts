import { describe, expect, test } from 'vitest';

import { classifyNumericInsertion, isBlockedNumericKey, NumericFieldState } from './prevent-numeric-input';

const state = (value = '', badInput = false): NumericFieldState => ({ value, badInput });
const VERIFY = 'allow-verify';

describe('prevent-numeric-input', () => {
  /**
   * FN: isBlockedNumericKey
   * -------------------------------------------------------------------------------------------------------------------
   */
  test('blocks e / E (scientific notation)', () => {
    expect(isBlockedNumericKey('e')).toBe(true);
    expect(isBlockedNumericKey('E')).toBe(true);
  });

  test('leaves signs, digits, decimal point and unidentified mobile/IME keys to beforeinput', () => {
    expect(isBlockedNumericKey('-')).toBe(false);
    expect(isBlockedNumericKey('+')).toBe(false);
    expect(isBlockedNumericKey('.')).toBe(false);
    expect(isBlockedNumericKey('5')).toBe(false);
    expect(isBlockedNumericKey('Unidentified')).toBe(false);
    expect(isBlockedNumericKey('Process')).toBe(false);
  });

  /**
   * FN: classifyNumericInsertion
   * -------------------------------------------------------------------------------------------------------------------
   */
  test('blocks e / E anywhere in the inserted text', () => {
    expect(classifyNumericInsertion('e', state('12'))).toBe('block');
    expect(classifyNumericInsertion('E', state())).toBe('block');
    expect(classifyNumericInsertion('1e5', state())).toBe('block');
    expect(classifyNumericInsertion('12e3', state('5'))).toBe('block');
    expect(classifyNumericInsertion('  12e3 ', state())).toBe('block');
  });

  test('allows text without a sign (digits, decimal point), also while badInput', () => {
    expect(classifyNumericInsertion('5', state('12'))).toBe('allow');
    expect(classifyNumericInsertion('.', state('12'))).toBe('allow');
    expect(classifyNumericInsertion('12.5', state())).toBe('allow');
    expect(classifyNumericInsertion('3', state('', true))).toBe('allow');
    expect(classifyNumericInsertion(' ', state('1'))).toBe('allow');
  });

  test('allows null / empty data', () => {
    expect(classifyNumericInsertion(null, state('12'))).toBe('allow');
    expect(classifyNumericInsertion('', state())).toBe('allow');
  });

  test('blocks an inner sign or more than one sign', () => {
    expect(classifyNumericInsertion('4+1', state())).toBe('block');
    expect(classifyNumericInsertion('4-1', state('2'))).toBe('block');
    expect(classifyNumericInsertion('--3', state())).toBe('block');
    expect(classifyNumericInsertion('-3-', state())).toBe('block');
    expect(classifyNumericInsertion('+-', state())).toBe('block');
  });

  test('blocks a leading sign while badInput (a lone "-" reports value="")', () => {
    expect(classifyNumericInsertion('-', state('', true))).toBe('block');
    expect(classifyNumericInsertion('+', state('', true))).toBe('block');
    expect(classifyNumericInsertion('-3', state('', true))).toBe('block');
  });

  test('allows a leading sign into an empty field', () => {
    expect(classifyNumericInsertion('-', state())).toBe('allow');
    expect(classifyNumericInsertion('+', state())).toBe('allow');
    expect(classifyNumericInsertion('-5', state())).toBe('allow');
    expect(classifyNumericInsertion('+5', state())).toBe('allow');
    expect(classifyNumericInsertion('  -5  ', state())).toBe('allow');
  });

  test('allows a single sign into a non-empty value (replaces a selection or goes before the digits)', () => {
    expect(classifyNumericInsertion('-', state('5'))).toBe('allow');
    expect(classifyNumericInsertion('+', state('12'))).toBe('allow');
    expect(classifyNumericInsertion('-', state('-5'))).toBe('allow');
  });

  test('verifies a signed number inserted into a non-empty value', () => {
    expect(classifyNumericInsertion('-3', state('5'))).toBe(VERIFY);
    expect(classifyNumericInsertion('+3', state('-2'))).toBe(VERIFY);
    expect(classifyNumericInsertion('-3', state('12'))).toBe(VERIFY);
  });
});
