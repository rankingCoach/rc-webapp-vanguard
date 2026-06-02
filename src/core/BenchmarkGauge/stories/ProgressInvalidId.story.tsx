import { expect } from 'storybook/test';

import { defaultProps, getMarkers, Story, twoMarkers } from './_BenchmarkGauge.default';

export const ProgressInvalidId: Story = {
  name: 'Progress mode — invalid ID falls back to full track',
  args: {
    ...defaultProps,
    markers: twoMarkers,
    progressMarkerId: 'does-not-exist', // no match → normal full-gradient track
  },
  play: async ({ canvasElement }) => {
    // An unresolvable progressMarkerId silently falls back to full-track rendering.
    // Both markers must still appear; the component must not crash or warn visibly.
    await expect(getMarkers(canvasElement)).toHaveLength(2);
  },
};