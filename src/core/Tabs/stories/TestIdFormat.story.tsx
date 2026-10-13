import React from 'react';
import { expect, within } from 'storybook/test';

import { Story, TabsHarness } from './_Tabs.default';

export const TestIdFormat: Story = {
  render: () => (
    <TabsHarness
      testId="t"
      initialValue="a"
      tabs={[
        { label: 'A', value: 'a' },
        { label: 'B', value: 'b', disabled: true },
        { label: 'C', value: 'c', tabIcons: ['google', 'twitter'] },
      ]}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // index is the position in the tabs array, including hidden tabs
    await expect(canvas.getByTestId('t-0')).toHaveTextContent('A');
    await expect(canvas.queryByTestId('t-1')).not.toBeInTheDocument();
    await expect(canvas.getByTestId('t-2')).toBeInTheDocument();
    await expect(canvas.getByTestId('t-2')).toHaveTextContent('C');
  },
};
