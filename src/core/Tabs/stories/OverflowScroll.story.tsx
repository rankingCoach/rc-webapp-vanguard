import React from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import {
  barRootOf,
  makeTabs,
  scrollButtonsOf,
  scrollerOf,
  Story,
  VisualHarness,
} from './_TabsVisual.default';

const isInside = (tab: HTMLElement, scroller: HTMLElement): boolean => {
  const tabRect = tab.getBoundingClientRect();
  const scrollerRect = scroller.getBoundingClientRect();
  return tabRect.left >= scrollerRect.left - 1 && tabRect.right <= scrollerRect.right + 1;
};

const manyTabs = makeTabs(Array.from({ length: 12 }, (_, i) => `Section ${i + 1}`));

/** Waits until a smooth scroll has stopped moving. */
const waitForScrollEnd = async (scroller: HTMLElement): Promise<void> => {
  let last = Number.NaN;
  await waitFor(async () => {
    const current = scroller.scrollLeft;
    const settled = current === last;
    last = current;
    await new Promise((resolve) => setTimeout(resolve, 150));
    expect(settled).toBe(true);
  });
};

const maxScrollOf = (scroller: HTMLElement): number => scroller.scrollWidth - scroller.clientWidth;

/**
 * The end button jumps to the last tab and the start button back to the first one; the button that can't scroll
 * is disabled and faded out. In RTL `scrollLeft` runs from 0 (start, right edge) to -max (end, left edge).
 */
const playScrollBothWays =
  (rtl = false): Story['play'] =>
  async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const tablist = canvas.getByRole('tablist');
    const scroller = scrollerOf(tablist);
    const bar = barRootOf(tablist);
    const toEnd = rtl ? -1 : 1;

    await expect(scroller.scrollWidth).toBeGreaterThan(scroller.clientWidth);
    await expect(getComputedStyle(bar).overflow).toBe('hidden');
    await waitFor(() => expect(scrollButtonsOf(bar)).toHaveLength(2));

    // By label: the faded-out button is `visibility: hidden`, so it has no accessible name for getByRole
    const start = canvas.getByLabelText('Scroll to start');
    const end = canvas.getByLabelText('Scroll to end');
    // Logical placement: the start button sits on the left in LTR and on the right in RTL
    await expect(scrollButtonsOf(bar)).toEqual(rtl ? [end, start] : [start, end]);
    await expect(scroller.scrollLeft).toBe(0);
    await expect(start).toBeDisabled();

    await userEvent.click(end);
    await waitForScrollEnd(scroller);
    await expect(Math.abs(scroller.scrollLeft - toEnd * maxScrollOf(scroller))).toBeLessThanOrEqual(1);
    await waitFor(() => expect(end).toBeDisabled());
    await expect(start).toBeEnabled();
    await expect(isInside(canvas.getByRole('tab', { name: 'Section 12' }), scroller)).toBe(true);

    await userEvent.click(start);
    await waitForScrollEnd(scroller);
    await expect(Math.abs(scroller.scrollLeft)).toBeLessThanOrEqual(1);
    await waitFor(() => expect(start).toBeDisabled());
    await expect(end).toBeEnabled();
    await expect(isInside(canvas.getByRole('tab', { name: 'Section 1' }), scroller)).toBe(true);
  };

export const OverflowScroll: Story = {
  render: () => (
    <div style={{ width: 320 }}>
      <VisualHarness tabs={manyTabs} />
    </div>
  ),
  play: async (context) => {
    await playScrollBothWays()(context);

    const canvas = within(context.canvasElement);
    const scroller = scrollerOf(canvas.getByRole('tablist'));
    await userEvent.click(canvas.getByRole('tab', { name: 'Section 12' }));
    await waitFor(() => expect(isInside(canvas.getByRole('tab', { name: 'Section 12' }), scroller)).toBe(true));
    await expect(canvas.getByRole('tab', { name: 'Section 12' })).toHaveAttribute('aria-selected', 'true');
  },
};

export const OverflowScrollFloating: Story = {
  render: () => (
    <div style={{ width: 320 }}>
      <VisualHarness tabs={manyTabs} tabConfig={{ theme: 'floating' }} />
    </div>
  ),
  play: playScrollBothWays(),
};

export const OverflowScrollRtl: Story = {
  render: () => (
    <div dir="rtl" style={{ width: 320 }}>
      <VisualHarness tabs={manyTabs} />
    </div>
  ),
  play: playScrollBothWays(true),
};

export const NoOverflowWide: Story = {
  render: () => (
    <div style={{ width: 1000 }}>
      <VisualHarness tabs={makeTabs(['One', 'Two', 'Three'])} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const tablist = canvas.getByRole('tablist');
    const scroller = scrollerOf(tablist);
    const bar = barRootOf(tablist);

    await expect(scroller.scrollWidth).toBeLessThanOrEqual(scroller.clientWidth + 1);
    // Give any (incorrect) async overflow measurement time to mount buttons.
    await new Promise((resolve) => setTimeout(resolve, 300));
    await expect(scrollButtonsOf(bar)).toHaveLength(0);
    await expect(getComputedStyle(bar).overflow).toBe('hidden');
  },
};
