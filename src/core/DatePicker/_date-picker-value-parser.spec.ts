/**
 * Unit tests for datePickerValueParser (DatePicker's internal value -> string mapping).
 * Not MUI-facing; split out of _DatePicker.mui.spec.tsx.
 */
import moment from 'moment';
import { describe, expect, test } from 'vitest';

import { datePickerValueParser } from './date-picker-value-parser';

describe('datePickerValueParser', () => {
  test.each([
    ['undefined', undefined, undefined],
    ['null', null, undefined],
    ['number', 1710453600000, '1710453600000'],
    ['string', '2024-03-15', '2024-03-15'],
    ['boolean', true, 'true'],
    ['bigint', BigInt(5), '5'],
    ['function', () => 1, undefined],
    ['symbol', Symbol('x'), undefined],
  ])('%s', (_name, input, expected) => {
    expect(datePickerValueParser(input)).toBe(expected);
  });

  test('[bug-lock] a moment is formatted as "MM/DD/yyyy " (trailing space) regardless of locale', () => {
    // Baseline characterization: not a promised contract.
    // CURRENT BEHAVIOUR (suspected bug): formatDate builds `MM/DD/yyyy ${''}`, leaving a trailing space.
    expect(datePickerValueParser(moment(new Date(2024, 2, 15).getTime()))).toBe('03/15/2024 ');
  });

  test('a non-moment object throws', () => {
    expect(() => datePickerValueParser({})).toThrow('Object detected');
  });
});
