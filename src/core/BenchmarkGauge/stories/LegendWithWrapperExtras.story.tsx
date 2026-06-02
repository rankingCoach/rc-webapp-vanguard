import React from 'react';
import { expect, userEvent, within } from 'storybook/test';

import { BenchmarkGaugeMarkerType, MarkerRenderContext } from '../types';
import { defaultProps, getMarkers, PlainLegendContent, Story } from './_BenchmarkGauge.default';

function CustomPin({ isHighlighted }: { isHighlighted: boolean }) {
  const scale = isHighlighted ? 1.375 : 1;
  return (
    <span
      aria-hidden="true"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 16,
        height: 16,
        borderRadius: '50%',
        border: '3px solid #fff',
        color: '#fff',
        fontSize: 10,
        fontWeight: 700,
        transform: `scale(${scale})`,
        transition: 'transform 0.2s ease, background 0.15s ease, box-shadow 0.15s ease',
        willChange: 'transform',
      }}
    >
      <span
        style={{
          display: 'flex',
          lineHeight: 1,
          opacity: isHighlighted ? 1 : 0,
          transform: isHighlighted ? 'scale(1)' : 'scale(0.5)',
          transition: 'opacity 0.15s ease 0.05s, transform 0.15s ease 0.05s',
        }}
      >
        ✓
      </span>
    </span>
  );
}

const markersWithCustomPin: BenchmarkGaugeMarkerType[] = [
  {
    id: 'a',
    value: 25,
    label: 'Marker A',
    renderPin: ({ isHighlighted }: MarkerRenderContext) => <CustomPin isHighlighted={isHighlighted} />,
    renderLegend: ({ marker }: MarkerRenderContext) => <PlainLegendContent label={marker.label} value={marker.value} />,
  },
  {
    id: 'b',
    value: 55,
    label: 'Marker B',
    renderPin: ({ isHighlighted }: MarkerRenderContext) => <CustomPin isHighlighted={isHighlighted} />,
    renderLegend: ({ marker }: MarkerRenderContext) => <PlainLegendContent label={marker.label} value={marker.value} />,
  },
  {
    id: 'c',
    value: 80,
    label: 'Marker C',
    renderPin: ({ isHighlighted }: MarkerRenderContext) => <CustomPin isHighlighted={isHighlighted} />,
    renderLegend: ({ marker }: MarkerRenderContext) => <PlainLegendContent label={marker.label} value={marker.value} />,
  },
];

export const LegendWithWrapperExtras: Story = {
  name: 'Legend — wrapper grows marker on hover/active, horizontal',
  args: {
    ...defaultProps,
    markers: markersWithCustomPin,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // All three legend items render their content
    await expect(canvas.getByText('Marker A')).toBeInTheDocument();
    await expect(canvas.getByText('Marker B')).toBeInTheDocument();
    await expect(canvas.getByText('Marker C')).toBeInTheDocument();
    // All three markers (with custom pins) are on the track
    await expect(getMarkers(canvasElement)).toHaveLength(3);
    const legendItemA = canvas.getByText('Marker A').closest('[class]') as HTMLElement;
    await userEvent.hover(legendItemA);
    await expect(canvas.getByText('Marker A')).toBeInTheDocument();
    await userEvent.unhover(legendItemA);
    await expect(canvas.getByText('Marker A')).toBeInTheDocument();
  },
};