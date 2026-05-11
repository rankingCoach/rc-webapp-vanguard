import { classNames } from '@helpers/classNames.ts';
import { ComponentContainer } from '@vanguard/ComponentContainer';
import React from 'react';

import styles from './Bullets.module.scss';

export type BulletsPlacement = 'overlayBottom' | 'below';

export interface BulletsProps {
  children: React.ReactElement;
  placement?: BulletsPlacement;
}

export type BulletsComponentType = (props: BulletsProps) => React.ReactElement;

export const Bullets = (props: BulletsProps) => {
  const { children, placement = 'overlayBottom' } = props;

  return (
    <ComponentContainer
      className={classNames(styles.BulletsContainer, placement === 'below' ? styles.BulletsContainerBelow : undefined)}
    >
      {children}
    </ComponentContainer>
  );
};
