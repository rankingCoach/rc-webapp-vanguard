import React from 'react';
import { expect, within } from 'storybook/test';

import { Tabs } from '../Tabs';
import { Story } from './_Tabs.default';

// Consumers (EngagementPlannerCalendarHeader) write `<Tabs ...></Tabs>` with no content: must compile and render.
export const EmptyChildren: Story = {
  render: () => (
    <div data-testid="empty-children">
      <Tabs
        value="a"
        tabs={[
          { label: 'A', value: 'a' },
          { label: 'B', value: 'b' },
        ]}
      ></Tabs>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const scope = within(within(canvasElement).getByTestId('empty-children'));
    await expect(scope.getAllByRole('tab')).toHaveLength(2);
    const selected = scope.getByRole('tab', { name: 'A' });
    await expect(selected).toHaveAttribute('aria-selected', 'true');
    // Default theme is highlight (rounded, no bottom border).
    const style = getComputedStyle(selected);
    await expect(style.borderRadius).toBe('8px');
    await expect(style.borderBottomWidth).toBe('0px');
  },
};
