import MuiBackdrop from '@mui/material/Backdrop';
import { act, fireEvent, render } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Backdrop } from './Backdrop';

/**
 * Differential parity, jsdom: MUI 9.5 Backdrop vs the own Backdrop (Fade + `div.MuiBackdrop-root`) on the same
 * open/close timelines, with PopoverModal's props (className, onMouseDown, data-testid, a z-index). The own z-index
 * is inline (MUI: an `sx` emotion class), so it is normalised here; its computed value is checked by the PopoverModal
 * stacking specs and stories.
 */
type Impl = 'mui' | 'own';

const normalize = (html: string) =>
  html
    .replace(/ ?\bcss-[a-z0-9]+(-[A-Za-z0-9]+)*/g, '')
    .replace(/ class=""/g, '')
    .replace(/ data-vg-core=""/g, '')
    .replace(/ data-slot="[^"]*"/g, '')
    // The own z-index is inline (MUI: an sx emotion class); its computed value is checked by PopoverModal's specs.
    .replace(/ ?z-index: \d+;/g, '');

const Subject = ({ impl, zIndex, ...props }: { impl: Impl } & Record<string, unknown>) =>
  impl === 'mui' ? (
    <MuiBackdrop {...(props as never)} sx={zIndex !== undefined ? { zIndex: zIndex as number } : undefined} />
  ) : (
    <Backdrop {...(props as never)} zIndex={zIndex as number | undefined} />
  );

const timeline = (impl: Impl, steps: { props: Record<string, unknown>; advance: number }[]) => {
  const trace: string[] = [];
  const log: string[] = [];
  const view = render(<Subject impl={impl} onMouseDown={() => log.push('mousedown')} {...steps[0].props} />);
  for (const [i, step] of steps.entries()) {
    if (i > 0) view.rerender(<Subject impl={impl} onMouseDown={() => log.push('mousedown')} {...step.props} />);
    trace.push(normalize(view.container.innerHTML));
    act(() => {
      vi.advanceTimersByTime(step.advance);
    });
    trace.push(normalize(view.container.innerHTML));
  }
  const root = view.container.querySelector('.MuiBackdrop-root');
  if (root) fireEvent.mouseDown(root);
  view.unmount();
  return { trace, log };
};

beforeEach(() => {
  vi.useFakeTimers();
});
afterEach(() => {
  vi.useRealTimers();
});

const CASES: [string, { props: Record<string, unknown>; advance: number }[]][] = [
  [
    'PopoverModal shape: open with class, test id and z-index, then close',
    [
      { props: { open: true, className: 'dim', 'data-testid': 'popover-modal-backdrop', zIndex: 1031 }, advance: 300 },
      { props: { open: false, className: 'dim', 'data-testid': 'popover-modal-backdrop', zIndex: 1031 }, advance: 300 },
    ],
  ],
  [
    'mounted closed, then open',
    [
      { props: { open: false }, advance: 0 },
      { props: { open: true }, advance: 300 },
    ],
  ],
  ['invisible', [{ props: { open: true, invisible: true }, advance: 300 }]],
  [
    'transitionDuration',
    [
      { props: { open: true, transitionDuration: 100 }, advance: 120 },
      { props: { open: false, transitionDuration: 100 }, advance: 120 },
    ],
  ],
  ['children', [{ props: { open: true, children: <span>{'inner'}</span> }, advance: 300 }]],
];

describe('own Backdrop equals MUI Backdrop', () => {
  it.each(CASES)('%s', (_name, steps) => {
    expect(timeline('own', steps)).toEqual(timeline('mui', steps));
  });
});
