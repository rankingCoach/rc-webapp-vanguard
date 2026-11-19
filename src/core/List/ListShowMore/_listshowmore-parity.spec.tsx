import { act, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ListElementSchema } from '../List';
import { ListShowMoreMui } from './_ListShowMoreMui.reference';
import { ListShowMore, ListShowMoreProps } from './ListShowMore';

/**
 * Differential parity (track g): the former ListShowMore (MUI Collapse, timeout 1500) vs the own Collapse. At every
 * step of the show-all / show-less timeline the whole subtree must match (tags, classes without emotion `css-*`,
 * attributes without own-core markers, inline styles incl. the Collapse writes), and the Collapse root is own core.
 */
type Impl = 'mui' | 'own';
const OWN_ONLY = new Set(['data-vg-core', 'data-slot', 'data-orientation', 'data-open']);
const elements: ListElementSchema[] = Array.from({ length: 6 }, (_, i) => ({ content: `Item ${i}` }));
const props: ListShowMoreProps = { listElements: elements, limit: 3, type: 'numerical' };

type Node = { tag: string; classes: string[]; attrs: string[]; style: string | null; text?: string; children: Node[] };
const describeTree = (el: Element): Node => ({
  tag: el.tagName,
  classes: (el.getAttribute('class') ?? '').split(/\s+/).filter((c) => c && !/^css-/.test(c)),
  attrs: el
    .getAttributeNames()
    .filter((n) => n !== 'class' && n !== 'style' && !OWN_ONLY.has(n))
    .sort()
    .map((n) => `${n}=${el.getAttribute(n)}`),
  style: el.getAttribute('style'),
  ...(el.children.length === 0 && el.textContent ? { text: el.textContent } : {}),
  children: [...el.children].map(describeTree),
});

type Step = { click: 'Show all features' | 'Show less' } | { advance: number };
const run = (impl: Impl, steps: Step[]) => {
  const view = render(impl === 'mui' ? <ListShowMoreMui {...props} /> : <ListShowMore {...props} />);
  const trace: unknown[] = [describeTree(view.container)];
  for (const step of steps) {
    if ('click' in step) fireEvent.click(screen.getByText(step.click));
    else
      act(() => {
        vi.advanceTimersByTime(step.advance);
      });
    trace.push(describeTree(view.container));
  }
  view.unmount();
  return trace;
};

const timeline: Step[] = [
  { click: 'Show all features' },
  { advance: 750 },
  { advance: 800 },
  { click: 'Show less' },
  { advance: 750 },
  { advance: 800 },
  { click: 'Show all features' },
  { advance: 300 },
  { click: 'Show less' },
  { advance: 1600 },
];

describe('ListShowMore parity: MUI Collapse path vs own', () => {
  let restore: () => void;
  beforeEach(() => {
    vi.useFakeTimers();
    const spy = vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockImplementation(function (this: HTMLElement) {
      return this.classList.contains('MuiCollapse-wrapper') ? 96 : 0;
    });
    restore = () => spy.mockRestore();
  });
  afterEach(() => {
    restore();
    vi.useRealTimers();
  });

  it('collapse root is the own-core collapse', () => {
    const { container } = render(<ListShowMore {...props} />);
    const root = container.querySelector('.MuiCollapse-root') as HTMLElement;
    expect(root.hasAttribute('data-vg-core')).toBe(true);
    expect(root.getAttribute('data-slot')).toBe('collapse');
  });

  it('show all / show less timeline (incl. interrupted transitions) matches step by step', () => {
    const own = run('own', timeline);
    expect(JSON.stringify(own)).toContain('transition-duration: 1500ms');
    expect(own).toEqual(run('mui', timeline));
  });

  it('below the limit or without a limit renders nothing, like before', () => {
    for (const p of [
      { ...props, limit: undefined },
      { ...props, limit: 6 },
    ]) {
      const a = render(<ListShowMore {...p} />);
      const b = render(<ListShowMoreMui {...p} />);
      expect(a.container.innerHTML).toBe(b.container.innerHTML);
      a.unmount();
      b.unmount();
    }
  });
});
