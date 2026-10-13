import React from 'react';
import { expect, within } from 'storybook/test';

import { Story, TabsHarness } from './_Tabs.default';

const tabs = [
  { label: 'Visible one', value: 'a', component: <p>Panel A</p> },
  { label: 'Hidden', value: 'b', disabled: true, component: <p>Panel Hidden</p> },
  { label: 'Visible two', value: 'c', component: <p>Panel C</p> },
];

export const DisabledHidden: Story = {
  render: () => (
    <div>
      <div data-testid="plain">
        <TabsHarness initialValue="a" tabs={tabs} />
      </div>
      <div data-testid="kept">
        <TabsHarness initialValue="a" keepInactiveTabsInDom tabs={tabs} />
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const plain = within(canvas.getByTestId('plain'));
    await expect(plain.getAllByRole('tab')).toHaveLength(2);
    await expect(plain.queryByRole('tab', { name: 'Hidden' })).not.toBeInTheDocument();

    const kept = within(canvas.getByTestId('kept'));
    await expect(kept.getAllByRole('tab')).toHaveLength(2);
    await expect(kept.queryByRole('tab', { name: 'Hidden' })).not.toBeInTheDocument();
    // panel stays mounted but is not visible
    await expect(kept.getByText('Panel Hidden', { selector: 'p' })).toBeInTheDocument();
    await expect(kept.getByText('Panel Hidden')).not.toBeVisible();
  },
};
