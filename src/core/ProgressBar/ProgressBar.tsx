import React from 'react';
import { lazyFallback } from '../_internal/lazy-fallback';
import { OwnProgressBar } from './own-progress-bar';

export interface ProgressBarProps {
  progressValue?: number;
  height?: string;
  className?: string;
  width?: string;
  color?: string;
  bgColor?: string;
  isBlurred?: boolean;
  variant?: 'determinate' | 'indeterminate' | 'buffer' | 'query';
}

/** MUI LinearProgress route (buffer / query) behind a lazy boundary (plan §36.2 B.3): no @mui/* in the eager graph. */
const ProgressBarMui = lazyFallback(
  () => import('./ProgressBarMuiFallback') as never,
) as React.ComponentType<ProgressBarProps>;

/** determinate (default) and indeterminate render on the own core; buffer and query keep the MUI LinearProgress path. */
export const ProgressBar = (props: ProgressBarProps) => {
  const { variant = 'determinate' } = props;
  if (variant === 'determinate' || variant === 'indeterminate') return <OwnProgressBar {...props} variant={variant} />;
  return <ProgressBarMui {...props} />;
};
