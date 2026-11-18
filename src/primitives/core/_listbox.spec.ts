import { describe, expect, it } from 'vitest';
import { createListTypeahead, nextListIndex } from './listbox';

const items = [{ text: 'Apple' }, { text: 'Banana', disabled: true }, { text: 'Blueberry' }, { text: 'Cherry' }];

describe('nextListIndex (MUI MenuList roving parity)', () => {
  it('ArrowDown/Up skip disabled; no wrap when wrap=false', () => {
    expect(nextListIndex(items, 0, 'ArrowDown', { wrap: false })).toBe(2);
    expect(nextListIndex(items, 3, 'ArrowDown', { wrap: false })).toBe(3);
    expect(nextListIndex(items, 0, 'ArrowUp', { wrap: false })).toBe(0);
    expect(nextListIndex(items, 3, 'ArrowDown', { wrap: true })).toBe(0);
  });

  it('Home/End go to the first/last focusable; other keys return null', () => {
    expect(nextListIndex(items, 2, 'Home', { wrap: false })).toBe(0);
    expect(nextListIndex(items, 0, 'End', { wrap: false })).toBe(3);
    expect(nextListIndex(items, 0, 'x', { wrap: false })).toBeNull();
  });
});

describe('createListTypeahead (MUI MenuList text criteria)', () => {
  it('repeating first letter cycles; a different letter switches to prefix mode; 500ms resets', () => {
    const t = createListTypeahead();
    expect(t.type('b', items, 0, 0)).toBe(2);
    expect(t.type('b', items, 2, 100)).toBe(2);
    expect(t.type('c', items, 2, 700)).toBe(3);
    const u = createListTypeahead();
    expect(u.type('a', items, 3, 0)).toBe(0);
    expect(u.type('z', items, 0, 50)).toBeNull();
  });
});
