import { expect } from 'storybook/test';

import { defaultProps, getMarkers, Story } from './_BenchmarkGauge.default';

export const ProgressAtMin: Story = {
  name: 'Progress mode — endpoint at min (0% fill, ghost only)',
  args: {
    ...defaultProps,
    min: 0,
    max: 100,
    markers: [
      { id: 'zero', value: 0, label: 'At zero' },
      { id: 'far', value: 75, label: 'Far' },
    ],
    progressMarkerId: 'zero', // fill is suppressed; only the ghost layer shows
  },
  play: async ({ canvasElement }) => {
    // At 0% fill the vivid layer is suppressed; only the ghost layer shows.
    // Component must not crash and both markers must still render.
    await expect(canvasElement.firstElementChild).toBeInTheDocument();
    await expect(getMarkers(canvasElement)).toHaveLength(2);
  },
};