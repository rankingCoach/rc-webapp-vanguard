import { afterEach, describe, expect, it, vi } from 'vitest';
import { sxToStyle } from './sx-compat';

afterEach(() => vi.restoreAllMocks());

describe('sxToStyle', () => {
  it('maps a flat CSS object to inline style', () => {
    expect(sxToStyle({ width: 10, color: 'red' }, 'X')).toEqual({ width: 10, color: 'red' });
    expect(sxToStyle(undefined, 'X')).toBeUndefined();
  });

  it('ignores theme callbacks, arrays, nested values and spacing shorthand with a warning', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    expect(sxToStyle(() => ({}), 'X')).toBeUndefined();
    expect(sxToStyle([{ color: 'red' }], 'X')).toBeUndefined();
    expect(sxToStyle({ m: 1, '&:hover': { color: 'red' }, color: 'blue' }, 'X')).toEqual({ color: 'blue' });
    expect(warn).toHaveBeenCalledTimes(4);
  });
});
