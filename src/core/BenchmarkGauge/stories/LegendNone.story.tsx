import { expect, within } from 'storybook/test';

import { defaultProps, getMarkers, Story } from './_BenchmarkGauge.default';

export const LegendNone: Story = {
  name: 'Legend — absent (no renderLegend on any marker)',
  args: {
    ...defaultProps,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // No legend item content renders when no marker provides renderLegend
    await expect(canvas.queryByText('Alpha')).not.toBeInTheDocument();
    await expect(canvas.queryByText('Beta')).not.toBeInTheDocument();
    // Both track markers still render without a legend
    await expect(getMarkers(canvasElement)).toHaveLength(2);
  },
};