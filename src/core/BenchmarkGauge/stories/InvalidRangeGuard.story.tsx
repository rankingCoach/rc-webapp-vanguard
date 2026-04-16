import { expect } from 'storybook/test';

import { defaultProps, getMarkers, Story } from './_BenchmarkGauge.default';

export const InvalidRangeGuard: Story = {
  name: 'Invalid range — max <= min renders safely',
  args: {
    ...defaultProps,
    min: 100,
    max: 0, // invalid — component must not throw; valueToPercent returns 0
    markers: [{ id: 'x', value: 50, label: 'X' }],
  },
  play: async ({ canvasElement }) => {
    // Component does not throw when max < min — valueToPercent clamps to 0
    await expect(canvasElement.firstElementChild).toBeInTheDocument();
    // The single marker renders, positioned at 0% by the guard in valueToPercent
    await expect(getMarkers(canvasElement)).toHaveLength(1);
  },
};