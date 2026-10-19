import React from 'react';
import { expect, fn, userEvent, within } from 'storybook/test';

import { Story, TabsHarness } from './_Tabs.default';

export const BarOnly: Story = {
  args: {
    onChange: fn(),
    tabs: [
      { label: 'Alpha', value: 'alpha' },
      { label: 'Beta', value: 'beta' },
      { label: 'Gamma', value: 'gamma' },
    ],
  },
  render: (args) => <TabsHarness {...args} initialValue="alpha" />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByRole('tablist')).toBeInTheDocument();
    await expect(canvas.getAllByRole('tab')).toHaveLength(3);

    await userEvent.click(canvas.getByRole('tab', { name: 'Beta' }));
    await expect(args.onChange).toHaveBeenCalledWith(expect.anything(), 'beta');
    await expect(canvas.getByRole('tab', { name: 'Beta' })).toHaveAttribute('aria-selected', 'true');
  },
};
