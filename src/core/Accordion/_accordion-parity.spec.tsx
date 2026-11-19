import { act, fireEvent, render } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { IconNames } from '../Icon/IconNames';
import { AccordionMui } from './_AccordionMui.reference';
import { Accordion, AccordionProps } from './Accordion';

/**
 * Differential parity (track g): the former MUI 9.5 Accordion path (verbatim, _AccordionMui.reference.tsx) vs the own
 * Accordion on the same timelines. At every step the WHOLE subtree must match: tags, classes (emotion `css-*` hashes
 * dropped), attributes (own-core markers dropped), inline styles — including the Collapse writes with timeout 'auto'.
 */
type Impl = 'mui' | 'own';
type Step =
  | { props: Partial<AccordionProps> }
  | { click: true }
  | { key: '{Enter}' | ' ' }
  | { tab: true }
  | { advance: number };
const OWN_ONLY = new Set(['data-vg-core', 'data-slot', 'data-variant', 'data-open', 'data-orientation']);

const base: AccordionProps = {
  accordionId: 'acc',
  summaryChildren: <span>Summary</span>,
  detailsChildren: <p>Details</p>,
};
const element = (impl: Impl, p: Partial<AccordionProps>) =>
  impl === 'mui' ? <AccordionMui {...base} {...p} /> : <Accordion {...base} {...p} />;

type Node = { tag: string; classes: string[]; attrs: string[]; style: string | null; text?: string; children: Node[] };
const describeTree = (el: Element): Node => ({
  tag: el.tagName,
  // Set semantics: MUI's ButtonBase lists Mui-focusVisible twice (class + focusVisibleClassName); order is kept.
  classes: [...new Set((el.getAttribute('class') ?? '').split(/\s+/).filter((c) => c && !/^css-/.test(c)))],
  attrs: el
    .getAttributeNames()
    .filter((n) => n !== 'class' && n !== 'style' && !OWN_ONLY.has(n))
    .sort()
    .map((n) => `${n}=${el.getAttribute(n)}`),
  style: el.getAttribute('style'),
  ...(el.children.length === 0 && el.textContent ? { text: el.textContent } : {}),
  children: [...el.children].map(describeTree),
});

// Native <button> activation as the browser does it (user-event + fake timers deadlocks): Enter clicks on keydown,
// Space on keyup. Both paths render a native button, so the browser's activation is identical for both.
const press = (button: HTMLElement, key: '{Enter}' | ' ') => {
  const k = key === ' ' ? ' ' : 'Enter';
  fireEvent.keyDown(button, { key: k });
  if (k === 'Enter') fireEvent.click(button);
  fireEvent.keyUp(button, { key: k });
  if (k === ' ') fireEvent.click(button);
};

const run = async (impl: Impl, initial: Partial<AccordionProps>, steps: Step[]) => {
  let props = initial;
  const onExpandedChange = vi.fn();
  const view = render(element(impl, { ...props, onExpandedChange }));
  const trace: unknown[] = [];
  const snap = () => trace.push(describeTree(view.container.firstElementChild as Element));
  snap();
  for (const step of steps) {
    if ('props' in step) {
      props = { ...props, ...step.props };
      view.rerender(element(impl, { ...props, onExpandedChange }));
    } else if ('click' in step) fireEvent.click(view.getByRole('button'));
    else if ('key' in step) press(view.getByRole('button'), step.key);
    else if ('tab' in step)
      act(() => {
        view.getByRole('button').focus();
      });
    else
      act(() => {
        vi.advanceTimersByTime(step.advance);
      });
    snap();
  }
  trace.push({ calls: onExpandedChange.mock.calls, active: document.activeElement?.tagName });
  view.unmount();
  return trace;
};

const scenarios: Record<string, { initial: Partial<AccordionProps>; steps: Step[] }> = {
  'collapsed at mount': { initial: {}, steps: [] },
  'expanded at mount': { initial: { expanded: true }, steps: [] },
  'outlined, no gutters, expanded': {
    initial: { variant: 'outlined', disableGutters: true, expanded: true },
    steps: [],
  },
  'elevation explicit': { initial: { variant: 'elevation' }, steps: [] },
  'no summary children, reverse': { initial: { summaryChildren: undefined, reverse: true }, steps: [] },
  'custom icon + styles': {
    initial: {
      iconName: IconNames.caretUp,
      summaryCustomStyle: { padding: '10px' },
      baseCustomStyle: { border: '2px solid red' },
      detailsCustomStyle: { padding: '15px' },
    },
    steps: [{ click: true }, { advance: 400 }],
  },
  'click open, click close': {
    initial: {},
    steps: [{ click: true }, { advance: 100 }, { advance: 400 }, { click: true }, { advance: 100 }, { advance: 400 }],
  },
  'click close interrupted by open': {
    initial: { expanded: true },
    steps: [{ click: true }, { click: true }, { advance: 500 }],
  },
  'keyboard: tab, Enter, Space (focus visible)': {
    initial: {},
    steps: [{ tab: true }, { key: '{Enter}' }, { advance: 500 }, { key: ' ' }, { advance: 500 }],
  },
  'controlled prop both ways': {
    initial: { expanded: false },
    steps: [{ props: { expanded: true } }, { advance: 500 }, { props: { expanded: false } }, { advance: 500 }],
  },
  'gutters toggled while open': {
    initial: { expanded: true },
    steps: [
      { props: { disableGutters: true } },
      { props: { variant: 'outlined' } },
      { props: { disableGutters: false } },
    ],
  },
  'ignored MUI props stay ignored': {
    initial: {
      disabled: true,
      square: true,
      elevation: 4,
      defaultExpanded: true,
      className: 'x',
      onChange: () => {},
    } as Partial<AccordionProps>,
    steps: [{ click: true }, { advance: 500 }],
  },
};

describe('Accordion parity: MUI 9.5 path vs own', () => {
  let restore: () => void;
  beforeEach(() => {
    vi.useFakeTimers();
    // jsdom has no layout: give the Collapse wrapper a height so timeout 'auto' yields a real duration (120px → 249 ms).
    const spy = vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockImplementation(function (this: HTMLElement) {
      return this.classList.contains('MuiCollapse-wrapper') ? 120 : 0;
    });
    restore = () => spy.mockRestore();
  });
  afterEach(() => {
    restore();
    vi.useRealTimers();
  });

  for (const [name, { initial, steps }] of Object.entries(scenarios)) {
    it(name, async () => {
      expect(await run('own', initial, steps)).toEqual(await run('mui', initial, steps));
    });
  }
});
