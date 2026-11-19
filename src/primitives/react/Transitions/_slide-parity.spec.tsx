import { Slide as MuiSlide } from '@mui/material';
import { act, render } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Slide } from './Slide';

/**
 * Differential parity: MUI 9.5 Slide (internal Transition, reducedMotion 'never') vs the own Slide on the same
 * timelines. At every step the child's inline style and the callback log must match MUI's.
 */
type Impl = typeof MuiSlide | typeof Slide;
type FadeProps = Record<string, unknown>;

const run = (Impl: Impl, steps: { props: FadeProps; advance?: number }[]) => {
  const log: string[] = [];
  const t0 = Date.now();
  const cb = (name: string) => (node: HTMLElement, isAppearing?: boolean) =>
    log.push(`${Date.now() - t0}:${name}${isAppearing === undefined ? '' : `(${isAppearing})`}:${node?.tagName}`);
  const callbacks = {
    onEnter: cb('enter'),
    onEntering: cb('entering'),
    onEntered: cb('entered'),
    onExit: cb('exit'),
    onExiting: cb('exiting'),
    onExited: cb('exited'),
  };
  const trace: { style: string | null; log: string[] }[] = [];
  const view = render(
    <Impl {...callbacks} {...(steps[0].props as object)}>
      <div data-testid="child" style={{ color: 'red' }} />
    </Impl>,
  );
  const snap = () => {
    const el = view.container.querySelector('[data-testid="child"]');
    trace.push({
      style: el?.getAttribute('style') ?? null,
      attrs: el
        ? el
            .getAttributeNames()
            .filter((n) => n !== 'style')
            .sort()
            .map((n) => `${n}=${el.getAttribute(n)}`)
        : [],
      log: [...log],
    } as never);
  };
  snap();
  for (const [i, step] of steps.entries()) {
    if (i > 0) {
      view.rerender(
        <Impl {...callbacks} {...(step.props as object)}>
          <div data-testid="child" style={{ color: 'red' }} />
        </Impl>,
      );
      snap();
    }
    if (step.advance !== undefined) {
      act(() => {
        vi.advanceTimersByTime(step.advance as number);
      });
      snap();
    }
  }
  view.unmount();
  return trace;
};

const timelines: [string, { props: FadeProps; advance?: number }[]][] = [
  [
    'direction left: enter, exit (MUI theme durations)',
    [
      { props: { in: true, direction: 'left' }, advance: 100 },
      { props: { in: true, direction: 'left' }, advance: 400 },
      { props: { in: false, direction: 'left' }, advance: 100 },
      { props: { in: false, direction: 'left' }, advance: 400 },
    ],
  ],
  [
    'direction right, timeout 400 (Drawer)',
    [
      { props: { in: true, direction: 'right', timeout: 400 }, advance: 410 },
      { props: { in: false, direction: 'right', timeout: 400 }, advance: 410 },
    ],
  ],
  ['direction up', [{ props: { in: true, direction: 'up', timeout: 300 }, advance: 310 }]],
  [
    'direction down',
    [
      { props: { in: true, direction: 'down', timeout: 300 }, advance: 310 },
      { props: { in: false, direction: 'down', timeout: 300 }, advance: 310 },
    ],
  ],
  [
    'mounted closed (hidden), then enter',
    [
      { props: { in: false, direction: 'up' }, advance: 0 },
      { props: { in: true, direction: 'up' }, advance: 500 },
    ],
  ],
  [
    'exit interrupted by enter',
    [
      { props: { in: true, direction: 'left', timeout: 300 }, advance: 300 },
      { props: { in: false, direction: 'left', timeout: 300 }, advance: 50 },
      { props: { in: true, direction: 'left', timeout: 300 }, advance: 300 },
    ],
  ],
  [
    'easing object',
    [
      {
        props: {
          in: true,
          direction: 'left',
          timeout: { enter: 250, exit: 150 },
          easing: { enter: 'linear', exit: 'ease-in' },
        },
        advance: 260,
      },
      {
        props: {
          in: false,
          direction: 'left',
          timeout: { enter: 250, exit: 150 },
          easing: { enter: 'linear', exit: 'ease-in' },
        },
        advance: 160,
      },
    ],
  ],
  [
    'unmountOnExit',
    [
      { props: { in: true, direction: 'right', timeout: 200, unmountOnExit: true }, advance: 210 },
      { props: { in: false, direction: 'right', timeout: 200, unmountOnExit: true }, advance: 210 },
    ],
  ],
  ['appear false', [{ props: { in: true, direction: 'left', appear: false }, advance: 400 }]],
  [
    'extra props land on the child',
    [{ props: { in: true, direction: 'left', timeout: 200, 'data-extra': 'x', id: 'slide-child' }, advance: 300 }],
  ],
];

describe('Slide parity with MUI Slide', () => {
  let restore: () => void;
  beforeEach(() => {
    vi.useFakeTimers();
    // MUI Slide reads the child's rect and the window size to compute the off-screen translate.
    const rectDesc = Object.getOwnPropertyDescriptor(Element.prototype, 'getBoundingClientRect');
    Element.prototype.getBoundingClientRect = function () {
      return {
        x: 300,
        y: 120,
        left: 300,
        top: 120,
        width: 240,
        height: 180,
        right: 540,
        bottom: 300,
        toJSON: () => ({}),
      } as DOMRect;
    };
    restore = () => {
      if (rectDesc) Object.defineProperty(Element.prototype, 'getBoundingClientRect', rectDesc);
    };
  });
  afterEach(() => {
    restore();
    vi.useRealTimers();
  });
  it.each(timelines)('%s', (_name, steps) => {
    const mui = run(MuiSlide, steps);
    const own = run(Slide, steps);
    expect(own).toEqual(mui);
  });
});
