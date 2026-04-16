import { expect } from 'storybook/test';

import { defaultProps, getMarkers, RankedPin, Story } from './_BenchmarkGauge.default';

export const RankScenarioA: Story = {
  name: 'Rank A — A lowest · B middle · C highest',
  args: {
    ...defaultProps,
    markers: [
      { id: 'a', value: 20, label: 'Marker A', renderPin: RankedPin },
      { id: 'b', value: 50, label: 'Marker B', renderPin: RankedPin },
      { id: 'c', value: 80, label: 'Marker C', renderPin: RankedPin },
    ],
  },
  play: async ({ canvasElement }) => {
    // All three rank-colored custom-pin markers render without crashing
    await expect(getMarkers(canvasElement)).toHaveLength(3);
  },
};