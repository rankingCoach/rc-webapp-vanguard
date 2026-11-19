// Ported from @mui/material@9.5.0 LinearProgress/LinearProgress.js (MIT)
// Own-core MUI markup: internal `cx` (clsx semantics, as MUI emits), not the public classNames helper (track h).

import styles from './ProgressBar.module.scss';
import { parseCssVariable } from '@helpers/css-variables-parser';
import { ComponentContainer } from '@vanguard/ComponentContainer/ComponentContainer';
import React, { CSSProperties } from 'react';
import { cx } from '../../primitives/react/class-names';
import type { ProgressBarProps } from './ProgressBar';

/**
 * ProgressBar's determinate / indeterminate paths on own markup: MUI 9.5 LinearProgress DOM (root span + bar spans,
 * the same Mui* classes, role and aria values, the bar1 transform) with MUI's emotion rules as static rules in
 * _ProgressBar.compat.scss (D15 last block); Vanguard's `sx` values (filter, background, height, width, bar colour)
 * are inline styles.
 * LTR only (Vanguard renders no MUI RtlProvider). buffer / query stay on the MUI path (ProgressBarMui).
 */
export const OwnProgressBar = (props: ProgressBarProps & { variant: 'determinate' | 'indeterminate' }) => {
  const { progressValue, width = '100%', className, variant, isBlurred } = props;
  let { bgColor, color, height = '12px' } = props;
  color = parseCssVariable(color);
  bgColor = parseCssVariable(bgColor);
  height = !isBlurred ? height : '5px';
  const value = !isBlurred ? progressValue : 100;
  const determinate = variant === 'determinate';
  const hasValue = determinate && value !== undefined;
  // MUI: aria-valuenow/min/max from `value` (determinate), then Vanguard's explicit rounded aria-valuenow wins.
  const aria: Record<string, number | undefined> = {};
  if (hasValue) {
    aria['aria-valuenow'] = value;
    aria['aria-valuemin'] = 0;
    aria['aria-valuemax'] = 100;
  }
  aria['aria-valuenow'] =
    determinate && progressValue !== undefined ? Math.round(isBlurred ? 100 : progressValue) : undefined;
  // Vanguard's sx values. Inline (not custom properties): the MUI-contract spec reads them through jsdom's
  // getComputedStyle, which does not resolve var(). Delta: inline outranks consumer class rules for these four
  // properties; no rc-webapp or Vanguard consumer sets them through className (checked).
  const rootStyle: CSSProperties = {
    ...(isBlurred ? { filter: 'blur(15px)' } : {}),
    backgroundColor: bgColor ? bgColor : 'var(--n200)',
    height,
    width,
  };
  const barColor = !isBlurred ? (color ? color : 'var(--i500)') : 'var(--n500)';
  return (
    <ComponentContainer className={styles.progressBar}>
      <span
        data-vg-core=""
        data-slot={'progress-bar'}
        data-variant={variant}
        className={cx(
          'MuiLinearProgress-root',
          'MuiLinearProgress-colorPrimary',
          `MuiLinearProgress-${variant}`,
          styles.root,
          className,
        )}
        role="progressbar"
        {...aria}
        style={rootStyle}
      >
        <span
          data-vg-core=""
          data-slot={'progress-bar-indicator'}
          className="MuiLinearProgress-bar MuiLinearProgress-bar1"
          style={{
            ...(hasValue ? { transform: `translateX(${(value as number) - 100}%)` } : {}),
            backgroundColor: barColor,
          }}
        />
        {determinate ? null : (
          <span
            data-vg-core=""
            className="MuiLinearProgress-bar MuiLinearProgress-bar2"
            style={{ backgroundColor: barColor }}
          />
        )}
      </span>
    </ComponentContainer>
  );
};
