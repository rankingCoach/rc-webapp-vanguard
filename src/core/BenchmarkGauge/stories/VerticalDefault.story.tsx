import React from 'react';
import { expect, within } from 'storybook/test';

import { defaultProps, getMarkers, Story, twoMarkers } from './_BenchmarkGauge.default';

export const VerticalDefault: Story = {
  name: 'Vertical',
  args: {
    ...defaultProps,
    showLabels: true,
    orientation: 'vertical',
    markers: twoMarkers,
    startLabel: '0',
    endLabel: '100',
  },
  decorators: [
    (Story) => (
      <div style={{ height: 300, display: 'flex', justifyContent: 'center' }}>
        <Story />
      </div>
    ),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Both range-boundary labels render inside the vertical track bar
    await expect(canvas.getByText('0')).toBeInTheDocument();
    await expect(canvas.getByText('100')).toBeInTheDocument();
    // Both markers are positioned on the vertical track (bottom style, not left)
    await expect(getMarkers(canvasElement, 'vertical')).toHaveLength(2);
  },
};