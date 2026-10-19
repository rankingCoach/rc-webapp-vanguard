import React from 'react';
import { expect, within } from 'storybook/test';

import { barRootOf, Story, VisualHarness } from './_TabsVisual.default';

export const ConfigGrowCenteredIcons: Story = {
  render: () => (
    <VisualHarness
      className="grow-bar"
      tabs={
        [
          { label: 'Google', value: 'google', tabIcons: ['google'] },
          { label: 'Bing', value: 'bing', tabIcons: ['bing'] },
          { label: 'Apple', value: 'apple', tabIcons: ['apple-maps'] },
        ] as any
      }
      tabConfig={{
        tabHeight: 'small',
        tabNoMinWidth: false,
        padding: 'small',
        tabGrow: true,
        alignCenter: true,
      }}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const tabs = canvas.getAllByRole('tab');
    await expect(tabs).toHaveLength(3);

    tabs.forEach((tab) => {
      const style = getComputedStyle(tab);
      expect(style.flexGrow).toBe('1');
      expect(style.minWidth).toBe('90px');
      expect(style.paddingTop).toBe('8px');
      expect(style.paddingLeft).toBe('8px');
      expect(tab.getBoundingClientRect().height).toBeCloseTo(36, 0);
    });

    const bar = barRootOf(canvas.getByRole('tablist'));
    await expect(bar.classList.contains('grow-bar')).toBe(true);
    await expect(getComputedStyle(bar).alignItems).toBe('center');
    await expect(getComputedStyle(bar).display).toBe('flex');
  },
};
