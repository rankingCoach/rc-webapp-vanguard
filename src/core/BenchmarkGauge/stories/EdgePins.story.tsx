import { expect } from 'storybook/test';

import { BenchmarkGaugeMarkerType } from '../types';
import { defaultProps, getMarkers, Story } from './_BenchmarkGauge.default';

const edgeMarkers: BenchmarkGaugeMarkerType[] = [
  { id: 'at-min', value: 0, label: 'At min' },
  { id: 'at-max', value: 100, label: 'At max' },
];

export const EdgePins: Story = {
  name: 'Edge pins — value at min and max',
  args: {
    ...defaultProps,
    markers: edgeMarkers,
  },
  play: async ({ canvasElement }) => {
    // Markers at the absolute extremes of the scale (0 and 100) are clamped safely
    // by markerPosition and rendered without crashing or escaping the track bounds.
    await expect(getMarkers(canvasElement)).toHaveLength(2);
  },
};