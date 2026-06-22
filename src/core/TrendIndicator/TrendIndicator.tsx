import { Icon, IconNames } from '@vanguard/Icon';
import React from 'react';

import styles from './TrendIndicator.module.scss';
import { formatMagnitude, getTrend } from './trend';

/** Semantic outcome of a trend after applying `higherIsBetter`. */
type TrendOutcome = { stable: true } | { stable: false; improved: boolean };

const COLOR_BY_OUTCOME = {
  improved: '--s400',
  worsened: '--e400',
  stable: '--n400',
} as const;

const resolveOutcome = (current: number, previous: number | undefined, higherIsBetter: boolean): TrendOutcome => {
  const raw = getTrend(current, previous);
  if (raw === 'stable') return { stable: true };
  const improved = higherIsBetter ? raw === 'up' : raw === 'down';
  return { stable: false, improved };
};

const outcomeColor = (outcome: TrendOutcome): string =>
  outcome.stable ? COLOR_BY_OUTCOME.stable : outcome.improved ? COLOR_BY_OUTCOME.improved : COLOR_BY_OUTCOME.worsened;

const outcomeIcon = (outcome: TrendOutcome): IconNames =>
  outcome.stable ? IconNames.dash : outcome.improved ? IconNames.arrowUp : IconNames.arrowDown;

export interface TrendIndicatorProps {
  current: number;
  previous?: number;
  /** False for inverse metrics where a lower number is better (rank, CPC, unanswered). */
  higherIsBetter?: boolean;
  /** Icon size in px. */
  size?: number;
  className?: string;
}

/**
 * Arrow-only trend glyph. Up/down encode goodness (via `higherIsBetter`), not raw
 * direction: a falling rank renders as a green up-arrow. Stable → neutral dash.
 */
export const TrendIndicator = (props: TrendIndicatorProps) => {
  const { current, previous, higherIsBetter = true, size = 14, className } = props;
  const outcome = resolveOutcome(current, previous, higherIsBetter);

  return (
    <Icon
      forceSize={size}
      color={outcomeColor(outcome)}
      className={[styles.indicator, className].filter(Boolean).join(' ')}
    >
      {outcomeIcon(outcome)}
    </Icon>
  );
};

export interface TrendDeltaProps extends TrendIndicatorProps {
  /** Hide the magnitude text (arrow only). */
  showValue?: boolean;
  /** Override the magnitude formatter. */
  format?: (magnitude: number) => string;
}

/**
 * Trend arrow plus the magnitude of change. Stable renders just the neutral dash
 * (no number). Color tracks goodness, consistent with `TrendIndicator`.
 */
export const TrendDelta = (props: TrendDeltaProps) => {
  const { current, previous, higherIsBetter = true, size = 12, showValue = true, format, className } = props;
  const outcome = resolveOutcome(current, previous, higherIsBetter);
  const color = outcomeColor(outcome);

  if (outcome.stable) {
    return (
      <Icon forceSize={size} color={color} className={[styles.indicator, className].filter(Boolean).join(' ')}>
        {IconNames.dash}
      </Icon>
    );
  }

  const magnitude = Math.abs(current - (previous ?? 0));
  const text = format ? format(magnitude) : formatMagnitude(magnitude);

  return (
    <span className={[styles.delta, className].filter(Boolean).join(' ')} style={{ color }}>
      <Icon forceSize={size} color={color}>
        {outcomeIcon(outcome)}
      </Icon>
      {showValue ? <span className={styles.deltaValue}>{text}</span> : null}
    </span>
  );
};
