import React from 'react';
import { expect, userEvent, within } from 'storybook/test';

import { Tabs } from '../Tabs';
import { Story, TabsHarness } from './_Tabs.default';

export const UncontrolledAndEmpty: Story = {
  render: () => (
    <div>
      <div data-testid="uncontrolled">
        <TabsHarness
          uncontrolled
          tabs={[
            { label: 'One', value: 'one', component: <p>Body one</p> },
            { label: 'Two', value: 'two', component: <p>Body two</p> },
          ]}
        />
      </div>
      <div data-testid="empty">
        <Tabs tabs={[]} />
      </div>
      <div data-testid="undefined-value">
        <Tabs
          value={undefined}
          keepInactiveTabsInDom
          tabs={[
            { label: 'Lazy', value: 'lazy', component: null },
            { label: 'Eager', value: 'eager', component: <p>Eager body</p> },
          ]}
        />
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // (1) uncontrolled with string values
    const uncontrolled = within(canvas.getByTestId('uncontrolled'));
    await expect(uncontrolled.getAllByRole('tab')).toHaveLength(2);
    await userEvent.click(uncontrolled.getByRole('tab', { name: 'Two' }));
    await expect(uncontrolled.getByRole('tab', { name: 'Two' })).toHaveAttribute('aria-selected', 'true');
    await expect(uncontrolled.getByRole('tab', { name: 'One' })).toHaveAttribute('aria-selected', 'false');

    // (2) empty tabs array
    const empty = within(canvas.getByTestId('empty'));
    await expect(empty.getByRole('tablist')).toBeInTheDocument();
    await expect(empty.queryAllByRole('tab')).toHaveLength(0);

    // (3) value undefined + keepInactiveTabsInDom + component: null
    const undef = within(canvas.getByTestId('undefined-value'));
    await expect(undef.getAllByRole('tab')).toHaveLength(2);
  },
};
