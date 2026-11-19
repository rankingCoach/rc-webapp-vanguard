import { act, fireEvent, render } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { VanguardThemeProvider } from '../VanguardThemeProvider/VanguardThemeProvider';
import { BreadcrumbsMui } from './_BreadcrumbsMui.reference';
import { Breadcrumbs, BreadcrumbsProps } from './Breadcrumbs';

/**
 * Differential parity (track g): the former MUI 9.5 Breadcrumbs (verbatim, _BreadcrumbsMui.reference.tsx) vs the own
 * Breadcrumbs. Whole subtree (tags, classes without emotion `css-*` and the own typography marker, attributes without
 * own-core markers, inline styles, text) over item counts × maxItems × before/after × separators × labels, in both
 * themes; and the expand timeline (focus, ripple press, click → expanded list + focus on the first entry).
 */
type Impl = 'mui' | 'own';
const OWN_ONLY = new Set(['data-vg-core', 'data-slot', 'data-expanded']);
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
const items = (n: number, kind: 'link' | 'text' | 'mixed') =>
  Array.from({ length: n }, (_, i) =>
    kind === 'link' || (kind === 'mixed' && i < n - 1) ? (
      <a key={i} href={`#${i}`}>
        Item {i}
      </a>
    ) : (
      <span key={i}>Item {i}</span>
    ),
  );
const element = (impl: Impl, p: Partial<BreadcrumbsProps>, n: number, kind: 'link' | 'text' | 'mixed') => {
  const C = impl === 'mui' ? BreadcrumbsMui : Breadcrumbs;
  return (
    <C {...p}>
      {items(n, kind)}
      {null}
      {'stray text is dropped'}
    </C>
  );
};

const matrix: { name: string; p: Partial<BreadcrumbsProps>; n: number; kind: 'link' | 'text' | 'mixed' }[] = [];
for (const n of [0, 1, 2, 3, 8, 9, 12])
  for (const maxItems of [undefined, 3, 0])
    for (const [b, a] of [
      [undefined, undefined],
      [2, 1],
      [1, 3],
      [3, 3],
    ])
      for (const kind of ['link', 'mixed'] as const)
        matrix.push({
          name: `n${n}/max${maxItems}/b${b}/a${a}/${kind}`,
          p: { maxItems, itemsBeforeCollapse: b, itemsAfterCollapse: a },
          n,
          kind,
        });
matrix.push(
  { name: 'node separator', p: { separator: <span className="sep">›</span> }, n: 3, kind: 'link' },
  {
    name: 'aria-label + className + testId',
    p: { 'aria-label': 'Pfad', className: 'mine', testId: 'bc' },
    n: 3,
    kind: 'mixed',
  },
  { name: 'text only collapsed', p: { maxItems: 2 }, n: 5, kind: 'text' },
);

describe('Breadcrumbs parity: MUI 9.5 path vs own', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  for (const theme of ['default', 'vanguard'] as const)
    it(`DOM over ${matrix.length} combinations (${theme} theme)`, () => {
      const wrap = (x: React.ReactElement) =>
        theme === 'vanguard' ? <VanguardThemeProvider>{x}</VanguardThemeProvider> : x;
      const diffs: string[] = [];
      for (const { name, p, n, kind } of matrix) {
        const a = render(wrap(<div data-host="">{element('own', p, n, kind)}</div>));
        const b = render(wrap(<div data-host="">{element('mui', p, n, kind)}</div>));
        const own = JSON.stringify(describeTree(a.container.querySelector('[data-host]') as Element));
        const mui = JSON.stringify(describeTree(b.container.querySelector('[data-host]') as Element));
        if (own !== mui) diffs.push(`${name}\n own=${own}\n mui=${mui}`);
        a.unmount();
        b.unmount();
      }
      expect(diffs.slice(0, 2)).toEqual([]);
      expect(diffs.length).toBe(0);
    });

  const activeOf = () => {
    const el = document.activeElement;
    return el ? `${el.tagName}:${el.getAttribute('aria-label') ?? el.textContent}` : null;
  };
  const timeline = (impl: Impl, p: Partial<BreadcrumbsProps>, n: number, kind: 'link' | 'text' | 'mixed') => {
    const view = render(<div data-host="">{element(impl, p, n, kind)}</div>);
    const host = view.container.querySelector('[data-host]') as Element;
    const trace: unknown[] = [];
    const snap = (step: string) => trace.push({ step, dom: describeTree(host), active: activeOf() });
    const advance = (ms: number) =>
      act(() => {
        vi.advanceTimersByTime(ms);
      });
    snap('rest');
    const button = host.querySelector('button') as HTMLElement;
    act(() => button.focus());
    snap('focus');
    fireEvent.mouseDown(button);
    snap('down');
    advance(100);
    fireEvent.mouseUp(button);
    advance(600);
    snap('up');
    fireEvent.keyDown(button, { key: 'Enter' });
    fireEvent.click(button);
    fireEvent.keyUp(button, { key: 'Enter' });
    snap('expand');
    advance(600);
    snap('expanded settled');
    view.rerender(<div data-host="">{element(impl, { ...p, separator: '>' }, n + 1, kind)}</div>);
    snap('rerender keeps expanded');
    view.unmount();
    return trace;
  };
  for (const [name, [p, n, kind]] of Object.entries({
    'links, default before/after': [{ maxItems: 3 }, 6, 'link'],
    'text entries (nothing focusable)': [{ maxItems: 2 }, 5, 'text'],
    'before 2 / after 2': [{ maxItems: 4, itemsBeforeCollapse: 2, itemsAfterCollapse: 2 }, 9, 'mixed'],
  } as Record<string, [Partial<BreadcrumbsProps>, number, 'link' | 'text' | 'mixed']>))
    it(`expand timeline: ${name}`, () => {
      expect(timeline('own', p, n, kind)).toEqual(timeline('mui', p, n, kind));
    });
});
