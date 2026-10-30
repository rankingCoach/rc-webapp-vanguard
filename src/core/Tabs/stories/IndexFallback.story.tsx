import React from 'react';
import { expect, fn, userEvent, within } from 'storybook/test';

import { Story, TabsHarness } from './_Tabs.default';

export const IndexFallback: Story = {
  args: {
    onChange: fn(),
    tabs: [
      { label: 'First', component: <p>Panel one</p> },
      { label: 'Second', component: <p>Panel two</p> },
      { label: 'Third', component: <p>Panel three</p> },
    ],
  },
  render: (args) => <TabsHarness {...args} initialValue={0} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByRole('tab', { name: 'First' })).toHaveAttribute('aria-selected', 'true');
    await expect(canvas.getByText('Panel one')).toBeVisible();

    await userEvent.click(canvas.getByRole('tab', { name: 'Second' }));

    await expect(args.onChange).toHaveBeenCalledWith(expect.anything(), 1);
    await expect(canvas.getByRole('tab', { name: 'Second' })).toHaveAttribute('aria-selected', 'true');
    await expect(canvas.getByRole('tab', { name: 'First' })).toHaveAttribute('aria-selected', 'false');
    await expect(canvas.getByText('Panel two')).toBeVisible();
  },
};
