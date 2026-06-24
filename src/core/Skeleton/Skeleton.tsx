import { classNames } from '@helpers/classNames.ts';
import { ComponentContainer } from '@vanguard/ComponentContainer/ComponentContainer';
import React, { CSSProperties } from 'react';
import { animated, useSpring } from 'react-spring';

import styles from './Skeleton.module.scss';

export interface SkeletonProps {
  children?: React.ReactNode;
  type?: SkeletonTypes;
  width?: string | number;
  height?: string | number;
  className?: string;
  style?: CSSProperties | undefined;
  borderRadius?: string | number;
  testId?: string;
  color?: 'dark' | 'light';
  noAnimation?: boolean;
}

export enum SkeletonTypes {
  rectangle = 'rectangle',
  circle = 'circle',
  fill = 'fill',
}

export const Skeleton = (props: SkeletonProps) => {
  const {
    children,
    style,
    width,
    height,
    type,
    className,
    testId = 'Skeleton',
    color = 'light',
    noAnimation,
    borderRadius = 4,
  } = props;

  /**
   * Spring animation
   */
  const bgStyle = useSpring({
    loop: true,
    from: {
      transform: 'translate(-100%,0)',
      background:
        color === 'light'
          ? 'linear-gradient(45deg, var(--fn-bg-hov-n-gl) 45%, var(--fn-bg-var) 55%, var(--fn-bg-hov-n-gl) 65%)'
          : 'linear-gradient(45deg, var(--fn-bg-disabled) 45%, var(--fn-bg-hov-n-gl) 55%, var(--fn-bg-disabled) 65%)',
    },
    to: {
      transform: 'translate(30%,0)',
      background:
        color === 'light'
          ? 'linear-gradient(45deg, var(--fn-bg-hov-n-gl) 45%, var(--fn-bg-var) 55%, var(--fn-bg-hov-n-gl) 65%)'
          : 'linear-gradient(45deg, var(--fn-bg-disabled) 45%, var(--fn-bg-hov-n-gl) 55%, var(--fn-bg-disabled) 65%)',
    },
    config: {
      duration: 1500,
    },
  });

  /**
   * Without animation
   */
  const bgStyleNoAnimation = {
    background: color === 'light' ? 'var(--fn-bg-hov-n-gl)' : 'var(--fn-bg-disabled)',
  };

  /**
   * Return view
   * ---
   */
  return (
    <ComponentContainer
      testId={testId}
      className={classNames(styles.container, className ?? '')}
      style={{
        backgroundColor: color === 'light' ? 'var(--fn-bg-hov-n-gl)' : 'var(--fn-bg-disabled)',
        width: type === SkeletonTypes.fill ? '100%' : width,
        height: type === SkeletonTypes.fill ? '100%' : height,
        borderRadius: type === SkeletonTypes.circle ? '50%' : borderRadius,
        ...style,
      }}
    >
      <animated.div className={styles.animated} style={noAnimation ? bgStyleNoAnimation : bgStyle}>
        {children}
      </animated.div>
    </ComponentContainer>
  );
};
