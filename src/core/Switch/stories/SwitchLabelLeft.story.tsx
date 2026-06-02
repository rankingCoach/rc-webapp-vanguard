import { expect, fn, within } from 'storybook/test';

import { SwitchStory } from './_Switch.default';

export const SwitchLabelLeft: SwitchStory = {
  args: {
    value: false,
    children: 'Label on the left',
    labelPos: 'left',
    testId: 'switch-label-left',
    onChange: fn(),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const input = canvas.getByRole('checkbox');
    await expect(input).toBeInTheDocument();

    const label = canvas.getByText('Label on the left');
    await expect(label).toBeInTheDocument();
    await expect(label).toHaveClass('vanguard-switch-label-left');
  },
};
