import React from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { barRootOf, makeTabs, scrollButtonsOf, scrollerOf, Story, VisualHarness } from './_TabsVisual.default';

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
 * Whether a scroll button's caret points right, read from the SVG geometry (the assets are mirror-named, so the icon
 * name can't tell): the mid-height points of a `>` caret (tip and notch) sit right of its centre.
 */
const caretPointsRight = (button: HTMLElement): boolean => {
  const path = button.querySelector('svg path') as SVGPathElement;
  const box = path.getBBox();
  const midY = box.y + box.height / 2;
  const length = path.getTotalLength();
  const midXs: number[] = [];
  for (let at = 0; at <= length; at += 0.25) {
    const point = path.getPointAtLength(at);
    if (Math.abs(point.y - midY) < 0.25) {
      midXs.push(point.x);
    }
  }
  const meanX = midXs.reduce((sum, x) => sum + x, 0) / midXs.length;
  return meanX > box.x + box.width / 2;
};

/** Horizontal offset of the first box-shadow layer: positive when the shadow falls towards the right. */
const shadowXOf = (shadow: Element): number => {
  const offsets = getComputedStyle(shadow).boxShadow.match(/(-?[\d.]+)px/);
  return Number(offsets?.[1]);
};

/** Carets point to their edge and shadows fall over the tabs, following the bar's computed direction. */
const expectCaretsAndShadows = async (bar: HTMLElement, rtl: boolean): Promise<void> => {
  const start = within(bar).getByLabelText('Scroll to start');
  const end = within(bar).getByLabelText('Scroll to end');
  await waitFor(() => expect(start.querySelector('svg path')).not.toBeNull());
  await waitFor(() => expect(end.querySelector('svg path')).not.toBeNull());
  // No CSS mirroring on top of the icon choice
  await expect(getComputedStyle(start.querySelector('svg') as SVGElement).scale).toBe('none');
  await expect(caretPointsRight(start)).toBe(rtl);
  await expect(caretPointsRight(end)).toBe(!rtl);

  const [startShadow, endShadow] = Array.from(bar.querySelectorAll('[class*="scroll-shadows"] > *'));
  await expect(Math.sign(shadowXOf(startShadow))).toBe(rtl ? -1 : 1);
  await expect(Math.sign(shadowXOf(endShadow))).toBe(rtl ? 1 : -1);
};

/**
 * The end button jumps to the last tab and the start button back to the first one; the button that can't scroll
 * is disabled and faded out. In RTL `scrollLeft` runs from 0 (start, right edge) to -max (end, left edge).
 */
const playScrollBothWays =
  ({ rtl = false, floating = false } = {}): Story['play'] =>
  async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const tablist = canvas.getByRole('tablist');
    const scroller = scrollerOf(tablist);
    const bar = barRootOf(tablist);
    const toEnd = rtl ? -1 : 1;

    await expect(scroller.scrollWidth).toBeGreaterThan(scroller.clientWidth);
    // The floating tray lets the buttons' focus rings out: its scroller and the shadow layer clip themselves
    await expect(getComputedStyle(bar).overflow).toBe(floating ? 'visible' : 'hidden');
    await waitFor(() => expect(scrollButtonsOf(bar)).toHaveLength(2));
    await expectCaretsAndShadows(bar, rtl);

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
  play: playScrollBothWays({ floating: true }),
};

export const OverflowScrollRtl: Story = {
  render: () => (
    <div dir="rtl" style={{ width: 320 }}>
      <VisualHarness tabs={manyTabs} />
    </div>
  ),
  play: playScrollBothWays({ rtl: true }),
};

/**
 * RTL from the CSS `direction` only (no `dir` attribute, so `:dir(rtl)` doesn't match): the carets and shadows follow
 * the computed direction, like the logical placement and the scroll math.
 */
export const OverflowScrollCssRtl: Story = {
  render: () => (
    <div style={{ width: 320 }}>
      <VisualHarness tabs={manyTabs} style={{ direction: 'rtl' }} />
    </div>
  ),
  play: playScrollBothWays({ rtl: true }),
};

/** Same with the floating theme, whose tray lets the focus rings out. */
export const OverflowScrollFloatingCssRtl: Story = {
  render: () => (
    <div style={{ width: 320 }}>
      <VisualHarness tabs={manyTabs} tabConfig={{ theme: 'floating' }} style={{ direction: 'rtl' }} />
    </div>
  ),
  play: playScrollBothWays({ rtl: true, floating: true }),
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
