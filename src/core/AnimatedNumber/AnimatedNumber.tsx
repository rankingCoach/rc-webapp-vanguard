import React from 'react';

import { useAnimatedValue } from './use-animated-value';

export interface AnimatedNumberProps {
  /** Target value to count up to. */
  value: number;
  /** Decimal places to display. */
  decimals?: number;
  /** Tween duration in ms. */
  durationMs?: number;
  /** Format the final value (applied once the tween reaches the target). */
  formatter?: (value: number) => string;
  /** Set false to freeze at 0 (e.g. while the parent is loading). */
  animate?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * A number that counts up from 0 to `value` on mount / on value change.
 * The optional `formatter` only runs on the final value, so the tween stays
 * numeric (e.g. `42%` appears only once 42 is reached).
 */
export const AnimatedNumber = (props: AnimatedNumberProps) => {
  const { value, decimals = 0, durationMs = 600, formatter, animate = true, className, style } = props;
  const animated = useAnimatedValue(value, animate, { duration: durationMs, decimals });
  const atTarget = animated === value;
  const display =
    formatter && atTarget ? formatter(value) : decimals ? animated.toFixed(decimals) : String(Math.round(animated));

  return (
    <span className={className} style={style}>
      {display}
    </span>
  );
};
