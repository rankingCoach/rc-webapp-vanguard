import { expect, within } from 'storybook/test';

import { defaultProps, getMarkers, insideEndLabel, insideStartLabel, Story } from './_BenchmarkGauge.default';

export const InsideLabels: Story = {
  name: 'Labels — inside',
  args: {
    ...defaultProps,
    showLabels: true,
    startLabel: insideStartLabel,
    endLabel: insideEndLabel,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Both custom labels render inside the track bar
    await expect(canvas.getByText('Min')).toBeInTheDocument();
    await expect(canvas.getByText('Max')).toBeInTheDocument();
    // Markers still render alongside labels
    await expect(getMarkers(canvasElement)).toHaveLength(2);
  },
};