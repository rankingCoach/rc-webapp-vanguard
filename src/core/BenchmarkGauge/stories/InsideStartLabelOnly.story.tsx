import { expect, within } from 'storybook/test';

import { defaultProps, insideStartLabel, Story } from './_BenchmarkGauge.default';

export const InsideStartLabelOnly: Story = {
  name: 'Labels — inside, custom start + auto end',
  args: {
    ...defaultProps,
    showLabels: true,
    startLabel: insideStartLabel,
    endLabel: null,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Custom start label renders
    await expect(canvas.getByText('Min')).toBeInTheDocument();
    // End label auto-generates from max (defaultProps.max = 100), but null is given to endLabel
    await expect(canvas.queryByText('100')).not.toBeInTheDocument();
    // The custom endLabel value 'Max' was never provided — it must not appear
    await expect(canvas.queryByText('Max')).not.toBeInTheDocument();
  },
};