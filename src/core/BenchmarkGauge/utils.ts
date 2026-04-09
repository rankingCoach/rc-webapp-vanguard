import React from 'react';

/** Maps a value to a percentage within [min, max], clamped to 0–100. Returns 0 when max ≤ min. */
export const valueToPercent = (value: number, min: number, max: number): number => {
  if (max <= min) return 0;
  return Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));
};

/**
 * Returns the CSS `left`/`bottom` position for a marker pin at the given percentage.
 * Offsets from track edges by `--benchmark-gauge-marker-inset` (default: 20px) so pins
 * never sit flush against the rounded track ends.
 */
export const markerPosition = (percent: number): string => {
  return `calc(var(--benchmark-gauge-marker-inset, 20px) + ${percent / 100} * (100% - 2 * var(--benchmark-gauge-marker-inset, 20px)))`;
};

/**
 * Returns the CSS `clip-path` inset (from the far end) that aligns the progress fill
 * with the marker pin's position, accounting for the same inset used by `markerPosition`.
 * At 100% returns `'0px'` so the fill covers the full track.
 * Callers suppress the fill layer entirely at 0% — this function is not called in that case.
 */
export const fillClipInset = (percent: number): string => {
  // At max: fill covers the entire track — zero clip from the far end.
  if (percent >= 100) return '0px';
  const p = percent / 100;
  return `calc(${1 - p} * (100% - 2 * var(--benchmark-gauge-marker-inset, 20px)))`;
};

/**
 * Formats a number in compact notation: 1000 → "1K", 1 500 000 → "1.5M".
 */
const compactNumber = (value: number): string => {
  return new Intl.NumberFormat('en', { notation: 'compact', maximumSignificantDigits: 3 }).format(value);
};

/**
 * Default semantic rank palette, ordered lowest → highest:
 * `var(--e500)` (red) → `var(--a2900)` (amber) → `var(--s400)` (green).
 * Pass `rankColors` to the component to override.
 */
export const DEFAULT_RANK_COLORS: readonly string[] = ['var(--e500)', 'var(--a2900)', 'var(--s400)'];

/**
 * Resolves the final pin background color for a marker.
 *
 * Precedence (highest to lowest):
 *   1. `markerColor` — explicit per-marker color; always wins.
 *   2. Rank-based palette color — when `colorByRank` is true. Colors are distributed
 *      semantically: 2 markers on a 3-color palette map to the endpoints, not indices 0 and 1.
 *   3. `var(--n400)` — component default fallback.
 *
 * Edge cases: a single marker (rankCount = 1) safely maps to palette[0];
 * an empty `rankColors` array falls through to the default.
 */
export const resolveMarkerColor = ({
  markerColor,
  rankIndex,
  rankCount,
  colorByRank,
  rankColors,
}: {
  markerColor: string | undefined;
  rankIndex: number;
  rankCount: number;
  colorByRank?: boolean;
  rankColors?: string[];
}): string => {
  const DEFAULT_COLOR = 'var(--n400)';
  if (markerColor) return markerColor;

  if (colorByRank) {
    const palette = rankColors?.length ? rankColors : DEFAULT_RANK_COLORS;
    if (!palette.length) {
      return DEFAULT_COLOR;
    }
    const paletteIndex = Math.round((rankIndex / Math.max(rankCount - 1, 1)) * (palette.length - 1));
    return palette[Math.max(0, Math.min(paletteIndex, palette.length - 1))] ?? DEFAULT_COLOR;
  }

  return DEFAULT_COLOR;
};

/**
 * Resolves the start and end labels to render at each track edge.
 *
 * - `showLabels: false` (or not set) — both sides return `undefined`.
 * - `showLabels: true` — each side falls back to `String(min)` / `String(max)`.
 *   `compactLabels` switches auto-generated values to compact notation (1000 → "1K").
 * - A custom `startLabel` / `endLabel` renders as-is and overrides the fallback.
 * - Passing `null` for a side explicitly suppresses it even when `showLabels: true`.
 */
export const resolveLabels = ({
  showLabels,
  startLabel,
  endLabel,
  min,
  max,
  compactLabels = false,
}: {
  showLabels?: boolean;
  startLabel?: React.ReactNode;
  endLabel?: React.ReactNode;
  min: number;
  max: number;
  compactLabels?: boolean;
}): {
  startLabel: React.ReactNode | undefined;
  endLabel: React.ReactNode | undefined;
} => {
  if (showLabels === false) {
    return { startLabel: undefined, endLabel: undefined };
  }

  const format = compactLabels ? compactNumber : String;

  const resolveSide = (
    explicitLabel: React.ReactNode | undefined,
    fallbackValue: number,
  ): React.ReactNode | undefined => {
    if (explicitLabel === null) return undefined;
    if (explicitLabel !== undefined) return explicitLabel;
    return showLabels ? format(fallbackValue) : undefined;
  };

  return {
    startLabel: resolveSide(startLabel, min),
    endLabel: resolveSide(endLabel, max),
  };
};
