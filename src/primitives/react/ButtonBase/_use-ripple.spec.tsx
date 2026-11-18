import { act, render, screen } from '@testing-library/react';
import React, { createRef } from 'react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { ButtonBase, ButtonBaseActions } from './ButtonBase';

/**
 * Focus-visible pulsate ripple parity with MUI (verifier delta, Tier A ToggleButtonGroup): the first pulsate must
 * survive the lazy mount of the ripple root, and geometry is measured on the ripple root (inset 0 = the button's
 * padding box), not on the button. MUI: 57.828125 x 46.5 root -> size 54.3152, x 29, y 23.
 */
const original = Element.prototype.getBoundingClientRect;
beforeEach(() => {
  Element.prototype.getBoundingClientRect = function () {
    if ((this as Element).classList.contains('MuiTouchRipple-root')) {
      return {
        x: 17,
        y: 17,
        left: 17,
        top: 17,
        width: 57.828125,
        height: 46.5,
        right: 74.83,
        bottom: 63.5,
        toJSON: () => ({}),
      } as DOMRect;
    }
    return {
      x: 16,
      y: 16,
      left: 16,
      top: 16,
      width: 59.828125,
      height: 48.5,
      right: 75.83,
      bottom: 64.5,
      toJSON: () => ({}),
    } as DOMRect;
  };
});
afterEach(() => {
  Element.prototype.getBoundingClientRect = original;
});

describe('ButtonBase focus ripple', () => {
  it('first focus-visible pulsates a centred ripple sized from the ripple root', async () => {
    const action = createRef<ButtonBaseActions>();
    render(
      <ButtonBase focusRipple action={action}>
        {'A'}
      </ButtonBase>,
    );
    act(() => action.current?.focusVisible());
    // Ripple calls are deferred to microtasks after the lazy mount (MUI LazyRipple parity).
    for (let i = 0; i < 5; i++) {
      await act(async () => {
        await Promise.resolve();
      });
    }
    const ripple = screen.getByRole('button').querySelector<HTMLElement>('.MuiTouchRipple-ripple');
    expect(ripple).not.toBeNull();
    expect(ripple?.classList.contains('MuiTouchRipple-ripplePulsate')).toBe(true);
    const size = Math.sqrt((2 * 57.828125 ** 2 + 46.5 ** 2) / 3);
    expect(parseFloat(ripple!.style.width)).toBeCloseTo(size, 3);
    expect(parseFloat(ripple!.style.left)).toBeCloseTo(-(size / 2) + 29, 3);
    expect(parseFloat(ripple!.style.top)).toBeCloseTo(-(size / 2) + 23, 3);
  });
});
