import { expect, userEvent, within } from 'storybook/test';

import { defaultProps, getMarkers, PlainLegendContent, Story } from './_BenchmarkGauge.default';

export const LegendWithCoreGrowEffect: Story = {
  name: 'Legend — core grow effect (growHighlightedMarker)',
  args: {
    ...defaultProps,
    growHighlightedMarker: true,
    progressMarkerId: 'b',
    markers: [
      {
        id: 'a',
        value: 25,
        label: 'Marker A',
        color: 'red',
        renderLegend: ({ marker }) => <PlainLegendContent label={marker.label} value={marker.value} />,
      },
      {
        id: 'b',
        value: 55,
        label: 'Marker B',
        color: 'purple',
        renderLegend: ({ marker }) => <PlainLegendContent label={marker.label} value={marker.value} />,
      },
      {
        id: 'c',
        value: 80,
        label: 'Marker C',
        color: 'pink',
        renderLegend: ({ marker }) => <PlainLegendContent label={marker.label} value={marker.value} />,
      },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // All legend items and markers render with the prop enabled
    await expect(canvas.getByText('Marker A')).toBeInTheDocument();
    await expect(canvas.getByText('Marker B')).toBeInTheDocument();
    await expect(canvas.getByText('Marker C')).toBeInTheDocument();
    await expect(getMarkers(canvasElement)).toHaveLength(3);
    const legendItemA = canvas.getByText('Marker A').closest('[class]') as HTMLElement;
    await userEvent.hover(legendItemA);
    await expect(canvas.getByText('Marker A')).toBeInTheDocument();
    await expect(getMarkers(canvasElement)).toHaveLength(3);
    await userEvent.unhover(legendItemA);
    await expect(canvas.getByText('Marker A')).toBeInTheDocument();
  },
};