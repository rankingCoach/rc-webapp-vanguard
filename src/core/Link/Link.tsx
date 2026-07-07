import { classNames } from '@helpers/classNames';
import { Icon } from '@vanguard/Icon/Icon';
import { IconNames } from '@vanguard/Icon/IconNames';
import { Text, TextProps } from '@vanguard/Text/Text';
import React from 'react';

import styles from './Link.module.scss';

export type LinkProps = {
  href?: string;
  onClick?: () => void;
  iconLeft?: boolean;
  newTabIcon?: boolean; // @todo rename to iconRight
  iconName?: IconNames;
  target?: '_blank' | '_self';
} & TextProps;

export const Link = (props: LinkProps) => {
  const {
    href,
    newTabIcon,
    iconLeft,
    onClick,
    target = '_self',
    color = '--fn-fg-cta',
    iconName = IconNames.newTab,
    disabled,
    ...other
  } = props;

  const getColor = () => {
    if (disabled) {
      return '--n300';
    } else if (color) {
      return color;
    } else {
      return '--fn-fg-cta';
    }
  };

  return (
    <a
      href={href}
      target={target}
      className={classNames(styles.link, disabled ? styles.disabled : '')}
      rel="noreferrer"
      role={'link'}
      onClick={(e) => {
        onClick && !disabled && onClick();
      }}
    >
      {iconLeft && (
        <Icon color={getColor()} className={styles.icon}>
          {iconName}
        </Icon>
      )}

      <Text color={getColor()} {...other} />

      {newTabIcon && (
        <Icon color={getColor()} className={styles.icon}>
          {iconName}
        </Icon>
      )}
    </a>
  );
};
