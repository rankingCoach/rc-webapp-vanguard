import React from 'react';
import { expect, waitFor, within } from 'storybook/test';

import { barRootOf, makeTabs, Story, VisualHarness } from './_TabsVisual.default';

const iconTabs = [
  { ...makeTabs(['Single'])[0], tabIcons: ['google'] },
  { ...makeTabs(['Double'])[0], tabIcons: ['google', 'twitter'] },
] as any;

export const ConfigUnderlineIcons: Story = {
  render: () => (
    <VisualHarness
      className="icons-bar"
      tabs={iconTabs}
      tabConfig={{ theme: 'underline', padding: 'small', iconSize: 'small' }}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const tabs = canvas.getAllByRole('tab');
    await expect(tabs).toHaveLength(2);

    tabs.forEach((tab) => {
      const style = getComputedStyle(tab);
      expect(style.paddingTop).toBe('8px');
      expect(style.paddingRight).toBe('8px');
      expect(style.paddingBottom).toBe('8px');
      expect(style.paddingLeft).toBe('8px');
      expect(style.borderBottomWidth).toBe('2px');
    });

    // iconSize small -> 'xs' avatars (16px).
    const avatars = canvasElement.querySelectorAll(
      '[data-testid="avatar-icon-test-id"], [data-testid="avatar-name-test-id"]',
    );
    await expect(avatars).toHaveLength(3);
    // Icons load asynchronously; wait for their box to settle before measuring.
    await waitFor(() => {
      avatars.forEach((avatar) => {
        const box = (avatar.querySelector('svg, img') ?? avatar).getBoundingClientRect();
        expect(box.width).toBeCloseTo(16, 0);
        expect(box.height).toBeCloseTo(16, 0);
      });
    });

    // className lands on the bar root.
    const bar = barRootOf(canvas.getByRole('tablist'));
    await expect(bar.classList.contains('icons-bar')).toBe(true);
  },
};
