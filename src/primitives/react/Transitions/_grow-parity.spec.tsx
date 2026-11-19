import { Grow as MuiGrow } from '@mui/material';
import { act, render } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Grow } from './Grow';

/**
 * Differential parity: MUI 9.5 Grow (internal Transition, reducedMotion 'never') vs the own Grow on the same
 * timelines. At every step the child's inline style and the callback log must match MUI's.
 */
type Impl = typeof MuiGrow | typeof Grow;
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
    'appear on mount, then exit (auto timeout from clientHeight)',
    [
      { props: { in: true }, advance: 100 },
      { props: { in: true }, advance: 400 },
      { props: { in: false }, advance: 100 },
      { props: { in: false }, advance: 400 },
    ],
  ],
  [
    'Tooltip shape: timeout 200',
    [
      { props: { in: true, timeout: 200 }, advance: 210 },
      { props: { in: false, timeout: 200 }, advance: 70 },
      { props: { in: false, timeout: 200 }, advance: 140 },
    ],
  ],
  [
    'mounted closed (hidden), then enter',
    [
      { props: { in: false }, advance: 0 },
      { props: { in: true }, advance: 500 },
    ],
  ],
  [
    'exit interrupted by enter',
    [
      { props: { in: true, timeout: 300 }, advance: 300 },
      { props: { in: false, timeout: 300 }, advance: 50 },
      { props: { in: true, timeout: 300 }, advance: 300 },
    ],
  ],
  [
    'timeout object and easing object',
    [
      {
        props: { in: true, timeout: { enter: 400, exit: 120 }, easing: { enter: 'linear', exit: 'ease-in' } },
        advance: 410,
      },
      {
        props: { in: false, timeout: { enter: 400, exit: 120 }, easing: { enter: 'linear', exit: 'ease-in' } },
        advance: 130,
      },
    ],
  ],
  [
    'style transitionDuration and transitionDelay win',
    [
      {
        props: { in: true, timeout: 200, style: { transitionDuration: '90ms', transitionDelay: '10ms' } },
        advance: 300,
      },
      {
        props: { in: false, timeout: 200, style: { transitionDuration: '90ms', transitionDelay: '10ms' } },
        advance: 300,
      },
    ],
  ],
  [
    'unmountOnExit',
    [
      { props: { in: true, timeout: 200, unmountOnExit: true }, advance: 210 },
      { props: { in: false, timeout: 200, unmountOnExit: true }, advance: 210 },
    ],
  ],
  [
    'extra props land on the child',
    [{ props: { in: true, timeout: 200, 'data-extra': 'x', id: 'grow-child' }, advance: 300 }],
  ],
];

describe('Grow parity with MUI Grow', () => {
  let restore: () => void;
  beforeEach(() => {
    vi.useFakeTimers();
    // A measurable height so timeout 'auto' gives MUI's getAutoHeightDuration a non-zero value.
    const desc = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'clientHeight');
    Object.defineProperty(HTMLElement.prototype, 'clientHeight', { configurable: true, get: () => 120 });
    restore = () => {
      if (desc) Object.defineProperty(HTMLElement.prototype, 'clientHeight', desc);
    };
  });
  afterEach(() => {
    restore();
    vi.useRealTimers();
  });
  it.each(timelines)('%s', (_name, steps) => {
    const mui = run(MuiGrow, steps);
    const own = run(Grow, steps);
    expect(own).toEqual(mui);
  });
});
