import { Collapse as MuiCollapse } from '@mui/material';
import { act, render } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { OwnCollapse } from './own-collapse';

/**
 * Differential parity (track g): MUI 9.5 Collapse, called the way Vanguard's Collapse calls it (`in`, `className`,
 * `orientation`), vs the own Collapse on the same timelines. At every step the three elements' classes (MUI's
 * emotion `css-*` hashes dropped), attributes (own-core markers dropped) and inline styles must match.
 */
type Props = { in: boolean; orientation?: 'vertical' | 'horizontal'; className?: string };
type Impl = 'mui' | 'own';
const OWN_ONLY = new Set(['data-vg-core', 'data-slot', 'data-orientation', 'data-open']);

const element = (impl: Impl, p: Props) =>
  impl === 'mui' ? (
    <MuiCollapse in={p.in} className={p.className} orientation={p.orientation}>
      <span>content</span>
    </MuiCollapse>
  ) : (
    <OwnCollapse in={p.in} className={p.className} orientation={p.orientation}>
      <span>content</span>
    </OwnCollapse>
  );

const describeEl = (el: Element | null) =>
  el && {
    tag: el.tagName,
    classes: (el.getAttribute('class') ?? '').split(/\s+/).filter((c) => c && !/^css-/.test(c)),
    attrs: el
      .getAttributeNames()
      .filter((n) => n !== 'class' && n !== 'style' && !OWN_ONLY.has(n))
      .sort()
      .map((n) => `${n}=${el.getAttribute(n)}`),
    style: el.getAttribute('style'),
  };

const run = (impl: Impl, steps: { props: Props; advance?: number }[]) => {
  const view = render(element(impl, steps[0].props));
  const trace: unknown[] = [];
  const snap = () => {
    const root = view.container.firstElementChild;
    trace.push([describeEl(root), describeEl(root?.firstElementChild ?? null), describeEl(root?.firstElementChild?.firstElementChild ?? null)]);
  };
  for (const [i, step] of steps.entries()) {
    if (i > 0) view.rerender(element(impl, step.props));
    snap();
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

const scenarios: Record<string, { props: Props; advance?: number }[]> = {
  'closed at mount': [{ props: { in: false } }],
  'open at mount (no appear)': [{ props: { in: true, className: 'mine' } }],
  'open then close': [
    { props: { in: false } },
    { props: { in: true }, advance: 150 },
    { props: { in: true }, advance: 200 },
    { props: { in: false }, advance: 100 },
    { props: { in: false }, advance: 250 },
  ],
  'close interrupted by open': [
    { props: { in: true } },
    { props: { in: false }, advance: 100 },
    { props: { in: true }, advance: 400 },
  ],
  horizontal: [
    { props: { in: false, orientation: 'horizontal' } },
    { props: { in: true, orientation: 'horizontal' }, advance: 350 },
    { props: { in: false, orientation: 'horizontal' }, advance: 350 },
  ],
  'className change while open': [
    { props: { in: true, className: 'a' } },
    { props: { in: true, className: 'b' } },
  ],
};

describe('Collapse parity: MUI 9.5 vs own', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  for (const [name, steps] of Object.entries(scenarios)) {
    it(name, () => {
      expect(run('own', steps)).toEqual(run('mui', steps));
    });
  }
});
