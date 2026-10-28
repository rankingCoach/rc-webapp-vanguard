import React from 'react';
import { expect, userEvent, within } from 'storybook/test';

import { Story, VisualHarness } from './_TabsVisual.default';

const avatarsIn = (el: HTMLElement) =>
  el.querySelectorAll('[data-testid="avatar-icon-test-id"], [data-testid="avatar-name-test-id"]');

export const IconsWithStringValues: Story = {
  render: () => (
    <VisualHarness
      tabs={
        [
          { label: 'Single', value: 'google', tabIcons: ['google'] },
          { label: 'Double', value: 'social', tabIcons: ['google', 'twitter'] },
        ] as any
      }
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const single = canvas.getByRole('tab', { name: /Single/ });
    const double = canvas.getByRole('tab', { name: /Double/ });

    await expect(avatarsIn(single).length).toBe(1);
    await expect(avatarsIn(double).length).toBe(2);

    await expect(single).toHaveAttribute('aria-selected', 'true');
    await expect(double).toHaveAttribute('aria-selected', 'false');

    await userEvent.click(canvas.getByRole('tab', { name: /Double/ }));
    await expect(canvas.getByRole('tab', { name: /Double/ })).toHaveAttribute('aria-selected', 'true');
    await expect(canvas.getByRole('tab', { name: /Single/ })).toHaveAttribute('aria-selected', 'false');
  },
};
