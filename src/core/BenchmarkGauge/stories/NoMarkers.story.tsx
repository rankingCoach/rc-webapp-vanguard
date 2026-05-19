import { expect } from 'storybook/test';

import { defaultProps, getMarkers, Story } from './_BenchmarkGauge.default';

export const NoMarkers: Story = {
  name: 'No markers — empty track',
  args: {
    ...defaultProps,
    markers: [],
  },
  play: async ({ canvasElement }) => {
    // Component renders the track bar without crashing when markers array is empty
    await expect(canvasElement.firstElementChild).toBeInTheDocument();
    // No marker elements appear in the DOM
    await expect(getMarkers(canvasElement)).toHaveLength(0);
  },
};