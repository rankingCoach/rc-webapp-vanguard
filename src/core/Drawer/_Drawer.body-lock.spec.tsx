import Modal from '@mui/material/Modal';
import { ModalProvider } from '@vanguard/Modal/ModalContext';
import { ModalRoot } from '@vanguard/Modal/ModalRoot/ModalRoot';
import React, { StrictMode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, render } from '../../../test-utils/test-utils';
import { DrawerMuiReference } from './_Drawer.mui-reference';
import { Drawer } from './Drawer';

/**
 * H16 FAIL (verifier 1): a temporary Drawer must lock the page like MUI (inline `overflow: hidden` + scrollbar-gap
 * `padding-right`, `.mui-fixed` included) and restore the exact prior inline values; docked variants never lock.
 * Vanguard's ModalRoot clears `body.style.overflow` in a passive effect on mount: MUI's two-phase Portal locks in the
 * next commit (after those passive effects), so a drawer that is open when the page mounts stays locked. Every case
 * runs on the frozen MUI Drawer and the own one, with and without StrictMode.
 */
type Impl = 'mui' | 'own';
const C = (impl: Impl) => (impl === 'mui' ? DrawerMuiReference : Drawer) as React.ElementType;

const body = () => ({
  style: document.body.getAttribute('style') ?? '',
  fixed: (document.querySelector('.mui-fixed') as HTMLElement | null)?.getAttribute('style') ?? '',
  hidden: Array.from(document.body.children)
    .map((c) => `${c.classList.contains('MuiModal-root') ? 'modal' : c.className || '-'}:${c.getAttribute('aria-hidden') ?? ''}`)
    .join(' '),
});

beforeEach(() => {
  vi.useFakeTimers();
  Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1017 });
  // Browser geometry: a 17px scrollbar until the body is locked (overflow hidden removes it). jsdom keeps clientWidth
  // at 0, which would make the second lock (a MUI Modal over the drawer) add the gap twice.
  Object.defineProperty(document.documentElement, 'clientWidth', {
    configurable: true,
    get: () => (document.body.style.overflow === 'hidden' ? 1017 : 1000),
  });
  document.body.setAttribute('style', 'padding-right: 5px; overflow: auto;');
  const fixed = document.createElement('div');
  fixed.className = 'mui-fixed';
  fixed.setAttribute('style', 'padding-right: 3px;');
  document.body.appendChild(fixed);
});
afterEach(() => {
  vi.useRealTimers();
  document.body.innerHTML = '';
  document.body.removeAttribute('style');
});

const settle = () =>
  act(() => {
    vi.advanceTimersByTime(600);
  });

type Step = { open: boolean; variant?: string; mui?: boolean } | 'unmount' | 'remount';
const go = (impl: Impl, strict: boolean, steps: Step[]) => {
  const D = C(impl);
  const tree = (s: { open: boolean; variant?: string; mui?: boolean }) => {
    // As in the Storybook decorator and rc-webapp's root: ModalProvider > ModalRoot before the page content.
    const inner = (
      <ModalProvider>
        <ModalRoot />
        <D open={s.open} variant={s.variant ?? 'temporary'} title="T">
          {'x'}
        </D>
        {s.mui ? (
          <Modal open>
            <div>{'mui modal'}</div>
          </Modal>
        ) : null}
      </ModalProvider>
    );
    return strict ? <StrictMode>{inner}</StrictMode> : inner;
  };
  let last: { open: boolean; variant?: string; mui?: boolean } = { open: false };
  let view: ReturnType<typeof render> | null = null;
  const trace: ReturnType<typeof body>[] = [];
  for (const step of steps) {
    if (step === 'unmount') {
      view?.unmount();
      view?.container.remove();
      view = null;
    } else if (step === 'remount') {
      view = render(tree(last));
    } else {
      last = step;
      if (view) view.rerender(tree(step));
      else view = render(tree(step));
    }
    settle();
    trace.push(body());
  }
  view?.unmount();
  view?.container.remove();
  settle();
  trace.push(body());
  return trace;
};

const SCENARIOS: [string, Step[]][] = [
  ['open on mount (with ModalRoot), close, unmount', [{ open: true }, { open: false }, 'unmount']],
  ['mount closed, open, close', [{ open: false }, { open: true }, { open: false }]],
  ['fast open → close → open (no settle between: same commits)', [{ open: true }, { open: false }, { open: true }]],
  ['open, unmount while open, remount open', [{ open: true }, 'unmount', 'remount']],
  [
    'persistent never locks',
    [
      { open: true, variant: 'persistent' },
      { open: false, variant: 'persistent' },
    ],
  ],
  ['permanent never locks', [{ open: true, variant: 'permanent' }]],
  [
    'Drawer + MUI Modal on top, LIFO close',
    [{ open: true }, { open: true, mui: true }, { open: true, mui: false }, { open: false }],
  ],
];

for (const strict of [false, true]) {
  describe(`temporary Drawer body lock equals MUI${strict ? ' (StrictMode)' : ''}`, () => {
    for (const [name, steps] of SCENARIOS) {
      it(name, () => {
        expect(go('own', strict, steps)).toEqual(go('mui', strict, steps));
      });
    }
  });
}
