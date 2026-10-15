import React from 'react';
import { expect, fn, userEvent, within } from 'storybook/test';

import { Story, TabsHarness } from './_Tabs.default';

export const OnChangeOnReclick: Story = {
  args: {
    onChange: fn(),
    tabs: [
      { label: 'A', value: 'a' },
      { label: 'B', value: 'b' },
      { label: 'C', value: 'c' },
    ],
  },
  render: (args) => <TabsHarness {...args} initialValue="a" />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const tabB = canvas.getByRole('tab', { name: 'B' });

    await userEvent.click(tabB);
    await userEvent.click(tabB);

    await expect(args.onChange).toHaveBeenCalledTimes(2);
    await expect(args.onChange).toHaveBeenNthCalledWith(1, expect.anything(), 'b');
    await expect(args.onChange).toHaveBeenNthCalledWith(2, expect.anything(), 'b');
  },
};
