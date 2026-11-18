import { InfoIcon, InfoIconProps } from '@common/InfoIcon/InfoIcon';
import { ComponentContainer } from '@vanguard/ComponentContainer/ComponentContainer';
import { IconSize } from '@vanguard/Icon/Icon';
import { FontWeights, Text } from '@vanguard/Text/Text';
import classNames from 'classnames';
import React from 'react';

import styles from './DashboardCard.module.scss';

export type DashboardCardProps = {
  children: React.ReactNode;
  title?: string;
  titleColor?: string;
  infoIconProps?: InfoIconProps;
  noPadding?: boolean;
  className?: string;
};

export const DashboardCard = (props: DashboardCardProps) => {
  const { children, title, infoIconProps, noPadding: disablePadding, className, titleColor } = props;

  return (
    <ComponentContainer
      data-slot={'dashboard-card'}
      className={classNames(
        styles.container,
        disablePadding ? styles.noPadding : undefined,
        className,
        title && infoIconProps ? styles.withTitleAndInfoIcon : undefined,
      )}
    >
      {title && (
        <div data-slot={'dashboard-card-title'} className={styles.title}>
          <Text color={titleColor ?? '--fn-fg-light'} fontWeight={FontWeights.medium}>
            {title}
          </Text>
        </div>
      )}

      {infoIconProps && (
        <div data-slot={'dashboard-card-info'} className={styles.infobox}>
          <InfoIcon size={IconSize.small} {...infoIconProps} />
        </div>
      )}

      <div data-slot={'dashboard-card-content'} className={styles.childrenContainer}>{children}</div>
    </ComponentContainer>
  );
};
