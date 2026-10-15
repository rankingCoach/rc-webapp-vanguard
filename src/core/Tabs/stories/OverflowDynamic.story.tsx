import React, { useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { Tabs } from '../Tabs';
import { barRootOf, makeTabs, scrollButtonsOf, scrollerOf, Story } from './_TabsVisual.default';

const isInside = (tab: HTMLElement, scroller: HTMLElement): boolean => {
  const tabRect = tab.getBoundingClientRect();
  const scrollerRect = scroller.getBoundingClientRect();
  return tabRect.left >= scrollerRect.left - 1 && tabRect.right <= scrollerRect.right + 1;
};

const manyTabs = makeTabs(Array.from({ length: 12 }, (_, i) => `Section ${i + 1}`));

/** Selection changed from outside the bar (no focus on the tab) still scrolls the selected tab into view. */
const ExternalSelectionHarness = () => {
  const [value, setValue] = useState<string>(manyTabs[0].value);
  return (
    <div style={{ width: 320 }}>
      <button type="button" onClick={() => setValue(manyTabs[11].value)}>
        Select last
      </button>
      <Tabs tabs={manyTabs} value={value} onChange={(_e, next) => setValue(next)} />
    </div>
  );
};

export const SelectedScrolledIntoViewExternally: Story = {
  render: () => <ExternalSelectionHarness />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const scroller = scrollerOf(canvas.getByRole('tablist'));
    const last = canvas.getByRole('tab', { name: 'Section 12' });
    await expect(isInside(last, scroller)).toBe(false);

    await userEvent.click(canvas.getByRole('button', { name: 'Select last' }));
    await expect(last).toHaveAttribute('aria-selected', 'true');
    await expect(last).not.toHaveFocus();
    await waitFor(() => expect(isInside(last, scroller)).toBe(true));
  },
};

/** Labels growing (e.g. translations loading) with the same tab count must still reveal the scroll buttons. */
const LabelChangeHarness = () => {
  const [long, setLong] = useState(false);
  const labels = ['One', 'Two', 'Three'].map((label) => (long ? `${label} with a much longer label` : label));
  const [value, setValue] = useState<any>(0);
  return (
    <div style={{ width: 320 }}>
      <button type="button" onClick={() => setLong(true)}>
        Lengthen labels
      </button>
      <Tabs
        tabs={labels.map((label) => ({ label }))}
        value={value}
        onChange={(_e, next) => setValue(next)}
        tabConfig={{ theme: 'underline' }}
      />
    </div>
  );
};

export const OverflowAfterLabelChange: Story = {
  render: () => <LabelChangeHarness />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const tablist = canvas.getByRole('tablist');
    const scroller = scrollerOf(tablist);
    const bar = barRootOf(tablist);

    await expect(scroller.scrollWidth).toBeLessThanOrEqual(scroller.clientWidth + 1);
    await new Promise((resolve) => setTimeout(resolve, 200));
    await expect(scrollButtonsOf(bar)).toHaveLength(0);

    await userEvent.click(canvas.getByRole('button', { name: 'Lengthen labels' }));
    await waitFor(() => expect(scroller.scrollWidth).toBeGreaterThan(scroller.clientWidth));
    await waitFor(() => expect(scrollButtonsOf(bar).length).toBeGreaterThan(0));
  },
};

/** Shrinking the container keeps the selected tab visible. */
const ResizeHarness = () => {
  const [width, setWidth] = useState(1000);
  const tabs = makeTabs(['Alpha', 'Beta', 'Gamma', 'Delta']);
  const [value, setValue] = useState<string>(tabs[3].value);
  return (
    <div>
      <button type="button" onClick={() => setWidth(220)}>
        Shrink
      </button>
      <div style={{ width }}>
        <Tabs tabs={tabs} value={value} onChange={(_e, next) => setValue(next)} />
      </div>
    </div>
  );
};

export const SelectedVisibleAfterResize: Story = {
  render: () => <ResizeHarness />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const scroller = scrollerOf(canvas.getByRole('tablist'));
    const selected = canvas.getByRole('tab', { name: 'Delta' });
    await expect(selected).toHaveAttribute('aria-selected', 'true');
    await expect(isInside(selected, scroller)).toBe(true);

    await userEvent.click(canvas.getByRole('button', { name: 'Shrink' }));
    await waitFor(() => expect(scroller.scrollWidth).toBeGreaterThan(scroller.clientWidth));
    await waitFor(() => expect(isInside(selected, scroller)).toBe(true));
  },
};
