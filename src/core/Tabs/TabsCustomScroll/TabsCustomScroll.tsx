import { classNames } from '@helpers/classNames';
import { Icon, IconSize } from '@vanguard/Icon/Icon';
import { IconNames } from '@vanguard/Icon/IconNames';
import React from 'react';

import styles from './TabsCustomScroll.module.scss';

export interface TabsCustomScrollProps {
  direction: string;
  onClick: () => void;
  disabled: boolean;
  testId?: string;
  /** Extra class name merged into the wrapper element. */
  className?: string;
}

export const TabsCustomScroll = (props: TabsCustomScrollProps) => {
  const { direction, onClick, disabled, testId, className } = props;

  return (
    <div
      onClick={!disabled ? onClick : undefined}
      className={classNames(
        styles.customScrollButtonWrapper,
        direction === 'right' ? styles.right : styles.left,
        disabled && styles.hidden,
        className,
      )}
      aria-hidden="true"
      data-testid={testId}
    >
      <Icon color={'var(--n400)'} type={IconSize.small}>
        {IconNames.caretLeft}
      </Icon>
    </div>
  );
};
