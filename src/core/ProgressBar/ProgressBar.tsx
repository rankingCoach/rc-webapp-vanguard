import { classNames } from '@helpers/classNames';
import { parseCssVariable } from '@helpers/css-variables-parser';
import { LinearProgress } from '@mui/material';
import { ComponentContainer } from '@vanguard/ComponentContainer/ComponentContainer';
import React from 'react';

import styles from './ProgressBar.module.scss';

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

export const ProgressBar = (props: ProgressBarProps) => {
  const { progressValue, width = '100%', className, variant = 'determinate' } = props;
  let { bgColor, color, height = '12px' } = props;
  const { isBlurred } = props;

  color = parseCssVariable(color);
  bgColor = parseCssVariable(bgColor);
  height = !isBlurred ? height : '5px';
  return (
    <ComponentContainer className={styles.progressBar}>
      <LinearProgress
        variant={variant}
        value={!isBlurred ? progressValue : 100}
        aria-valuenow={
          (variant === 'determinate' || variant === 'buffer') && progressValue !== undefined
            ? Math.round(isBlurred ? 100 : progressValue)
            : undefined
        }
        className={classNames(styles.root, className)}
        sx={{
          filter: isBlurred ? 'blur(15px)' : '',
          backgroundColor: bgColor ? bgColor : 'var(--n200)',
          height: { height },
          width: { width },
          '& .MuiLinearProgress-bar': {
            backgroundColor: !isBlurred ? (color ? color : 'var(--i500)') : 'var(--n500)',
            // backgroundColor: color ? color : `var(--i500)`,
          },
        }}
      />
    </ComponentContainer>
  );
};
