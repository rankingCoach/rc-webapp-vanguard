import React from 'react';
import { expect, userEvent, within } from 'storybook/test';

import { Story, TabsHarness } from './_Tabs.default';

export const KeyboardNavigation: Story = {
  render: () => (
    <TabsHarness
      initialValue="a"
      tabs={[
        { label: 'One', value: 'a', component: <p>Body one</p> },
        { label: 'Two', value: 'b', component: <p>Body two</p> },
        { label: 'Three', value: 'c', component: <p>Body three</p> },
      ]}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const [one, two, three] = canvas.getAllByRole('tab');

    // roving tabindex: exactly one tab is in the tab order
    await expect(canvas.getAllByRole('tab').filter((t) => t.getAttribute('tabindex') === '0')).toHaveLength(1);
    await expect(one).toHaveAttribute('tabindex', '0');

    one.focus();
    await expect(one).toHaveFocus();

    await userEvent.keyboard('{ArrowRight}');
    await expect(two).toHaveFocus();
    await expect(two).toHaveAttribute('aria-selected', 'false');

    await userEvent.keyboard('{End}');
    await expect(three).toHaveFocus();

    await userEvent.keyboard('{Home}');
    await expect(one).toHaveFocus();

    await userEvent.keyboard('{ArrowRight}');
    await expect(two).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(two).toHaveAttribute('aria-selected', 'true');
    await expect(canvas.getByText('Body two')).toBeVisible();
    await expect(canvas.getAllByRole('tab').filter((t) => t.getAttribute('aria-selected') === 'true')).toHaveLength(1);
  },
};
