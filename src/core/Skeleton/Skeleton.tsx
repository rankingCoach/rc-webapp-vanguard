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
  /** @deprecated Skeleton now auto-adapts to light/dark via theme tokens. Prop ignored. */
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
    noAnimation,
    borderRadius = 4,
  } = props;

  /**
   * Spring animation
   */
  const shimmer =
    'linear-gradient(45deg, var(--fn-skeleton-base) 45%, var(--fn-skeleton-shimmer) 55%, var(--fn-skeleton-base) 65%)';

  const bgStyle = useSpring({
    loop: true,
    from: {
      transform: 'translate(-100%,0)',
      background: shimmer,
    },
    to: {
      transform: 'translate(30%,0)',
      background: shimmer,
    },
    config: {
      duration: 1500,
    },
  });

  /**
   * Without animation
   */
  const bgStyleNoAnimation = {
    background: 'var(--fn-skeleton-base)',
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
        backgroundColor: 'var(--fn-skeleton-base)',
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
