import { expect, within } from 'storybook/test';

import { defaultProps, getMarkers, insideEndLabel, insideStartLabel, Story } from './_BenchmarkGauge.default';

export const InsideLabelsWithOverlap: Story = {
  name: 'Labels — inside, markers near edges (overlap test)',
  args: {
    ...defaultProps,
    showLabels: true,
    markers: [
      { id: 'edge-start', value: 5, label: 'Near start' },
      { id: 'edge-end', value: 95, label: 'Near end' },
    ],
    startLabel: insideStartLabel,
    endLabel: insideEndLabel,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Labels remain visible even when markers are positioned near them
    await expect(canvas.getByText('Min')).toBeInTheDocument();
    await expect(canvas.getByText('Max')).toBeInTheDocument();
    // Both edge markers render without crashing or being suppressed
    await expect(getMarkers(canvasElement)).toHaveLength(2);
  },
};