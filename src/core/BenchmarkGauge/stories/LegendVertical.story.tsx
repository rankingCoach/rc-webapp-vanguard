import React from 'react';
import { expect, within } from 'storybook/test';

import { defaultProps, getMarkers, PlainLegendContent, Story } from './_BenchmarkGauge.default';

export const LegendVertical: Story = {
  name: 'Legend — vertical (legend to right, plain content)',
  args: {
    ...defaultProps,
    orientation: 'vertical',
    markers: [
      {
        id: 'a',
        value: 25,
        label: 'Marker A',
        renderLegend: ({ marker }) => <PlainLegendContent label={marker.label} value={marker.value} />,
      },
      {
        id: 'b',
        value: 60,
        label: 'Marker B',
        renderLegend: ({ marker }) => <PlainLegendContent label={marker.label} value={marker.value} />,
      },
    ],
  },
  decorators: [
    (StoryFn) => (
      <div style={{ height: 320, display: 'flex', justifyContent: 'center' }}>
        <StoryFn />
      </div>
    ),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Both vertical legend items render their label and value
    await expect(canvas.getByText('Marker A')).toBeInTheDocument();
    await expect(canvas.getByText('Marker B')).toBeInTheDocument();
    await expect(canvas.getByText('25')).toBeInTheDocument();
    await expect(canvas.getByText('60')).toBeInTheDocument();
    // Both markers are positioned on the vertical track
    await expect(getMarkers(canvasElement, 'vertical')).toHaveLength(2);
  },
};