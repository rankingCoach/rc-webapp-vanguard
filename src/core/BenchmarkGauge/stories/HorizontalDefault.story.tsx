import { expect, within } from 'storybook/test';

import { defaultProps, getMarkers, Story } from './_BenchmarkGauge.default';

export const HorizontalDefault: Story = {
  name: 'Horizontal (default)',
  args: {
    ...defaultProps,
    showLabels: true,
    startLabel: '0',
    endLabel: '100',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Both range-boundary labels render inside the track bar
    await expect(canvas.getByText('0')).toBeInTheDocument();
    await expect(canvas.getByText('100')).toBeInTheDocument();
    // Both markers are positioned on the horizontal track
    await expect(getMarkers(canvasElement)).toHaveLength(2);
  },
};