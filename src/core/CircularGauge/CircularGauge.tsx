import { classNames } from '@helpers/classNames';
import { parseCssVariable } from '@helpers/css-variables-parser';
import { ComponentContainer } from '@vanguard/ComponentContainer/ComponentContainer';
import React from 'react';

import styles from './CircularGauge.module.scss';

export interface CircularGaugeProps {
  /** Current value. Combined with `max` to fill the ring. */
  value: number;
  /** Value that represents a full ring. Defaults to 100. */
  max?: number;
  /** Outer diameter in px. */
  size?: number;
  /** Ring thickness in px. */
  strokeWidth?: number;
  /** Filled-arc color — CSS variable (`--s400`) or hex. */
  color?: string;
  /** Unfilled-track color — CSS variable or hex. */
  trackColor?: string;
  /** Render a neutral, partially-filled placeholder ring. */
  loading?: boolean;
  className?: string;
  /** Centered content (number, label, icon). */
  children?: React.ReactNode;
}

/**
 * Full-circle progress ring with a centered content slot. Unlike `ArcGauge`
 * (a fixed 180° reputation semicircle), this accepts an arbitrary `value`/`max`,
 * any `size`/`strokeWidth`/`color`, and arbitrary center children.
 */
export const CircularGauge = (props: CircularGaugeProps) => {
  const {
    value,
    max = 100,
    size = 108,
    strokeWidth = 9,
    color = '--s400',
    trackColor = '--n200',
    loading = false,
    className,
    children,
  } = props;

  const center = size / 2;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const ratio = loading ? 0.58 : max > 0 ? Math.max(0, Math.min(1, value / max)) : 0;
  const strokeDashoffset = circumference * (1 - ratio);
  const strokeColor = parseCssVariable(loading ? '--n300' : color);
  const trackStroke = parseCssVariable(trackColor);

  return (
    <ComponentContainer className={classNames(styles.container, className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className={styles.svg}>
        <circle cx={center} cy={center} r={radius} fill={'none'} stroke={trackStroke} strokeWidth={strokeWidth} />
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill={'none'}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinecap={'round'}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          transform={`rotate(-90 ${center} ${center})`}
          className={loading ? undefined : styles.valueArc}
        />
      </svg>
      {children ? <div className={styles.center}>{children}</div> : null}
    </ComponentContainer>
  );
};
