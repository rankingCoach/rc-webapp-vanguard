import { StoryObj } from '@storybook/react';
import { Icon, IconNames } from '@vanguard/Icon';
import React from 'react';

import { BenchmarkGauge } from '../BenchmarkGauge';
import { BenchmarkGaugeMarkerType, MarkerRenderContext } from '../types';

export type Story = StoryObj<typeof BenchmarkGauge>;

// ─── Test values ──────────────────────────────────────────────────────────────
export const testValues = {
  min: 0,
  max: 100,
  low: 20,
  mid: 50,
  high: 80,
  edgeMin: 0,
  edgeMax: 100,
  nearEdge: 88,
} as const;

// ─── Test markers ─────────────────────────────────────────────────────────────
export const twoMarkers: BenchmarkGaugeMarkerType[] = [
  { id: 'alpha', value: 30, label: 'Alpha' },
  { id: 'beta', value: 70, label: 'Beta' },
];

export const threeMarkers: BenchmarkGaugeMarkerType[] = [
  { id: 'low', value: 20, label: 'Low' },
  { id: 'mid', value: 50, label: 'Mid' },
  { id: 'high', value: 80, label: 'High' },
];

export const progressMarkers: BenchmarkGaugeMarkerType[] = [
  { id: 'low', value: 20, label: 'Low' },
  { id: 'mid', value: 50, label: 'Mid' },
  { id: 'high', value: 80, label: 'High' },
];

// ─── Default props ────────────────────────────────────────────────────────────
export const defaultProps = {
  min: testValues.min,
  max: testValues.max,
  markers: twoMarkers,
  'aria-label': 'Benchmark gauge',
} as const;

// ─── Test helpers ─────────────────────────────────────────────────────────────
/**
 * Returns all BenchmarkGaugeMarker elements from the canvas for play-function
 * assertions. Horizontal markers carry an inline `left` style; vertical markers
 * carry `bottom`. Only BenchmarkGaugeMarker sets these positional inline styles,
 * making this a stable selector that does not depend on hashed CSS-module class names.
 */
export function getMarkers(
  canvasElement: HTMLElement,
  orientation: 'horizontal' | 'vertical' = 'horizontal',
): Element[] {
  return Array.from(canvasElement.querySelectorAll('[style]')).filter((el) => {
    const htmlEl = el as HTMLElement;
    return orientation === 'vertical' ? htmlEl.style.bottom !== '' : htmlEl.style.left !== '';
  });
}

// ─── Shared labels (InsideLabels stories) ─────────────────────────────────────
export const insideStartLabel = <span style={{ fontSize: 12, fontWeight: 600, color: '#fff' }}>Min</span>;
export const insideEndLabel = <span style={{ fontSize: 12, fontWeight: 600, color: '#fff' }}>Max</span>;

// ─── Shared component: PlainLegendContent (Legend stories) ───────────────────
export function PlainLegendContent({ label, value }: { label: string; value: number }) {
  return (
    <div
      style={{
        padding: '6px 12px',
        fontSize: 12,
        height: '100%',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}
    >
      <div style={{ fontWeight: 700 }}>{label}</div>
      <div style={{ marginTop: 2, opacity: 0.6 }}>{value}</div>
    </div>
  );
}

// ─── Shared component: StubCard (WithContent stories) ─────────────────────────
export function StubCard({ ctx }: { ctx: MarkerRenderContext }) {
  return (
    <div
      data-testid={`card-${ctx.marker.id}`}
      style={{
        padding: '8px 12px',
        background: 'var(--n100, #f5f5f5)',
        borderRadius: 8,
        border: '1px solid var(--n300, #e0e0e0)',
        fontSize: 12,
        minWidth: 80,
        textAlign: 'center',
      }}
    >
      <strong>{ctx.marker.label}</strong>
      <br />
      {ctx.marker.value}
    </div>
  );
}

// ─── Shared component: TextPin (Progress stories) ─────────────────────────────
export function TextPin({ label }: { label: string }) {
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

// ─── Shared util: pinColor (RankBasedMarkers + ProductSimulations stories) ────
export function pinColor(rankIndex: number, rankCount: number): string {
  if (rankIndex === 0) return 'var(--e500)';
  if (rankIndex === rankCount - 1) return 'var(--s400)';
  return 'var(--a2900)';
}

// ─── Shared render: RankedPin (RankBasedMarkers stories) ─────────────────────
export const RankedPin: Story['args']['markers'][number]['renderPin'] = ({ rankIndex, rankCount, isHighlighted }) => {
  const scale = isHighlighted ? 2 : 1;

  return (
    <span
      aria-hidden="true"
      style={{
        display: 'flex',
        width: 16,
        height: 16,
        borderRadius: '50%',
        background: pinColor(rankIndex, rankCount),
        border: isHighlighted ? '2px solid #fff' : '3px solid #fff',
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
        <Icon color="white" forceSize={10}>
          {IconNames.gmb}
        </Icon>
      </span>
    </span>
  );
};
