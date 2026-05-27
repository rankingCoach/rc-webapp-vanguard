import { expect, fn, userEvent, within } from 'storybook/test';

import { SwitchStory } from './_Switch.default';

export const SwitchDisabled: SwitchStory = {
  args: {
    value: false,
    children: 'Disabled switch',
    disabled: true,
    testId: 'switch-disabled',
    onChange: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    const input = canvas.getByRole('checkbox');
    await expect(input).toBeInTheDocument();
    await expect(input).toBeDisabled();

    await userEvent.click(input);
    await expect(args.onChange).toHaveBeenCalledTimes(0);
  },
};
