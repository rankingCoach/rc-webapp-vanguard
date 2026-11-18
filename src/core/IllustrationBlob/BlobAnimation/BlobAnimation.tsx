import React from 'react';

import styles from './BlobAnimation.module.scss';

export interface BlobAnimationProps {
  size?: 'small' | 'medium' | 'large';
  baseColor?: string;
}

export const BlobAnimation = (props: BlobAnimationProps) => {
  const { size = 'small', baseColor } = props;
  let width, height;

  switch (size) {
    case 'small':
      width = '100px';
      height = '100px';
      break;
    case 'medium':
      width = '300px';
      height = '300px';
      break;
    case 'large':
      width = '500px';
      height = '500px';
      break;
    default:
  }

  return (
    <div
      data-slot="blob-animation"
      className={styles.container}
      style={{ width: width, height: height, ...(baseColor && ({ '--baseC': baseColor } as React.CSSProperties)) }}
    >
      <div className={styles.innerOrb}>
        <div className={styles.innerOrb} />
        <div className={styles.innerOrb} />
      </div>
    </div>
  );
};
