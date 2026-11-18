import { describe, expect, it } from 'vitest';
import { areEqualValues, canCycleRepeatedCharacter, createTypeahead, getMatchingOptionIndex } from './typeahead';

const opts = ['apple', 'apricot', 'banana', 'blueberry', 'cherry'].map((label) => ({ label, value: label }));

describe('typeahead (MUI Select closed-typeahead parity)', () => {
  it('areEqualValues: objects by identity, primitives by string', () => {
    const o = {};
    expect(areEqualValues(o, o)).toBe(true);
    expect(areEqualValues({}, {})).toBe(false);
    expect(areEqualValues(7, '7')).toBe(true);
  });

  it('getMatchingOptionIndex: prefix match from a start index, wrapping', () => {
    expect(getMatchingOptionIndex(opts, 'b')).toBe(2);
    expect(getMatchingOptionIndex(opts, 'b', 3)).toBe(3);
    expect(getMatchingOptionIndex(opts, 'a', 4)).toBe(0);
    expect(getMatchingOptionIndex(opts, 'z')).toBe(-1);
    expect(getMatchingOptionIndex([], 'a')).toBe(-1);
  });

  it('canCycleRepeatedCharacter: false when a label starts with the doubled key', () => {
    expect(canCycleRepeatedCharacter(opts, 'a')).toBe(true);
    expect(canCycleRepeatedCharacter([{ label: 'aa', value: 1 }], 'a')).toBe(false);
  });

  it('session: builds a buffer, cycles on a repeated key, resets', () => {
    const t = createTypeahead();
    expect(t.type('b', opts, -1)).toBe(2);
    expect(t.type('l', opts, -1)).toBe(3);
    t.reset();
    expect(t.type('a', opts, 0)).toBe(1);
    expect(t.type('a', opts, 0)).toBe(0);
    t.reset();
    expect(t.type('z', opts, -1)).toBe(-1);
  });
});
