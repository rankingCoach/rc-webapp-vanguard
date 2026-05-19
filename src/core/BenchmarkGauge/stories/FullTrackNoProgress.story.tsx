import { expect } from 'storybook/test';

import { defaultProps, getMarkers, progressMarkers, Story } from './_BenchmarkGauge.default';

export const FullTrackNoProgress: Story = {
  name: 'Full-track mode — no progressMarkerId (baseline)',
  args: {
    ...defaultProps,
    markers: progressMarkers,
    // progressMarkerId absent — backward-compatible full gradient
  },
  play: async ({ canvasElement }) => {
    // Baseline full-track mode (no progressMarkerId) renders all three markers
    await expect(getMarkers(canvasElement)).toHaveLength(3);
  },
};