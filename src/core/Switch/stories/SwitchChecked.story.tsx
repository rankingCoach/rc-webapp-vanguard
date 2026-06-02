import { expect, fn, within } from 'storybook/test';

import { SwitchStory } from './_Switch.default';

export const SwitchChecked: SwitchStory = {
  args: {
    value: true,
    children: 'Switch is on',
    size: 'small',
    testId: 'switch-checked',
    onChange: fn(),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const input = canvas.getByRole('checkbox');
    await expect(input).toBeInTheDocument();
    await expect(input).toBeChecked();
    await expect(input).not.toBeDisabled();
  },
};
