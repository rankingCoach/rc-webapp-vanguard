import { expect, within } from 'storybook/test';

import { defaultProps, getMarkers, PlainLegendContent, Story } from './_BenchmarkGauge.default';

export const LegendPartial: Story = {
  name: 'Legend — partial (only some markers have legend items)',
  args: {
    ...defaultProps,
    markers: [
      {
        id: 'a',
        value: 20,
        label: 'Marker A',
        renderLegend: ({ marker }) => <PlainLegendContent label={marker.label} value={marker.value} />,
      },
      {
        id: 'b',
        value: 65,
        label: 'Marker B',
        // no renderLegend — this marker has no legend slot
      },
      {
        id: 'c',
        value: 85,
        label: 'Marker C',
        renderLegend: ({ marker }) => <PlainLegendContent label={marker.label} value={marker.value} />,
      },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Markers A and C provide renderLegend — their labels appear in the legend
    await expect(canvas.getByText('Marker A')).toBeInTheDocument();
    await expect(canvas.getByText('Marker C')).toBeInTheDocument();
    // Marker B has no renderLegend — its label must not appear anywhere in the DOM
    await expect(canvas.queryByText('Marker B')).not.toBeInTheDocument();
    // All three markers still render on the track (legend and track are independent)
    await expect(getMarkers(canvasElement)).toHaveLength(3);
  },
};