import { expect } from 'storybook/test';

import { BenchmarkGaugeMarkerType } from '../types';
import { defaultProps, getMarkers, Story } from './_BenchmarkGauge.default';

const closeMarkers: BenchmarkGaugeMarkerType[] = [
  { id: 'a', value: 50, label: 'A' },
  { id: 'b', value: 52, label: 'B' },
];

export const OverlappingMarkers: Story = {
  name: 'Overlapping markers — active on top',
  args: {
    ...defaultProps,
    markers: closeMarkers,
  },
  play: async ({ canvasElement }) => {
    // Both markers at near-identical positions (50 and 52) render without crashing.
    // The component must not drop either marker or throw when they overlap visually.
    await expect(getMarkers(canvasElement)).toHaveLength(2);
  },
};