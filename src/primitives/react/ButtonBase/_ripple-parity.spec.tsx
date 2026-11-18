import { ButtonBase as MuiButtonBase } from '@mui/material';
import { act, fireEvent, render } from '@testing-library/react';
import React, { createRef } from 'react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { ButtonBase, ButtonBaseActions } from './ButtonBase';

/**
 * Differential ripple parity: the same event sequence on MUI 9.5's ButtonBase (still installed) and on Vanguard's,
 * comparing the ripple DOM state (count, pulsate/leaving classes, size) after React and the lazy-ripple microtasks
 * settle and after the 550 ms exit. Verifier Tier A round 2: blur must stop the focus pulsate; Space keydown/keyup
 * must leave the same ripple MUI leaves.
 */
const original = Element.prototype.getBoundingClientRect;
beforeEach(() => {
  Element.prototype.getBoundingClientRect = function () {
    const r = { x: 17, y: 17, left: 17, top: 17, width: 82, height: 46.5, right: 99, bottom: 63.5 };
    return { ...r, toJSON: () => r } as DOMRect;
  };
});
afterEach(() => {
  Element.prototype.getBoundingClientRect = original;
});

type Step = 'focusVisible' | 'blur' | 'spaceDown' | 'spaceUp' | 'enterDown' | 'mouseDown' | 'mouseUp' | 'wait600';

const summary = (host: HTMLElement) =>
  [...host.querySelectorAll<HTMLElement>('.MuiTouchRipple-ripple')].map((r) => {
    const child = r.firstElementChild as HTMLElement;
    return {
      pulsate: r.className.includes('MuiTouchRipple-ripplePulsate'),
      leaving: child.className.includes('MuiTouchRipple-childLeaving'),
      size: Math.round(parseFloat(r.style.width) * 100) / 100,
    };
  });

const flush = async () => {
  for (let i = 0; i < 5; i++) {
    await act(async () => {
      await Promise.resolve();
    });
  }
};

const run = async (Comp: React.ElementType, steps: Step[]) => {
  const action = createRef<ButtonBaseActions>();
  const { getByRole, unmount } = render(
    <Comp focusRipple action={action}>
      {'B'}
    </Comp>,
  );
  const button = getByRole('button');
  for (const step of steps) {
    if (step === 'focusVisible') act(() => action.current?.focusVisible());
    if (step === 'blur') fireEvent.blur(button);
    if (step === 'spaceDown') fireEvent.keyDown(button, { key: ' ' });
    if (step === 'spaceUp') fireEvent.keyUp(button, { key: ' ' });
    if (step === 'enterDown') fireEvent.keyDown(button, { key: 'Enter' });
    if (step === 'mouseDown') fireEvent.mouseDown(button, { clientX: 30, clientY: 30 });
    if (step === 'mouseUp') fireEvent.mouseUp(button, { clientX: 30, clientY: 30 });
    if (step === 'wait600') await act(() => new Promise((r) => setTimeout(r, 600)));
    await flush();
  }
  const result = summary(button);
  unmount();
  return result;
};

const sequences: Step[][] = [
  ['focusVisible'],
  ['focusVisible', 'blur'],
  ['focusVisible', 'blur', 'wait600'],
  ['focusVisible', 'spaceDown'],
  ['focusVisible', 'spaceDown', 'spaceUp'],
  ['focusVisible', 'spaceDown', 'spaceUp', 'enterDown', 'wait600'],
  ['mouseDown'],
  ['mouseDown', 'mouseUp'],
  ['mouseDown', 'mouseUp', 'wait600'],
  ['focusVisible', 'mouseDown', 'mouseUp', 'blur', 'wait600'],
];

describe('ripple parity with MUI ButtonBase', () => {
  for (const steps of sequences) {
    it(steps.join(' → '), async () => {
      const mui = await run(MuiButtonBase, steps);
      const own = await run(ButtonBase, steps);
      expect(own).toEqual(mui);
    });
  }
});
