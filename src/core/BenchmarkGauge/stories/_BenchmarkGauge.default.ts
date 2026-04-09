import { StoryObj } from '@storybook/react';

import { BenchmarkGauge } from '../BenchmarkGauge';
import { BenchmarkGaugeMarkerType } from '../types';

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
