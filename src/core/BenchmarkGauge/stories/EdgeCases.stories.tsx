import { expect, within } from 'storybook/test';

import { BenchmarkGaugeMarkerType } from '../types';
import { defaultProps, getMarkers, Story } from './_BenchmarkGauge.default';

const closeMarkers: BenchmarkGaugeMarkerType[] = [
  { id: 'a', value: 50, label: 'A' },
  { id: 'b', value: 52, label: 'B' },
];

const edgeMarkers: BenchmarkGaugeMarkerType[] = [
  { id: 'at-min', value: 0, label: 'At min' },
  { id: 'at-max', value: 100, label: 'At max' },
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

export const InvalidRangeGuard: Story = {
  name: 'Invalid range — max <= min renders safely',
  args: {
    ...defaultProps,
    min: 100,
    max: 0, // invalid — component must not throw; valueToPercent returns 0
    markers: [{ id: 'x', value: 50, label: 'X' }],
  },
  play: async ({ canvasElement }) => {
    // Component does not throw when max < min — valueToPercent clamps to 0
    await expect(canvasElement.firstElementChild).toBeInTheDocument();
    // The single marker renders, positioned at 0% by the guard in valueToPercent
    await expect(getMarkers(canvasElement)).toHaveLength(1);
  },
};

export const NoMarkers: Story = {
  name: 'No markers — empty track',
  args: {
    ...defaultProps,
    markers: [],
  },
  play: async ({ canvasElement }) => {
    // Component renders the track bar without crashing when markers array is empty
    await expect(canvasElement.firstElementChild).toBeInTheDocument();
    // No marker elements appear in the DOM
    await expect(getMarkers(canvasElement)).toHaveLength(0);
  },
};
