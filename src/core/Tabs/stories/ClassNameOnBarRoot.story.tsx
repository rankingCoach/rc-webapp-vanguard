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

// C10 on the floating theme: consumer single-class rules on the bar root still win over the floating bar styles.
export const ClassNameOnFloatingBar: Story = {
  render: () => (
    <div style={{ width: 600 }}>
      <style>{'.consumer-floating-bar{padding:0 32px;margin-inline:0}'}</style>
      <VisualHarness className="consumer-floating-bar" theme="floating" tabs={makeTabs(['Alpha', 'Beta'])} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const bar = within(canvasElement).getByRole('tablist').closest('.consumer-floating-bar') as HTMLElement;
    await expect(bar).not.toBeNull();
    const style = getComputedStyle(bar);
    await expect(style.paddingLeft).toBe('32px');
    await expect(style.marginLeft).toBe('0px');
    // Floating look is otherwise preserved.
    await expect(style.borderRadius).toBe('26px');
  },
};
