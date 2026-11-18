import { describe, expect, it } from 'vitest';
import { autosizeHeight } from './autosize';

/** MUI TextareaAutosize height maths (parity). */
describe('autosizeHeight', () => {
  const base = { singleRowHeight: 24, padding: 0, border: 0, boxSizing: 'content-box' as const };

  it('grows with content between minRows and maxRows', () => {
    expect(autosizeHeight({ ...base, innerHeight: 72, minRows: 1 })).toEqual({
      outerHeightStyle: 72,
      overflowing: true,
    });
    expect(autosizeHeight({ ...base, innerHeight: 24, minRows: 3 })).toEqual({
      outerHeightStyle: 72,
      overflowing: false,
    });
    expect(autosizeHeight({ ...base, innerHeight: 240, minRows: 1, maxRows: 4 })).toEqual({
      outerHeightStyle: 96,
      overflowing: false,
    });
  });

  it('never below one row; border-box adds padding + border', () => {
    expect(autosizeHeight({ ...base, innerHeight: 0, minRows: 0 })).toEqual({
      outerHeightStyle: 24,
      overflowing: false,
    });
    expect(
      autosizeHeight({ ...base, boxSizing: 'border-box', padding: 10, border: 2, innerHeight: 48, minRows: 1 }),
    ).toEqual({
      outerHeightStyle: 60,
      overflowing: true,
    });
  });
});
