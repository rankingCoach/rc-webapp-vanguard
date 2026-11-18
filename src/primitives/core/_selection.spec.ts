import { describe, expect, it } from 'vitest';
import { isValueSelected, nextExclusiveValue, nextMultipleValue } from './selection';

describe('selection', () => {
  it('isValueSelected: scalar, array, empty', () => {
    expect(isValueSelected('a', 'a')).toBe(true);
    expect(isValueSelected('a', 'b')).toBe(false);
    expect(isValueSelected('a', ['b', 'a'])).toBe(true);
    expect(isValueSelected('a', null)).toBe(false);
    expect(isValueSelected(undefined, undefined)).toBe(false);
  });

  it('nextExclusiveValue: clicked value, or null when clicking the selected one', () => {
    expect(nextExclusiveValue('a', 'b')).toBe('b');
    expect(nextExclusiveValue('a', 'a')).toBeNull();
    expect(nextExclusiveValue(null, 'a')).toBe('a');
  });

  it('nextMultipleValue: toggles membership without mutating; non-array starts a new one', () => {
    const value = ['a'];
    expect(nextMultipleValue(value, 'b')).toEqual(['a', 'b']);
    expect(nextMultipleValue(value, 'a')).toEqual([]);
    expect(value).toEqual(['a']);
    expect(nextMultipleValue(null, 'c')).toEqual(['c']);
  });
});
