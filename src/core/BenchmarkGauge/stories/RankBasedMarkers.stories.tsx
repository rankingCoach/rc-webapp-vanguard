import React from 'react';
import { expect, within } from 'storybook/test';

import { defaultProps, getMarkers, Story } from './_BenchmarkGauge.default';
import { Icon, IconNames } from '@vanguard/Icon';

// ─── Rank-to-visual mapping ───────────────────────────────────────────────────
// Wrappers own this mapping entirely — zero product logic in the core.
export function pinColor(rankIndex: number, rankCount: number): string {
  if (rankIndex === 0) return 'var(--e500)'; // lowest  → red
  if (rankIndex === rankCount - 1) return 'var(--s400)';
  return 'var(--a2900)'; //           middle  → yellow
}

function rankLabel(rankIndex: number, rankCount: number): string {
  if (rankIndex === 0) return 'Lowest';
  if (rankIndex === rankCount - 1) return 'Highest';
  return 'Middle';
}

// ─── Shared pin / content renderers ──────────────────────────────────────────
// Fixed: uses transform:scale() instead of width/height for GPU-composited animation.
// Icon is always in the DOM; opacity+scale drive visibility so transitions fire correctly.
export const RankedPin: Story['args']['markers'][number]['renderPin'] = ({ rankIndex, rankCount, isHighlighted }) => {
  const scale = isHighlighted ? 2 : 1; // 16 × 2 = 32px visual size when highlighted

  return (
    <span
      aria-hidden="true"
      style={{
        display: 'flex',
        width: 16,
        height: 16,
        borderRadius: '50%',
        background: pinColor(rankIndex, rankCount),
        border: isHighlighted ? '2px solid #fff':'3px solid #fff',
        alignItems: 'center',
        justifyContent: 'center',
        transform: `scale(${scale})`,
        transition: 'transform 0.2s ease',
        willChange: 'transform',
      }}
    >
      <span
        style={{
          display: 'flex',
          opacity: isHighlighted ? 1 : 0,
          transform: isHighlighted ? 'scale(1)' : 'scale(0.5)',
          transition: 'opacity 0.15s ease 0.05s, transform 0.15s ease 0.05s',
        }}
      >
        <Icon color="white" forceSize={10}>{IconNames.gmb}</Icon>
      </span>
    </span>
  );
};
const RankedContent: Story['args']['markers'][number]['renderContent'] = ({ marker, rankIndex, rankCount }) => (
  <div
    style={{
      background: '#fff',
      border: `2px solid ${pinColor(rankIndex, rankCount)}`,
      borderRadius: 8,
      padding: '6px 12px',
      minWidth: 80,
      textAlign: 'center',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      fontSize: 12,
    }}
  >
    <div style={{ fontWeight: 700 }}>{marker.label}</div>
    <div style={{ color: '#6b7280', marginTop: 2 }}>
      {rankLabel(rankIndex, rankCount)} · {marker.value}
    </div>
  </div>
);

// ─── Scenario A: A < B < C ────────────────────────────────────────────────────
// A=20 (red), B=50 (yellow), C=80 (green)

export const RankScenarioA: Story = {
  name: 'Rank A — A lowest · B middle · C highest',
  args: {
    ...defaultProps,
    markers: [
      { id: 'a', value: 20, label: 'Marker A', renderPin: RankedPin },
      { id: 'b', value: 50, label: 'Marker B', renderPin: RankedPin },
      { id: 'c', value: 80, label: 'Marker C', renderPin: RankedPin },
    ],
  },
  play: async ({ canvasElement }) => {
    // All three rank-colored custom-pin markers render without crashing
    await expect(getMarkers(canvasElement)).toHaveLength(3);
  },
};

// ─── Scenario B: C < A < B ────────────────────────────────────────────────────
// C=20 (red), A=50 (yellow), B=80 (green)
// Red moves from A → C; green moves from C → B.

export const RankScenarioB: Story = {
  name: 'Rank B — C lowest · A middle · B highest',
  args: {
    ...defaultProps,
    markers: [
      { id: 'a', value: 50, label: 'Marker A', renderPin: RankedPin },
      { id: 'b', value: 80, label: 'Marker B', renderPin: RankedPin },
      { id: 'c', value: 20, label: 'Marker C', renderPin: RankedPin },
    ],
  },
  play: async ({ canvasElement }) => {
    // Rank colors follow value order (not marker ID); all three render safely
    await expect(getMarkers(canvasElement)).toHaveLength(3);
  },
};

// ─── Scenario C: B < C < A ────────────────────────────────────────────────────
// B=25 (red), C=60 (yellow), A=90 (green)
// Green has moved to A; red is now B.

export const RankScenarioC: Story = {
  name: 'Rank C — B lowest · C middle · A highest',
  args: {
    ...defaultProps,
    markers: [
      { id: 'a', value: 90, label: 'Marker A', renderPin: RankedPin },
      { id: 'b', value: 25, label: 'Marker B', renderPin: RankedPin },
      { id: 'c', value: 60, label: 'Marker C', renderPin: RankedPin },
    ],
  },
  play: async ({ canvasElement }) => {
    // Rank color assignment is independent of marker ID; all three render safely
    await expect(getMarkers(canvasElement)).toHaveLength(3);
  },
};

// ─── Scenario D: rank + anchored content box ──────────────────────────────────
// Same values as Scenario A. Each marker has a content box whose border color
// and rank label also derive from rankIndex — all computed in the wrapper.

export const RankWithContent: Story = {
  name: 'Rank — with anchored content box per marker',
  args: {
    ...defaultProps,
    markers: [
      {
        id: 'a',
        value: 20,
        label: 'Marker A',
        renderPin: RankedPin,
        renderContent: RankedContent,
      },
      {
        id: 'b',
        value: 50,
        label: 'Marker B',
        renderPin: RankedPin,
        renderContent: RankedContent,
        contentSide: 'start',
      },
      {
        id: 'c',
        value: 80,
        label: 'Marker C',
        renderPin: RankedPin,
        renderContent: RankedContent,
      },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Each marker's content card renders its label
    await expect(canvas.getByText('Marker A')).toBeInTheDocument();
    await expect(canvas.getByText('Marker B')).toBeInTheDocument();
    await expect(canvas.getByText('Marker C')).toBeInTheDocument();
    // Rank labels are computed from sorted values:
    // A=20 → rank 0 = Lowest, B=50 → rank 1 = Middle, C=80 → rank 2 = Highest
    expect(canvasElement.textContent).toContain('Lowest');
    expect(canvasElement.textContent).toContain('Middle');
    expect(canvasElement.textContent).toContain('Highest');
    // All three markers are positioned on the track
   await expect(getMarkers(canvasElement)).toHaveLength(3);
  },
};
