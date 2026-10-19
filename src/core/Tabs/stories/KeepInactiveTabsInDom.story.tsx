import React from 'react';
import { expect, userEvent, within } from 'storybook/test';

import { Story, TabsHarness } from './_Tabs.default';

export const KeepInactiveTabsInDom: Story = {
  render: () => (
    <TabsHarness
      initialValue="a"
      keepInactiveTabsInDom
      tabs={[
        { label: 'A', value: 'a', component: <input aria-label="Note A" /> },
        { label: 'B', value: 'b', component: <input aria-label="Note B" /> },
      ]}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const inputA = canvas.getByLabelText('Note A', { selector: 'input' });
    await userEvent.type(inputA, 'hello');
    await expect(inputA).toHaveValue('hello');

    await userEvent.click(canvas.getByRole('tab', { name: 'B' }));
    await expect(canvas.getByLabelText('Note B')).toBeVisible();
    await expect(inputA).toBeInTheDocument();
    await expect(inputA).not.toBeVisible();
    await expect(inputA).toHaveValue('hello');

    await userEvent.click(canvas.getByRole('tab', { name: 'A' }));
    await expect(inputA).toBeVisible();
    await expect(inputA).toHaveValue('hello');
  },
};
