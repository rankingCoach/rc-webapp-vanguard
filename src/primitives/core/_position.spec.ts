import { describe, expect, it } from 'vitest';
import { popoverPosition } from './position';

const viewport = { width: 1000, height: 800 };
const anchor = { top: 100, left: 200, width: 300, height: 56 };

describe('popoverPosition (MUI Popover parity)', () => {
  it('Select defaults: anchor bottom-centre, transform top-centre', () => {
    const p = popoverPosition({
      anchorRect: anchor,
      element: { width: 300, height: 200 },
      anchorOrigin: { vertical: 'bottom', horizontal: 'center' },
      transformOrigin: { vertical: 'top', horizontal: 'center' },
      viewport,
      marginThreshold: 16,
    });
    expect(p).toEqual({ top: '156px', left: '200px', transformOrigin: '150px 0px' });
  });

  it('clamps to the bottom threshold and shifts the transform origin', () => {
    const p = popoverPosition({
      anchorRect: { ...anchor, top: 700 },
      element: { width: 300, height: 200 },
      anchorOrigin: { vertical: 'bottom', horizontal: 'center' },
      transformOrigin: { vertical: 'top', horizontal: 'center' },
      viewport,
      marginThreshold: 16,
    });
    expect(p.top).toBe('584px');
    expect(p.transformOrigin).toBe('150px 172px');
  });

  it('clamps left and right; numeric origins', () => {
    const left = popoverPosition({
      anchorRect: { ...anchor, left: 0, width: 20 },
      element: { width: 300, height: 50 },
      anchorOrigin: { vertical: 0, horizontal: 'left' },
      transformOrigin: { vertical: 'top', horizontal: 'center' },
      viewport,
      marginThreshold: 16,
    });
    expect(left.left).toBe('16px');
    const right = popoverPosition({
      anchorRect: { ...anchor, left: 990, width: 10 },
      element: { width: 300, height: 50 },
      anchorOrigin: { vertical: 'top', horizontal: 'right' },
      transformOrigin: { vertical: 'top', horizontal: 'left' },
      viewport,
      marginThreshold: 16,
    });
    expect(right.left).toBe('684px');
  });
});
