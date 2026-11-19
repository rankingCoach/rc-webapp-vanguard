import { Fade as MuiFade } from '@mui/material';
import { act, render } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Fade } from './Fade';

/**
 * Track g: Vanguard's Fade (now on the own Fade primitive) vs MUI 9.5 Fade called with the same props, on the same
 * timelines: child attributes + inline style at every step and the onEntered/onExited call log must match.
 */
type P = { in: boolean; timeout?: number | { enter?: number; exit?: number; appear?: number }; appear?: boolean; mountOnEnter?: boolean; unmountOnExit?: boolean };

const run = (impl: 'mui' | 'own', steps: { props: P; advance?: number }[]) => {
  const log: string[] = [];
  const el = (p: P) => {
    const common = { ...p, onEntered: () => log.push('entered'), onExited: () => log.push('exited') };
    const child = <div data-testid="c" style={{ color: 'red' }} />;
    return impl === 'mui' ? <MuiFade {...common}>{child}</MuiFade> : <Fade {...common}>{child}</Fade>;
  };
  const view = render(el(steps[0].props));
  const trace: unknown[] = [];
  const snap = () => {
    const c = view.container.querySelector('[data-testid="c"]');
    trace.push({ html: c ? c.outerHTML : null, log: [...log] });
  };
  for (const [i, s] of steps.entries()) {
    if (i > 0) view.rerender(el(s.props));
    snap();
    if (s.advance !== undefined) {
      act(() => {
        vi.advanceTimersByTime(s.advance as number);
      });
      snap();
    }
  }
  view.unmount();
  return trace;
};

const scenarios: Record<string, { props: P; advance?: number }[]> = {
  'appear default': [{ props: { in: true }, advance: 300 }],
  'no appear': [{ props: { in: true, appear: false } }],
  'out then in then out': [
    { props: { in: false } },
    { props: { in: true }, advance: 100 },
    { props: { in: true }, advance: 200 },
    { props: { in: false }, advance: 250 },
  ],
  'custom timeout object': [
    { props: { in: false, timeout: { enter: 50, exit: 80 } } },
    { props: { in: true, timeout: { enter: 50, exit: 80 } }, advance: 60 },
    { props: { in: false, timeout: { enter: 50, exit: 80 } }, advance: 90 },
  ],
  'mountOnEnter + unmountOnExit': [
    { props: { in: false, mountOnEnter: true, unmountOnExit: true } },
    { props: { in: true, mountOnEnter: true, unmountOnExit: true }, advance: 300 },
    { props: { in: false, mountOnEnter: true, unmountOnExit: true }, advance: 300 },
  ],
  'timeout 0': [{ props: { in: false, timeout: 0 } }, { props: { in: true, timeout: 0 }, advance: 1 }],
};

describe('Fade component parity: MUI 9.5 vs own', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());
  for (const [name, steps] of Object.entries(scenarios)) {
    it(name, () => {
      expect(run('own', steps)).toEqual(run('mui', steps));
    });
  }
});
