import { describe, expect, it } from 'vitest';
import { mergeRippleOrder, rippleGeometry } from './ripple';

const rect = { left: 10, top: 20, width: 100, height: 40 };

describe('rippleGeometry (MUI TouchRipple parity)', () => {
  it('centered: odd sqrt((2w²+h²)/3) diameter at the centre', () => {
    const g = rippleGeometry({ rect, center: true, clientWidth: 100, clientHeight: 40 });
    expect(g.x).toBe(50);
    expect(g.y).toBe(20);
    expect(g.size).toBeCloseTo(Math.sqrt((2 * 100 ** 2 + 40 ** 2) / 3));
  });

  it('pointer: covers the farthest corner from the press point', () => {
    const g = rippleGeometry({ rect, center: false, clientX: 30, clientY: 30, clientWidth: 100, clientHeight: 40 });
    expect(g.x).toBe(20);
    expect(g.y).toBe(10);
    const sx = Math.max(Math.abs(100 - 20), 20) * 2 + 2;
    const sy = Math.max(Math.abs(40 - 10), 10) * 2 + 2;
    expect(g.size).toBeCloseTo(Math.sqrt(sx ** 2 + sy ** 2));
  });

  it('a keyboard-originated (0,0) press falls back to the centre', () => {
    const g = rippleGeometry({ rect, center: false, clientX: 0, clientY: 0, clientWidth: 100, clientHeight: 40 });
    expect(g.x).toBe(50);
    expect(g.y).toBe(20);
  });
});

describe('mergeRippleOrder (MUI parity)', () => {
  it('a new active ripple goes before the trailing exiting ones; exiting ones in between keep their place', () => {
    expect(mergeRippleOrder([1], [2])).toEqual([2, 1]);
    expect(mergeRippleOrder([1, 2, 3], [2, 4])).toEqual([1, 2, 4, 3]);
    expect(mergeRippleOrder([], [5])).toEqual([5]);
  });
});
