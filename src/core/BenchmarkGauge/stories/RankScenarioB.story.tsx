import { expect } from 'storybook/test';

import { defaultProps, getMarkers, RankedPin, Story } from './_BenchmarkGauge.default';

export const RankScenarioB: Story = {
  name: 'Rank B — C lowest · A middle · B highest',
  args: {
    ...defaultProps,
    markers: [
      { id: 'a', value: 50, label: 'Marker A', renderPin: RankedPin },
      { id: 'b', value: 80, label: 'Marker B', renderPin: RankedPin },
      { id: 'c', value: 20, label: 'Marker C', renderPin: RankedPin },
    ],
  },
  play: async ({ canvasElement }) => {
    // Rank colors follow value order (not marker ID); all three render safely
    await expect(getMarkers(canvasElement)).toHaveLength(3);
  },
};