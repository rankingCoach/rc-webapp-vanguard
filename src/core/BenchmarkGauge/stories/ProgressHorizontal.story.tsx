import { expect } from 'storybook/test';

import { defaultProps, getMarkers, progressMarkers, Story } from './_BenchmarkGauge.default';

export const ProgressHorizontal: Story = {
  name: 'Progress mode — horizontal (mid endpoint)',
  args: {
    ...defaultProps,
    markers: progressMarkers,
    progressMarkerId: 'high',
  },
  play: async ({ canvasElement }) => {
    // Progress mode with endpoint at 80% renders all three markers without crashing
    await expect(getMarkers(canvasElement)).toHaveLength(3);
  },
};