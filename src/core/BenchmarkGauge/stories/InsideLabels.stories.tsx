import React from 'react';
import { expect, within } from 'storybook/test';

import { defaultProps, getMarkers, Story, threeMarkers, twoMarkers } from './_BenchmarkGauge.default';

const startLabel = <span style={{ fontSize: 12, fontWeight: 600, color: '#fff' }}>Min</span>;
const endLabel = <span style={{ fontSize: 12, fontWeight: 600, color: '#fff' }}>Max</span>;

// ─── Inside labels ─────────────────────────────────────────────────────────────

export const InsideLabels: Story = {
  name: 'Labels — inside',
  args: {
    ...defaultProps,
    showLabels: true,
    startLabel,
    endLabel,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Both custom labels render inside the track bar
    await expect(canvas.getByText('Min')).toBeInTheDocument();
    await expect(canvas.getByText('Max')).toBeInTheDocument();
    // Markers still render alongside labels
    await expect(getMarkers(canvasElement)).toHaveLength(2);
  },
};

// ─── Inside labels + markers overlapping ──────────────────────────────────────

export const InsideLabelsWithOverlap: Story = {
  name: 'Labels — inside, markers near edges (overlap test)',
  args: {
    ...defaultProps,
    showLabels: true,
    markers: [
      { id: 'edge-start', value: 5, label: 'Near start' },
      { id: 'edge-end', value: 95, label: 'Near end' },
    ],
    startLabel,
    endLabel,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Labels remain visible even when markers are positioned near them
    await expect(canvas.getByText('Min')).toBeInTheDocument();
    await expect(canvas.getByText('Max')).toBeInTheDocument();
    // Both edge markers render without crashing or being suppressed
    await expect(getMarkers(canvasElement)).toHaveLength(2);
  },
};

// ─── Inside labels + progress mode ────────────────────────────────────────────

export const InsideLabelsWithProgress: Story = {
  name: 'Labels — inside + progress mode',
  args: {
    ...defaultProps,
    showLabels: true,
    markers: threeMarkers,
    startLabel,
    endLabel,
    progressMarkerId: 'mid',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Labels remain visible in the two-layer progress rendering
    await expect(canvas.getByText('Min')).toBeInTheDocument();
    await expect(canvas.getByText('Max')).toBeInTheDocument();
    // All three markers render in progress mode
    await expect(getMarkers(canvasElement)).toHaveLength(3);
  },
};

// ─── Custom start, auto end ───────────────────────────────────────────────────
// When showLabels is true and only startLabel is provided, the end label
// auto-generates from max (String(max) = "100" for the default scale).

export const InsideStartLabelOnly: Story = {
  name: 'Labels — inside, custom start + auto end',
  args: {
    ...defaultProps,
    showLabels: true,
    startLabel,
    endLabel: null,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Custom start label renders
    await expect(canvas.getByText('Min')).toBeInTheDocument();
    // End label auto-generates from max (defaultProps.max = 100), but null is given to endLabel
    await expect(canvas.queryByText('100')).not.toBeInTheDocument();
    // The custom endLabel value 'Max' was never provided — it must not appear
    await expect(canvas.queryByText('Max')).not.toBeInTheDocument();
  },
};

// ─── Auto start, custom end ───────────────────────────────────────────────────
// When showLabels is true and only endLabel is provided, the start label
// auto-generates from min (String(min) = "0" for the default scale).

export const InsideEndLabelOnly: Story = {
  name: 'Labels — inside, auto start + custom end',
  args: {
    ...defaultProps,
    showLabels: true,
    endLabel,
    startLabel: null,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Custom end label renders
    await expect(canvas.getByText('Max')).toBeInTheDocument();
    // Start label auto-generates from min (defaultProps.min = 0) but null is given to startLabel
    await expect(canvas.queryByText('0')).not.toBeInTheDocument();
    // The custom startLabel value 'Min' was never provided — it must not appear
    await expect(canvas.queryByText('Min')).not.toBeInTheDocument();
  },
};

// ─── Vertical inside labels ───────────────────────────────────────────────────

export const InsideLabelsVertical: Story = {
  name: 'Labels — inside, vertical orientation',
  args: {
    ...defaultProps,
    showLabels: true,
    markers: twoMarkers,
    startLabel,
    endLabel,
    orientation: 'vertical',
  },
  decorators: [
    (StoryFn) => (
      <div style={{ height: 300, display: 'flex', justifyContent: 'center' }}>
        <StoryFn />
      </div>
    ),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Both labels render inside the vertical track bar
    await expect(canvas.getByText('Min')).toBeInTheDocument();
    await expect(canvas.getByText('Max')).toBeInTheDocument();
    // Both markers are positioned vertically on the track
    await expect(getMarkers(canvasElement, 'vertical')).toHaveLength(2);
  },
};
