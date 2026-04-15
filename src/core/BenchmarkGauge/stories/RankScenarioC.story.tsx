import { expect } from 'storybook/test';

import { defaultProps, getMarkers, RankedPin, Story } from './_BenchmarkGauge.default';

export const RankScenarioC: Story = {
  name: 'Rank C — B lowest · C middle · A highest',
  args: {
    ...defaultProps,
    markers: [
      { id: 'a', value: 90, label: 'Marker A', renderPin: RankedPin },
      { id: 'b', value: 25, label: 'Marker B', renderPin: RankedPin },
      { id: 'c', value: 60, label: 'Marker C', renderPin: RankedPin },
    ],
  },
  play: async ({ canvasElement }) => {
    // Rank color assignment is independent of marker ID; all three render safely
    await expect(getMarkers(canvasElement)).toHaveLength(3);
  },
};