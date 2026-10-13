import React from "react";
import { within, expect } from "storybook/test";
import { Story } from "./_TabPanel.default";

export const WithA11yIds: Story = {
  args: {
    currentTab: 1,
    value: 1,
    id: 'panel-1',
    labelledBy: 'tab-1',
    testId: 'tab-panel-1',
    children: 'Panel with accessibility ids',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const tabPanel = canvas.getByRole('tabpanel');
    await expect(tabPanel).toHaveAttribute('id', 'panel-1');
    await expect(tabPanel).toHaveAttribute('aria-labelledby', 'tab-1');
    await expect(canvas.getByTestId('tab-panel-1')).toBe(tabPanel);
  },
};
