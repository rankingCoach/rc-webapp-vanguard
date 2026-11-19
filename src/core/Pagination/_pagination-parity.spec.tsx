import { act, fireEvent, render } from '@testing-library/react';
import React, { useState } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { VanguardThemeProvider } from '../VanguardThemeProvider/VanguardThemeProvider';
import { PaginationMui } from './_PaginationMui.reference';
import { Pagination, PaginationProps } from './Pagination';

/**
 * Differential parity (track g): the former MUI 9.5 Pagination (verbatim, _PaginationMui.reference.tsx) vs the own
 * Pagination. Whole subtree (tags, classes as a set without emotion `css-*` / the own typography marker — MUI lists
 * Mui-disabled twice on disabled buttons —, attributes without own-core markers, inline styles, text) over count ×
 * page × sibling/boundary × first/last/prev/next buttons × size × shape × disabled, in both themes; and click /
 * keyboard timelines, controlled and uncontrolled, incl. the focus hand-over when the activated button disables.
 */
type Impl = 'mui' | 'own';
const OWN_ONLY = new Set(['data-vg-core', 'data-slot', 'data-size', 'data-shape', 'data-disabled', 'data-selected']);
const OWN_CLASSES = new Set(['vg-typography-vanguard']);
type Node = { tag: string; classes: string[]; attrs: string[]; style: string | null; text?: string; children: Node[] };
const describeTree = (el: Element): Node => ({
  tag: el.tagName,
  classes: [
    ...new Set(
      (el.getAttribute('class') ?? '').split(/\s+/).filter((c) => c && !/^css-/.test(c) && !OWN_CLASSES.has(c)),
    ),
  ],
  attrs: el
    .getAttributeNames()
    .filter((n) => n !== 'class' && n !== 'style' && !OWN_ONLY.has(n))
    .sort()
    .map((n) => `${n}=${el.getAttribute(n)}`),
  style: el.getAttribute('style'),
  ...(el.children.length === 0 && el.textContent ? { text: el.textContent } : {}),
  children: [...el.children].map(describeTree),
});
const C = (impl: Impl) => (impl === 'mui' ? PaginationMui : Pagination);

const matrix: { name: string; p: PaginationProps }[] = [];
for (const count of [0, 1, 2, 5, 7, 10, 20])
  for (const page of [undefined, 1, 4, 7, 20])
    for (const [siblingCount, boundaryCount] of [
      [undefined, undefined],
      [0, 0],
      [2, 2],
      [1, 3],
    ])
      for (const buttons of [
        {},
        { showFirstButton: true, showLastButton: true },
        { hidePrevButton: true, hideNextButton: true },
      ])
        matrix.push({
          name: `c${count}/p${page}/s${siblingCount}/b${boundaryCount}/${JSON.stringify(buttons)}`,
          p: { count, page, siblingCount, boundaryCount, ...buttons },
        });
for (const size of [undefined, 'small', 'medium', 'large'] as const)
  for (const shape of [undefined, 'circular', 'rounded'] as const)
    for (const disabled of [undefined, true])
      matrix.push({
        name: `${size}/${shape}/${disabled}`,
        p: { count: 10, page: 5, size, shape, disabled, showFirstButton: true, showLastButton: true },
      });
matrix.push(
  { name: 'defaultPage', p: { count: 10, defaultPage: 6 } },
  { name: 'className + testId', p: { count: 3, className: 'mine', testId: 'pg' } },
);

describe('Pagination parity: MUI 9.5 path vs own', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  for (const theme of ['default', 'vanguard'] as const)
    it(`DOM over ${matrix.length} combinations (${theme} theme)`, () => {
      const wrap = (x: React.ReactElement) =>
        theme === 'vanguard' ? <VanguardThemeProvider>{x}</VanguardThemeProvider> : x;
      const diffs: string[] = [];
      for (const { name, p } of matrix) {
        const Own = C('own');
        const Mui = C('mui');
        const a = render(wrap(<div data-host="">{<Own {...p} />}</div>));
        const b = render(wrap(<div data-host="">{<Mui {...p} />}</div>));
        const own = JSON.stringify(describeTree(a.container.querySelector('[data-host]') as Element));
        const mui = JSON.stringify(describeTree(b.container.querySelector('[data-host]') as Element));
        if (own !== mui) diffs.push(`${name}\n own=${own}\n mui=${mui}`);
        a.unmount();
        b.unmount();
      }
      expect(diffs.slice(0, 2)).toEqual([]);
      expect(diffs.length).toBe(0);
    }, 60000);

  type Step = { label: string } | { key: 'Enter' | ' '; label: string } | { focus: string };
  const activeOf = () => {
    const el = document.activeElement;
    return el ? `${el.tagName}:${el.getAttribute('aria-label') ?? ''}` : null;
  };
  const run = (impl: Impl, p: PaginationProps, controlled: boolean, steps: Step[]) => {
    const calls: number[] = [];
    const Comp = C(impl);
    const Host = () => {
      const [page, setPage] = useState(p.page ?? 1);
      return (
        <Comp
          {...p}
          page={controlled ? page : p.page}
          onChange={(_e, v) => {
            calls.push(v);
            if (controlled) setPage(v);
          }}
        />
      );
    };
    const view = render(
      <div data-host="">
        <Host />
      </div>,
    );
    const host = view.container.querySelector('[data-host]') as Element;
    const byLabel = (l: string) => host.querySelector(`[aria-label="${l}"]`) as HTMLElement;
    const trace: unknown[] = [];
    for (const step of steps) {
      if ('focus' in step) act(() => byLabel(step.focus).focus());
      else if ('key' in step) {
        const el = byLabel(step.label);
        fireEvent.keyDown(el, { key: step.key });
        if (step.key === 'Enter') fireEvent.click(el);
        fireEvent.keyUp(el, { key: step.key });
        if (step.key === ' ') fireEvent.click(el);
      } else fireEvent.click(byLabel(step.label));
      act(() => {
        vi.advanceTimersByTime(600);
      });
      trace.push({ step, calls: [...calls], active: activeOf(), dom: describeTree(host) });
    }
    view.unmount();
    return trace;
  };
  const steps: Step[] = [
    { label: 'Go to page 2' },
    { label: 'Go to next page' },
    { focus: 'Go to previous page' },
    { key: 'Enter', label: 'Go to previous page' },
    { key: ' ', label: 'Go to previous page' },
    { focus: 'Go to last page' },
    { key: 'Enter', label: 'Go to last page' },
    { label: 'Go to first page' },
  ];
  for (const controlled of [false, true])
    for (const [name, p] of Object.entries({
      'with first/last': { count: 6, showFirstButton: true, showLastButton: true },
      'small rounded siblings 0': {
        count: 6,
        size: 'small',
        shape: 'rounded',
        siblingCount: 0,
        showFirstButton: true,
        showLastButton: true,
      },
    } as Record<string, PaginationProps>))
      it(`timeline (${controlled ? 'controlled' : 'uncontrolled'}): ${name}`, () => {
        expect(run('own', p, controlled, steps)).toEqual(run('mui', p, controlled, steps));
      });
});
