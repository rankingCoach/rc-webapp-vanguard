import { expect, fn, userEvent, within } from 'storybook/test';

import { SwitchStory } from './_Switch.default';

export const SwitchDefault: SwitchStory = {
  args: {
    value: false,
    children: 'Switch example',
    size: 'small',
    testId: 'switch-default',
    onChange: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    const input = canvas.getByRole('checkbox');
    await expect(input).toBeInTheDocument();
    await expect(input).not.toBeChecked();
    await expect(input).not.toBeDisabled();

    await userEvent.click(input);
    await expect(args.onChange).toHaveBeenCalledTimes(1);
  },
};
