import { Fade as MuiFade } from '@mui/material';
import { act, render } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Fade } from './Fade';

/**
 * Differential parity: MUI 9.5 Fade (internal Transition, reducedMotion 'never') vs the own Fade on the same
 * timelines. At every step the child's inline style and the callback log must match MUI's.
 */
type Impl = typeof MuiFade | typeof Fade;
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
    'appear on mount, then exit',
    [
      { props: { in: true }, advance: 100 },
      { props: { in: true }, advance: 200 },
      { props: { in: false }, advance: 100 },
      { props: { in: false }, advance: 200 },
    ],
  ],
  [
    'mounted closed (hidden), then enter',
    [
      { props: { in: false }, advance: 0 },
      { props: { in: true }, advance: 300 },
    ],
  ],
  [
    'appear false',
    [
      { props: { in: true, appear: false }, advance: 300 },
      { props: { in: false, appear: false }, advance: 300 },
    ],
  ],
  [
    'exit interrupted by enter',
    [
      { props: { in: true }, advance: 300 },
      { props: { in: false }, advance: 50 },
      { props: { in: true }, advance: 300 },
    ],
  ],
  [
    'timeout number and custom easing',
    [
      { props: { in: true, timeout: 250, easing: 'linear' }, advance: 260 },
      { props: { in: false, timeout: 250, easing: 'linear' }, advance: 260 },
    ],
  ],
  [
    'timeout object',
    [
      { props: { in: true, timeout: { enter: 400, exit: 120 } }, advance: 410 },
      { props: { in: false, timeout: { enter: 400, exit: 120 } }, advance: 130 },
    ],
  ],
  [
    'style transitionDuration wins over timeout',
    [{ props: { in: true, style: { transitionDuration: '90ms' } }, advance: 300 }],
  ],
  // Review findings (Codex, handoff 10): transition controls and extra props reach Transition / the child.
  [
    'enter={false} after mount',
    [
      { props: { in: false, enter: false }, advance: 0 },
      { props: { in: true, enter: false }, advance: 300 },
    ],
  ],
  [
    'exit={false}',
    [
      { props: { in: true, exit: false }, advance: 300 },
      { props: { in: false, exit: false }, advance: 300 },
    ],
  ],
  [
    'extra props land on the child',
    [{ props: { in: true, 'data-extra': 'x', id: 'fade-child', title: 't' }, advance: 300 }],
  ],
];

describe('Fade parity with MUI Fade', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });
  it.each(timelines)('%s', (_name, steps) => {
    const mui = run(MuiFade, steps);
    const own = run(Fade, steps);
    expect(own).toEqual(mui);
  });
});

describe('Fade child ref (review finding: callback ref churn)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });
  it('the child callback ref is attached once and detached once, like MUI', () => {
    const go = (Impl: Impl) => {
      const calls: string[] = [];
      const ref = (node: HTMLElement | null) => {
        calls.push(node ? 'attach' : 'detach');
      };
      const view = render(
        <Impl in>
          <div ref={ref} />
        </Impl>,
      );
      act(() => {
        vi.advanceTimersByTime(300);
      });
      view.rerender(
        <Impl in={false}>
          <div ref={ref} />
        </Impl>,
      );
      act(() => {
        vi.advanceTimersByTime(300);
      });
      view.unmount();
      return calls;
    };
    expect(go(Fade)).toEqual(go(MuiFade));
  });
});
