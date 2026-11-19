import React from 'react';

import { OwnProgressBar } from './own-progress-bar';
import { ProgressBarMui } from './ProgressBarMui';

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

/** determinate (default) and indeterminate render on the own core; buffer and query keep the MUI LinearProgress path. */
export const ProgressBar = (props: ProgressBarProps) => {
  const { variant = 'determinate' } = props;
  if (variant === 'determinate' || variant === 'indeterminate') return <OwnProgressBar {...props} variant={variant} />;
  return <ProgressBarMui {...props} />;
};
