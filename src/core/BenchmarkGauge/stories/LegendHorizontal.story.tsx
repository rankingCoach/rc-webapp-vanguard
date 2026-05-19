import { expect, userEvent, within } from 'storybook/test';

import { defaultProps, PlainLegendContent, Story } from './_BenchmarkGauge.default';

export const LegendHorizontal: Story = {
  name: 'Legend — horizontal (core shell behavior, plain content)',
  args: {
    ...defaultProps,
    markers: [
      {
        id: 'a',
        value: 25,
        label: 'Marker A',
        renderLegend: ({ marker }) => <PlainLegendContent label={marker.label} value={marker.value} />,
      },
      {
        id: 'b',
        value: 55,
        label: 'Marker B',
        renderLegend: ({ marker }) => <PlainLegendContent label={marker.label} value={marker.value} />,
      },
      {
        id: 'c',
        value: 80,
        label: 'Marker C',
        renderLegend: ({ marker }) => <PlainLegendContent label={marker.label} value={marker.value} />,
      },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // All three legend items render their label and value
    await expect(canvas.getByText('Marker A')).toBeInTheDocument();
    await expect(canvas.getByText('Marker B')).toBeInTheDocument();
    await expect(canvas.getByText('Marker C')).toBeInTheDocument();
    await expect(canvas.getByText('25')).toBeInTheDocument();
    await expect(canvas.getByText('55')).toBeInTheDocument();
    await expect(canvas.getByText('80')).toBeInTheDocument();
    // Hovering a legend item triggers highlight state without crashing.
    const legendItemA = canvas.getByText('Marker A').closest('[class]') as HTMLElement;
    await userEvent.hover(legendItemA);
    await expect(canvas.getByText('Marker B')).toBeInTheDocument();
    await expect(canvas.getByText('Marker C')).toBeInTheDocument();
    await userEvent.unhover(legendItemA);
    await expect(canvas.getByText('Marker A')).toBeInTheDocument();
  },
};