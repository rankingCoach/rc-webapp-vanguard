import classNames from 'classnames';
import React from 'react';

import styles from './AiGlow.module.scss';

export interface AiGlowProps {
  className?: string;
  children: React.ReactNode;
  borderRadius?: number;
  /** The glow's only colour; the other stops are derived from it. Defaults to the inherited `--ai-base-color`. */
  baseColor?: string;
  borderWidth?: number;
  blurWidth?: number;
}

export const AiGlow = (props: AiGlowProps) => {
  const { className, children, borderRadius = 24, baseColor, borderWidth, blurWidth } = props;

  // Create style object with only defined props
  const style = {
    '--ai-border-radius': `${borderRadius}px`,
    ...(borderWidth && { '--ai-border-size-outside': `${borderWidth}px` }),
    ...(baseColor && { '--ai-base-color': baseColor }),
    ...(blurWidth && { '--ai-blur-width': `${blurWidth}px` }),
  } as React.CSSProperties;

  return (
    <div className={classNames(styles.grad, className)} style={style}>
      {children}
    </div>
  );
};
