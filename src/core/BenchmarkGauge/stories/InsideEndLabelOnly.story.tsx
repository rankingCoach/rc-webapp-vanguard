import { expect, within } from 'storybook/test';

import { defaultProps, insideEndLabel, Story } from './_BenchmarkGauge.default';

export const InsideEndLabelOnly: Story = {
  name: 'Labels — inside, auto start + custom end',
  args: {
    ...defaultProps,
    showLabels: true,
    endLabel: insideEndLabel,
    startLabel: null,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Custom end label renders
    await expect(canvas.getByText('Max')).toBeInTheDocument();
    // Start label auto-generates from min (defaultProps.min = 0) but null is given to startLabel
    await expect(canvas.queryByText('0')).not.toBeInTheDocument();
    // The custom startLabel value 'Min' was never provided — it must not appear
    await expect(canvas.queryByText('Min')).not.toBeInTheDocument();
  },
};