import React from 'react';
import { expect, within } from 'storybook/test';

import {
  barRootOf,
  makeTabs,
  resolvedVarColor,
  sampleLabels,
  Story,
  VisualHarness,
  wrapperOf,
} from './_TabsVisual.default';

const TRANSPARENT = 'rgba(0, 0, 0, 0)';

export const ConfigFloating: Story = {
  render: () => <VisualHarness tabs={makeTabs(sampleLabels)} tabConfig={{ theme: 'floating' }} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const tablist = canvas.getByRole('tablist');
    const tabs = canvas.getAllByRole('tab');

    tabs.forEach((tab, index) => {
      const style = getComputedStyle(tab);
      expect(style.borderRadius).toBe('24px');
      expect(style.flexGrow).toBe('0');
      expect(style.minHeight).toBe('0px');
      expect(style.paddingTop).toBe('8px');
      expect(style.paddingLeft).toBe('16px');
      if (index === 0) {
        expect(style.backgroundColor).not.toBe(TRANSPARENT);
      }
    });

    const bar = barRootOf(tablist);
    const barStyle = getComputedStyle(bar);
    await expect(barStyle.borderRadius).toBe('26px');
    await expect(barStyle.minHeight).toBe('0px');
    await expect(barStyle.paddingTop).toBe('2px');
    await expect(barStyle.backgroundColor).not.toBe(TRANSPARENT);

    // Pill hugs its content instead of stretching across the wrapper.
    const wrapper = wrapperOf(tablist);
    await expect(bar.getBoundingClientRect().width).toBeLessThan(wrapper.getBoundingClientRect().width - 50);

    // Selected label is NOT emphasised in the floating theme.
    const selectedLabel = canvas.getByText(sampleLabels[0]);
    const labelStyle = getComputedStyle(selectedLabel);
    await expect(labelStyle.fontWeight).toBe('400');
    await expect(labelStyle.color).toBe(resolvedVarColor('--fn-fg'));
  },
};
