import { alignItemsCenter, dFlex, ml0_5, mr0_5 } from '@globalStyles';
import { classNames } from '@helpers/classNames';
import { Icon } from '@vanguard/Icon/Icon';
import { IconNames } from '@vanguard/Icon/IconNames';
import React, { SyntheticEvent } from 'react';

import styles from './CtaWithIcon.module.scss';

const IconCmpRender = (rotateIcon: CtaWithIconProps['rotateIcon'], iconColor: CtaWithIconProps['iconColor'], disabled: CtaWithIconProps['disabled'], props: { iconType?: IconNames; className?: string }) => {
    const { iconType, className } = props;
    if (!iconType) return null;

    return (
      <Icon
        className={classNames(className, styles.icon, rotateIcon ? styles.rotateIcon : undefined)}
        color={iconColor ?? (!disabled ? 'var(--brand-color)' : 'var(--n300)')}
      >
        {iconType}
      </Icon>
    );
  };


export interface CtaWithIconProps {
  className?: string;
  disabled?: boolean;
  position?: 'left' | 'right';
  icon?: IconNames | React.ReactNode;
  iconColor?: string;
  rotateIcon?: boolean;
  children?: React.ReactElement | string;
  onClick?: (arg: SyntheticEvent) => void;
}

export const CtaWithIcon = (props: CtaWithIconProps) => {
  const { position, icon, iconColor, rotateIcon = false, className, disabled = false, children, onClick } = props;

  const onClickHandler = (evt: SyntheticEvent) => {
    if (disabled) return;

    onClick && onClick(evt);
  };

  const IconCmp = IconCmpRender.bind(null, rotateIcon, iconColor, disabled);

  const leftArrow = typeof icon === 'object' ? icon : <IconCmp className={mr0_5} iconType={icon as IconNames} />;
  const rightArrow = typeof icon === 'object' ? icon : <IconCmp className={ml0_5} iconType={icon as IconNames} />;

  return (
    <div
      onClick={onClickHandler}
      className={classNames(dFlex, alignItemsCenter, className, styles.container, disabled ? styles.disabled : '')}
    >
      {position == 'left' ? leftArrow : null}
      {children}
      {position == 'right' ? rightArrow : null}
    </div>
  );
};
