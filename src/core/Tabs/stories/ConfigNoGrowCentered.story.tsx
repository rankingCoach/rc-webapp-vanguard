import React from 'react';
import { expect, within } from 'storybook/test';

import { barRootOf, makeTabs, Story, VisualHarness } from './_TabsVisual.default';

export const ConfigNoGrowCentered: Story = {
  render: () => (
    <VisualHarness
      testId="nogrow"
      tabs={makeTabs(['One', 'Two', 'Three'])}
      tabConfig={{
        tabHeight: 'small',
        tabNoMinWidth: true,
        padding: 'small',
        tabGrow: false,
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
      expect(style.flexGrow).toBe('0');
      expect(style.minWidth).toBe('0px');
      expect(style.paddingTop).toBe('8px');
    });

    // C14: data-testid is `${testId}-${index}`.
    for (let i = 0; i < 3; i++) {
      await expect(canvas.getByTestId(`nogrow-${i}`)).toBeInTheDocument();
    }

    await expect(getComputedStyle(barRootOf(canvas.getByRole('tablist'))).alignItems).toBe('center');
  },
};
