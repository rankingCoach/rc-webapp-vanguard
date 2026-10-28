import { classNames } from '@helpers/classNames';
import { ComponentContainer, ComponentContainerProps } from '@vanguard/ComponentContainer/ComponentContainer';
import React from 'react';

import styles from './GlobalStateComponent.module.scss';

export interface GlobalStateComponentProps extends ComponentContainerProps {
  /** Highlights the content while the pointer is over it. */
  hoverable?: boolean;
  /** Blurs the content and blocks pointer interaction with it. */
  blurred?: boolean;
  /** Sweeps a shimmer band over the content, e.g. while it is loading. */
  shimmering?: boolean;
}

/**
 * Wraps content and draws visual states (hover, blur, shimmer) over it.
 * It renders the root element itself, so passing the wrapped component's root
 * className keeps the layout unchanged; the state layers inherit its border radius.
 */
export const GlobalStateComponent = (props: GlobalStateComponentProps) => {
  const { hoverable, blurred, shimmering, className, children, ...containerProps } = props;

  return (
    <ComponentContainer
      {...containerProps}
      className={classNames(styles.globalStateComponent, hoverable ? styles.hoverable : undefined, className)}
    >
      {children}
      {blurred && <span className={styles.blurLayer} />}
      {shimmering && <span className={styles.shimmerLayer} />}
    </ComponentContainer>
  );
};
