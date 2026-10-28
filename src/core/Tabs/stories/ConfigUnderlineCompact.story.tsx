import React from 'react';
import { expect, within } from 'storybook/test';

import {
  barRootOf,
  heightOf,
  makeTabs,
  resolvedVarColor,
  sampleLabels,
  Story,
  VisualHarness,
} from './_TabsVisual.default';

export const ConfigUnderlineCompact: Story = {
  render: () => (
    <VisualHarness
      tabs={makeTabs(sampleLabels)}
      tabConfig={{ theme: 'underline', tabHeight: 'small', padding: 'small', tabNoMinWidth: true }}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const tabs = canvas.getAllByRole('tab');
    await expect(tabs).toHaveLength(3);

    const selectedColor = resolvedVarColor('--fn-bg-cta');
    const dividerColor = resolvedVarColor('--fn-divider-gl');

    tabs.forEach((tab, index) => {
      const style = getComputedStyle(tab);
      expect(heightOf(tab)).toBeCloseTo(36, 0);
      expect(style.paddingTop).toBe('8px');
      expect(style.paddingRight).toBe('8px');
      expect(style.paddingBottom).toBe('8px');
      expect(style.paddingLeft).toBe('8px');
      expect(style.minWidth).toBe('0px');
      expect(style.borderBottomWidth).toBe('2px');
      expect(style.borderBottomStyle).toBe('solid');
      expect(style.borderBottomColor).toBe(index === 0 ? selectedColor : dividerColor);
    });

    await expect(tabs[0]).toHaveAttribute('aria-selected', 'true');

    // Bar keeps its 48px minimum even though tabs are 36px tall.
    const bar = barRootOf(canvas.getByRole('tablist'));
    await expect(getComputedStyle(bar).minHeight).toBe('48px');
    await expect(heightOf(bar)).toBeCloseTo(48, 0);
  },
};
