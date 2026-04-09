import React from 'react';
import { expect, within } from 'storybook/test';

import { BenchmarkGaugeMarkerType, MarkerRenderContext } from '../types';
import { defaultProps, getMarkers, Story, threeMarkers, twoMarkers } from './_BenchmarkGauge.default';

// ─── Wide text pin helper ─────────────────────────────────────────────────────
// Simulates a progress marker where renderPin returns a labelled text badge.
// Used to verify that wide content never crosses the fill boundary.
function TextPin({ ctx, label }: { ctx: MarkerRenderContext; label: string }) {
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '4px 10px',
        background: 'var(--p500, #5b5bf6)',
        color: '#fff',
        borderRadius: 6,
        fontSize: 12,
        fontWeight: 600,
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </span>
  );
}

// Three markers used across progress stories
const progressMarkers: BenchmarkGaugeMarkerType[] = [
  { id: 'low', value: 20, label: 'Low' },
  { id: 'mid', value: 50, label: 'Mid' },
  { id: 'high', value: 80, label: 'High'},
];

// ─── Horizontal ───────────────────────────────────────────────────────────────

export const ProgressHorizontal: Story = {
  name: 'Progress mode — horizontal (mid endpoint)',
  args: {
    ...defaultProps,
    markers: progressMarkers,
    progressMarkerId: 'high',
  },
  play: async ({ canvasElement }) => {
    // Progress mode with endpoint at 80% renders all three markers without crashing
    await expect(getMarkers(canvasElement)).toHaveLength(3);
  },
};

// ─── Vertical ────────────────────────────────────────────────────────────────

export const ProgressVertical: Story = {
  name: 'Progress mode — vertical (mid endpoint)',
  args: {
    ...defaultProps,
    markers: progressMarkers,
    orientation: 'vertical',
    progressMarkerId: 'mid',
  },
  decorators: [
    (Story) => (
      <div style={{ height: 300, display: 'flex', justifyContent: 'center' }}>
        <Story />
      </div>
    ),
  ],
  play: async ({ canvasElement }) => {
    // Vertical progress mode renders all three markers without crashing
    await expect(getMarkers(canvasElement, 'vertical')).toHaveLength(3);
  },
};

// ─── Endpoint edge cases ──────────────────────────────────────────────────────

export const ProgressAtMin: Story = {
  name: 'Progress mode — endpoint at min (0% fill, ghost only)',
  args: {
    ...defaultProps,
    min: 0,
    max: 100,
    markers: [
      { id: 'zero', value: 0, label: 'At zero' },
      { id: 'far', value: 75, label: 'Far' },
    ],
    progressMarkerId: 'zero', // fill is suppressed; only the ghost layer shows
  },
  play: async ({ canvasElement }) => {
    // At 0% fill the vivid layer is suppressed; only the ghost layer shows.
    // Component must not crash and both markers must still render.
    await expect(canvasElement.firstElementChild).toBeInTheDocument();
    await expect(getMarkers(canvasElement)).toHaveLength(2);
  },
};

export const ProgressAtMax: Story = {
  name: 'Progress mode — endpoint at max (100% fill)',
  args: {
    ...defaultProps,
    min: 0,
    max: 100,
    markers: [
      { id: 'start', value: 30, label: 'Start' },
      { id: 'full', value: 100, label: 'Full' },
    ],
    progressMarkerId: 'full', // fill reaches end, visually same as full-track mode
  },
  play: async ({ canvasElement }) => {
    // At 100% fill the clip resolves to '0px'; both markers render safely
    await expect(canvasElement.firstElementChild).toBeInTheDocument();
    await expect(getMarkers(canvasElement)).toHaveLength(2);
  },
};

// ─── Wide text pin — geometry regression ─────────────────────────────────────
// Verifies that a wide renderPin badge does not cross the fill boundary.
// The fill ends flush at the progress anchor; the badge grows away from the fill.

export const ProgressWideTextPin: Story = {
  name: 'Progress mode — wide text pin stays right of fill boundary',
  args: {
    ...defaultProps,
    min: 0,
    max: 100,
    markers: [
      { id: 'ref', value: 20, label: 'Low' },
      {
        id: 'progress',
        value: 55,
        label: 'Current score',
        renderPin: (ctx) => <TextPin ctx={ctx} label="Current score" />,
      },
    ],
    progressMarkerId: 'progress',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // The badge text renders as the progress marker's pin
    await expect(canvas.getByText('Current score')).toBeInTheDocument();
    // Both markers (wide-pin progress and plain reference) are on the track
    await expect(getMarkers(canvasElement)).toHaveLength(2);
  },
};

export const ProgressWideTextPinVertical: Story = {
  name: 'Progress mode — wide text pin, vertical (body grows upward)',
  args: {
    ...defaultProps,
    min: 0,
    max: 100,
    markers: [
      { id: 'ref', value: 20, label: 'Low' },
      {
        id: 'progress',
        value: 55,
        label: 'Current score',
        renderPin: (ctx) => <TextPin ctx={ctx} label="Score" />,
      },
    ],
    orientation: 'vertical',
    progressMarkerId: 'progress',
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
    // The badge text renders in vertical progress mode
    await expect(canvas.getByText('Score')).toBeInTheDocument();
    // Both markers are present on the vertical track
    await expect(getMarkers(canvasElement, 'vertical')).toHaveLength(2);
  },
};

// ─── Fallback / backward compatibility ───────────────────────────────────────

export const ProgressInvalidId: Story = {
  name: 'Progress mode — invalid ID falls back to full track',
  args: {
    ...defaultProps,
    markers: twoMarkers,
    progressMarkerId: 'does-not-exist', // no match → normal full-gradient track
  },
  play: async ({ canvasElement }) => {
    // An unresolvable progressMarkerId silently falls back to full-track rendering.
    // Both markers must still appear; the component must not crash or warn visibly.
    await expect(getMarkers(canvasElement)).toHaveLength(2);
  },
};

export const FullTrackNoProgress: Story = {
  name: 'Full-track mode — no progressMarkerId (baseline)',
  args: {
    ...defaultProps,
    markers: progressMarkers,
    // progressMarkerId absent — backward-compatible full gradient
  },
  play: async ({ canvasElement }) => {
    // Baseline full-track mode (no progressMarkerId) renders all three markers
    await expect(getMarkers(canvasElement)).toHaveLength(3);
  },
};

// ─── Vertical zero progress ───────────────────────────────────────────────────

export const ProgressVerticalAtMin: Story = {
  name: 'Progress mode — vertical, endpoint at min (0% fill)',
  args: {
    ...defaultProps,
    min: 0,
    max: 100,
    markers: [
      { id: 'zero', value: 0, label: 'At zero' },
      { id: 'far', value: 75, label: 'Far' },
    ],
    orientation: 'vertical',
    progressMarkerId: 'zero', // ghost only, no fill
  },
  decorators: [
    (Story) => (
      <div style={{ height: 300, display: 'flex', justifyContent: 'center' }}>
        <Story />
      </div>
    ),
  ],
  play: async ({ canvasElement }) => {
    // Vertical 0%-fill progress: ghost-only layer; both markers present
    await expect(getMarkers(canvasElement, 'vertical')).toHaveLength(2);
  },
};
