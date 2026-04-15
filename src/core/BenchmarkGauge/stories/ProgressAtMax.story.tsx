import { expect } from 'storybook/test';

import { defaultProps, getMarkers, Story } from './_BenchmarkGauge.default';

export const ProgressAtMax: Story = {
  name: 'Progress mode — endpoint at max (100% fill)',
  args: {
    ...defaultProps,
    min: 0,
    max: 100,
    markers: [
      { id: 'start', value: 30, label: 'Start' },
      { id: 'full', value: 100, label: 'Full' },
    ],
    progressMarkerId: 'full', // fill reaches end, visually same as full-track mode
  },
  play: async ({ canvasElement }) => {
    // At 100% fill the clip resolves to '0px'; both markers render safely
    await expect(canvasElement.firstElementChild).toBeInTheDocument();
    await expect(getMarkers(canvasElement)).toHaveLength(2);
  },
};