import { Unstable_TrapFocus as MuiTrapFocus } from '@mui/material';
import { act, fireEvent, render } from '@testing-library/react';
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { FocusTrap } from './FocusTrap';

/**
 * Own FocusTrap equals MUI 9.5's Unstable_TrapFocus: same focus trace (document.activeElement after each step) and
 * same DOM (sentinels, tabIndex on the child) for the props Vanguard exposes: open, isEnabled, disableAutoFocus,
 * disableEnforceFocus, disableRestoreFocus. Steps: open, Tab off the last element (end sentinel), Shift+Tab off the
 * first (start sentinel), focus moved outside (enforce), the 50ms body-focus interval, close (restore), unmount.
 */
type Impl = 'mui' | 'own';
type Props = {
  isEnabled?: () => boolean;
  disableAutoFocus?: boolean;
  disableEnforceFocus?: boolean;
  disableRestoreFocus?: boolean;
};
type Step = 'open' | 'close' | 'tabEnd' | 'tabStart' | 'outside' | 'blurToBody' | ['advance', number];

afterEach(() => {
  vi.useRealTimers();
  document.body.innerHTML = '';
});

const label = (el: Element | null) =>
  !el
    ? 'null'
    : el === document.body
      ? 'body'
      : (el.getAttribute('data-name') ?? el.getAttribute('data-testid') ?? el.tagName.toLowerCase());

const go = (impl: Impl, props: Props, steps: Step[]) => {
  vi.useFakeTimers();
  const T = (impl === 'mui' ? MuiTrapFocus : FocusTrap) as React.ElementType;
  const tree = (open: boolean) => (
    <div>
      <button type="button" data-name="opener">
        {'opener'}
      </button>
      <button type="button" data-name="outside">
        {'outside'}
      </button>
      <T open={open} {...props}>
        <div tabIndex={-1} data-name="root">
          <button type="button" data-name="first">
            {'first'}
          </button>
          <button type="button" data-name="last">
            {'last'}
          </button>
        </div>
      </T>
    </div>
  );
  const view = render(tree(false));
  (document.querySelector('[data-name="opener"]') as HTMLElement).focus();
  const trace: string[] = [];
  for (const step of steps) {
    act(() => {
      if (step === 'open' || step === 'close') view.rerender(tree(step === 'open'));
      if (step === 'tabEnd') {
        (document.querySelector('[data-name="last"]') as HTMLElement).focus();
        fireEvent.keyDown(document.activeElement as Element, { key: 'Tab' });
        (document.querySelector('[data-testid="sentinelEnd"]') as HTMLElement | null)?.focus();
      }
      if (step === 'tabStart') {
        (document.querySelector('[data-name="first"]') as HTMLElement).focus();
        fireEvent.keyDown(document.activeElement as Element, { key: 'Tab', shiftKey: true });
        (document.querySelector('[data-testid="sentinelStart"]') as HTMLElement | null)?.focus();
      }
      if (step === 'outside') (document.querySelector('[data-name="outside"]') as HTMLElement).focus();
      if (step === 'blurToBody') (document.activeElement as HTMLElement | null)?.blur();
      if (Array.isArray(step)) vi.advanceTimersByTime(step[1]);
    });
    trace.push(`${typeof step === 'string' ? step : step.join(':')}→${label(document.activeElement)}`);
  }
  const dom = view.container.innerHTML;
  view.unmount();
  return { trace, dom };
};

const FLOW: Step[] = ['open', 'tabEnd', 'tabStart', 'outside', 'blurToBody', ['advance', 60], 'close'];

describe('FocusTrap own core equals MUI Unstable_TrapFocus', () => {
  const cases: [string, Props, Step[]][] = [
    ['defaults', {}, FLOW],
    ['isEnabled false (paused under another dialog)', { isEnabled: () => false }, FLOW],
    ['disableAutoFocus', { disableAutoFocus: true }, FLOW],
    ['disableEnforceFocus', { disableEnforceFocus: true }, FLOW],
    ['disableRestoreFocus', { disableRestoreFocus: true }, FLOW],
    ['open, close, reopen', {}, ['open', 'close', 'open', 'outside', 'close']],
  ];
  for (const [name, props, steps] of cases) {
    it(name, () => {
      expect(go('own', props, steps)).toEqual(go('mui', props, steps));
    });
  }
});
