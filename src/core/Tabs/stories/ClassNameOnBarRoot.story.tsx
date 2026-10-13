import React from 'react';
import { expect, within } from 'storybook/test';

import { makeTabs, Story, VisualHarness } from './_TabsVisual.default';

export const ClassNameOnBarRoot: Story = {
  render: () => (
    <>
      <style>{'.consumer-bar{padding:0 64px;border-bottom:3px solid rgb(255,0,0);margin-bottom:12px}'}</style>
      <VisualHarness className="consumer-bar" tabs={makeTabs(['Alpha', 'Beta', 'Gamma'], true)} />
    </>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const tablist = canvas.getByRole('tablist');

    const bar = tablist.closest('.consumer-bar') as HTMLElement;
    await expect(bar).not.toBeNull();

    const style = getComputedStyle(bar);
    await expect(style.borderBottomWidth).toBe('3px');
    await expect(style.paddingLeft).toBe('64px');
    await expect(style.paddingRight).toBe('64px');
    await expect(style.marginBottom).toBe('12px');

    await expect(bar).toContainElement(tablist);

    // Panels live outside the bar.
    const panels = canvas.getAllByRole('tabpanel', { hidden: true });
    await expect(panels.length).toBeGreaterThan(0);
    panels.forEach((panel) => {
      expect(bar.contains(panel)).toBe(false);
    });
    await expect(bar.querySelector('[role="tabpanel"]')).toBeNull();

    // The consumer class is not on the outer wrapper (the bar's parent).
    await expect(bar.parentElement?.classList.contains('consumer-bar')).toBe(false);
  },
};
