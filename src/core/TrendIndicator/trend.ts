export type TrendDirection = 'up' | 'down' | 'stable';

/** Relative change below this fraction counts as stable (no movement). */
export const TREND_THRESHOLD = 0.001;

/**
 * Raw numeric direction of `current` vs `previous`, before any
 * "higher is better" interpretation. Equal (or within threshold) → stable.
 */
export const getTrend = (current: number, previous: number | undefined | null): TrendDirection => {
  if (previous === undefined || previous === null) return 'stable';
  const diff = current - previous;
  if (Math.abs(diff) <= Math.abs(previous) * TREND_THRESHOLD) return 'stable';
  return diff > 0 ? 'up' : 'down';
};

/** Compact magnitude formatter: 1.2K for thousands, 1 decimal for fractions. */
export const formatMagnitude = (magnitude: number): string => {
  if (magnitude >= 1000) return `${(magnitude / 1000).toFixed(1)}K`;
  if (Number.isInteger(magnitude)) return String(magnitude);
  return String(Math.round(magnitude * 10) / 10);
};
