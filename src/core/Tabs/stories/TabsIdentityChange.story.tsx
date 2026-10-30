import React, { useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { TabProps } from '../Tab/Tab';
import { Tabs } from '../Tabs';
import { barRootOf, makeTabs, scrollButtonsOf, scrollerOf, Story } from './_TabsVisual.default';

const isInside = (tab: HTMLElement, scroller: HTMLElement): boolean => {
  const tabRect = tab.getBoundingClientRect();
  const scrollerRect = scroller.getBoundingClientRect();
  return tabRect.left >= scrollerRect.left - 1 && tabRect.right <= scrollerRect.right + 1;
};

/** Reordering the tabs (same count, same selected value) keeps the selected tab visible. */
const ReorderHarness = () => {
  const [reversed, setReversed] = useState(false);
  const base = makeTabs(Array.from({ length: 12 }, (_, i) => `Item ${String(i + 1).padStart(2, '0')}`));
  const [value, setValue] = useState<string>(base[0].value);
  return (
    <div style={{ width: 320 }}>
      <button type="button" onClick={() => setReversed(true)}>
        Reverse
      </button>
      <Tabs
        tabs={reversed ? [...base].reverse() : base}
        value={value}
        onChange={(_e, next) => setValue(next)}
        tabConfig={{ tabNoMinWidth: true }}
      />
    </div>
  );
};

export const SelectedVisibleAfterReorder: Story = {
  render: () => <ReorderHarness />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const scroller = scrollerOf(canvas.getByRole('tablist'));
    await expect(isInside(canvas.getByRole('tab', { name: 'Item 01' }), scroller)).toBe(true);

    await userEvent.click(canvas.getByRole('button', { name: 'Reverse' }));
    const selected = canvas.getByRole('tab', { name: 'Item 01' });
    await expect(selected).toHaveAttribute('aria-selected', 'true');
    await waitFor(() => expect(isInside(selected, scroller)).toBe(true));
  },
};

/** Swapping which tab is visible (same count) still tracks the new tab's size for overflow. */
const SwapHarness = () => {
  const [step, setStep] = useState(0);
  const tabs: TabProps[] = [
    { label: 'One', value: 'one' },
    { label: 'Two', value: 'two' },
    { label: 'Three', value: 'three', disabled: step >= 1 },
    { label: step >= 2 ? 'Four with a much much longer label than before' : 'Four', value: 'four', disabled: step < 1 },
  ];
  const [value, setValue] = useState<string>('one');
  return (
    <div style={{ width: 320 }}>
      <button type="button" onClick={() => setStep((current) => current + 1)}>
        Next step
      </button>
      <Tabs tabs={tabs} value={value} onChange={(_e, next) => setValue(next)} tabConfig={{ theme: 'underline' }} />
    </div>
  );
};

export const OverflowAfterTabSwap: Story = {
  render: () => <SwapHarness />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const tablist = canvas.getByRole('tablist');
    const scroller = scrollerOf(tablist);
    const bar = barRootOf(tablist);
    const next = canvas.getByRole('button', { name: 'Next step' });

    await userEvent.click(next);
    await expect(canvas.getByRole('tab', { name: 'Four' })).toBeInTheDocument();
    await new Promise((resolve) => setTimeout(resolve, 200));
    await expect(scrollButtonsOf(bar)).toHaveLength(0);

    await userEvent.click(next);
    await waitFor(() => expect(scroller.scrollWidth).toBeGreaterThan(scroller.clientWidth));
    await waitFor(() => expect(scrollButtonsOf(bar).length).toBeGreaterThan(0));
  },
};

/** A size change of a non-selected tab must not scroll the user back to the selected tab. */
const OtherTabResizeHarness = () => {
  const [badge, setBadge] = useState(false);
  const base = makeTabs(Array.from({ length: 12 }, (_, i) => `Section ${i + 1}`));
  const tabs = base.map((tab, index) => (index === 11 && badge ? { ...tab, label: 'Section 12 (99+ new)' } : tab));
  const [value, setValue] = useState<string>(base[0].value);
  return (
    <div style={{ width: 320 }}>
      <button type="button" onClick={() => setBadge(true)}>
        Add badge
      </button>
      <Tabs tabs={tabs} value={value} onChange={(_e, next) => setValue(next)} />
    </div>
  );
};

export const NoScrollFightOnOtherTabResize: Story = {
  render: () => <OtherTabResizeHarness />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const tablist = canvas.getByRole('tablist');
    const scroller = scrollerOf(tablist);
    const bar = barRootOf(tablist);

    await waitFor(() => expect(scrollButtonsOf(bar).length).toBeGreaterThan(0));
    scroller.scrollLeft = scroller.scrollWidth;
    await waitFor(() => expect(scroller.scrollLeft).toBeGreaterThan(0));
    const before = scroller.scrollLeft;

    await userEvent.click(canvas.getByRole('button', { name: 'Add badge' }));
    await expect(canvas.getByRole('tab', { name: 'Section 12 (99+ new)' })).toBeInTheDocument();
    await new Promise((resolve) => setTimeout(resolve, 600));
    await expect(scroller.scrollLeft).toBeGreaterThanOrEqual(before - 1);
  },
};
