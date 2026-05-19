import { expect, within } from 'storybook/test';

import { defaultProps, getMarkers, insideEndLabel, insideStartLabel, Story, threeMarkers } from './_BenchmarkGauge.default';

export const InsideLabelsWithProgress: Story = {
  name: 'Labels — inside + progress mode',
  args: {
    ...defaultProps,
    showLabels: true,
    markers: threeMarkers,
    startLabel: insideStartLabel,
    endLabel: insideEndLabel,
    progressMarkerId: 'mid',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Labels remain visible in the two-layer progress rendering
    await expect(canvas.getByText('Min')).toBeInTheDocument();
    await expect(canvas.getByText('Max')).toBeInTheDocument();
    // All three markers render in progress mode
    await expect(getMarkers(canvasElement)).toHaveLength(3);
  },
};