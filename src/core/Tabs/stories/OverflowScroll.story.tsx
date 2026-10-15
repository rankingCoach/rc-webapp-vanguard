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

const manyTabs = makeTabs(Array.from({ length: 12 }, (_, i) => `Section ${i + 1}`));

export const OverflowScroll: Story = {
  render: () => (
    <div style={{ width: 320 }}>
      <VisualHarness tabs={manyTabs} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const tablist = canvas.getByRole('tablist');
    const scroller = scrollerOf(tablist);
    const bar = barRootOf(tablist);

    await expect(scroller.scrollWidth).toBeGreaterThan(scroller.clientWidth);
    await expect(getComputedStyle(bar).overflow).toBe('hidden');

    await waitFor(() => expect(scrollButtonsOf(bar).length).toBeGreaterThan(0));
    const right = scrollButtonsOf(bar).pop() as HTMLElement;
    await expect(scroller.scrollLeft).toBe(0);

    await userEvent.click(right);
    await waitFor(() => expect(scroller.scrollLeft).toBeGreaterThan(0));

    // Let the smooth scroll settle before interacting again.
    let last = -1;
    await waitFor(async () => {
      const current = scroller.scrollLeft;
      const settled = current === last;
      last = current;
      await new Promise((resolve) => setTimeout(resolve, 150));
      expect(settled).toBe(true);
    });

    await userEvent.click(canvas.getByRole('tab', { name: 'Section 12' }));
    await waitFor(() => {
      const tabRect = canvas.getByRole('tab', { name: 'Section 12' }).getBoundingClientRect();
      const scrollerRect = scroller.getBoundingClientRect();
      expect(tabRect.left).toBeGreaterThanOrEqual(scrollerRect.left - 1);
      expect(tabRect.right).toBeLessThanOrEqual(scrollerRect.right + 1);
    });
    await expect(canvas.getByRole('tab', { name: 'Section 12' })).toHaveAttribute('aria-selected', 'true');
  },
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
