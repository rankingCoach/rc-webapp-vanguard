import { StoryObj } from '@storybook/react';
import React, { useState } from 'react';

import { Tabs, TabsProps } from '../Tabs';

export type Story = StoryObj<typeof Tabs>;

export const selectors = {
  scrollButton: '[class*="custom-scroll-button-wrapper"]',
};

/** The scrolling viewport that wraps the tablist (implementation-agnostic: direct parent of role="tablist"). */
export const scrollerOf = (tablist: HTMLElement): HTMLElement | null => tablist.parentElement;

/** Reads a CSS custom property resolved on the document root. */
export const resolvedVar = (name: string): string =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim();

export type TabsHarnessProps = Omit<TabsProps, 'value' | 'onChange'> & {
  /** Initial value for the controlled state. Ignored when `uncontrolled` is set. */
  initialValue?: any;
  /** When true, no `value` prop is passed to Tabs. */
  uncontrolled?: boolean;
  /** Spy forwarded to Tabs `onChange` */
  onChange?: TabsProps['onChange'];
  /** Optional width (px or CSS string) for a wrapping element */
  width?: number | string;
};

export const TabsHarness = ({
  initialValue,
  uncontrolled = false,
  onChange,
  width,
  ...tabsProps
}: TabsHarnessProps) => {
  const [value, setValue] = useState<any>(initialValue);

  const handleChange: TabsProps['onChange'] = (event, next) => {
    setValue(next);
    onChange?.(event, next);
  };

  const tabs = uncontrolled ? (
    <Tabs {...tabsProps} onChange={onChange} />
  ) : (
    <Tabs {...tabsProps} value={value} onChange={handleChange} />
  );

  return width === undefined ? tabs : <div style={{ width }}>{tabs}</div>;
};
