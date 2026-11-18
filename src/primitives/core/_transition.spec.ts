import { describe, expect, it } from 'vitest';
import { autoHeightDuration, GROW_HIDDEN_TRANSFORM, growTransition } from './transition';

describe('transition (MUI Grow parity)', () => {
  it('autoHeightDuration matches MUI for the 252px Select menu and caps at 3000', () => {
    expect(autoHeightDuration(252)).toBe(298);
    expect(autoHeightDuration(0)).toBe(0);
    expect(autoHeightDuration(10_000_000)).toBe(3000);
  });

  it('growTransition: enter and exit strings as MUI sets them inline', () => {
    expect(growTransition('enter', 252)).toBe(
      'opacity 298ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,transform 198ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
    );
    expect(growTransition('exit', 252)).toBe(
      'opacity 298ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,transform 198ms cubic-bezier(0.4, 0, 0.2, 1) 99ms',
    );
    expect(GROW_HIDDEN_TRANSFORM).toBe('scale(0.75, 0.5625)');
  });
});
