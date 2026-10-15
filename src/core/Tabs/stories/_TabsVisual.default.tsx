import { StoryObj } from '@storybook/react';
import React, { useState } from 'react';

import { TabProps } from '../Tab/Tab';
import { Tabs, TabsProps } from '../Tabs';

export type Story = StoryObj<typeof Tabs>;

/** Reads a CSS custom property resolved on the document root. */
export const resolvedVar = (name: string): string =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim();

/**
 * Normalises any CSS colour (including `var(--x)`) to the browser's computed `rgb(...)`/`rgba(...)` form,
 * so it can be compared against `getComputedStyle` output.
 */
export const resolvedColor = (color: string): string => {
  const probe = document.createElement('span');
  probe.style.color = color;
  document.body.appendChild(probe);
  const resolved = getComputedStyle(probe).color;
  probe.remove();
  return resolved;
};

/** Normalises a CSS custom property (e.g. `--fn-bg-cta`) to computed rgb. */
export const resolvedVarColor = (name: string): string => resolvedColor(`var(${name})`);

/** The scrolling viewport wrapping the tablist (direct parent of role="tablist"). */
export const scrollerOf = (tablist: HTMLElement): HTMLElement => tablist.parentElement as HTMLElement;

/** The tab-bar root: the element that carries the consumer className (parent of the scroller). */
export const barRootOf = (tablist: HTMLElement): HTMLElement => scrollerOf(tablist).parentElement as HTMLElement;

/** The element wrapping the bar and the panels. */
export const wrapperOf = (tablist: HTMLElement): HTMLElement => barRootOf(tablist).parentElement as HTMLElement;

/** Scroll buttons (caret wrappers), ordered left to right. */
export const scrollButtonsOf = (bar: HTMLElement): HTMLElement[] =>
  Array.from(bar.querySelectorAll<HTMLElement>('[class*="custom-scroll-button-wrapper"]')).sort(
    (a, b) => a.getBoundingClientRect().left - b.getBoundingClientRect().left,
  );

export const makeTabs = (labels: string[], withPanels = false): TabProps[] =>
  labels.map((label) => ({
    label,
    value: label.toLowerCase().replace(/\s+/g, '-'),
    ...(withPanels && { component: <div>{`${label} panel`}</div> }),
  }));

export const sampleLabels = ['Overview', 'Reviews', 'Settings'];

export type VisualHarnessProps = Omit<TabsProps, 'value' | 'onChange'> & {
  /** Initial value for the controlled state; defaults to the first tab's value. */
  initialValue?: any;
  /** Optional width (px or CSS string) of a wrapping element. */
  width?: number | string;
};

export const VisualHarness = ({ initialValue, width, ...tabsProps }: VisualHarnessProps) => {
  const [value, setValue] = useState<any>(initialValue ?? tabsProps.tabs?.[0]?.value);
  const tabs = <Tabs {...tabsProps} value={value} onChange={(_e, next) => setValue(next)} />;
  return width === undefined ? tabs : <div style={{ width }}>{tabs}</div>;
};

/** Computed height of an element rect (sub-pixel safe comparisons use `toBeCloseTo`). */
export const heightOf = (el: Element): number => el.getBoundingClientRect().height;
