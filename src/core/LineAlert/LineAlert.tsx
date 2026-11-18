import { classNames } from '@helpers/classNames';
import { ComponentContainer } from '@vanguard/ComponentContainer/ComponentContainer';
import { Icon, IconSize } from '@vanguard/Icon/Icon';
import { IconNames } from '@vanguard/Icon/IconNames';
import { Text } from '@vanguard/Text/Text';
import React from 'react';

import styles from './LineAlert.module.scss';

type LineAlertType = 'danger' | 'info' | 'warning' | 'success';

export interface LineAlertProps {
  children: string;
  type?: LineAlertType;
}

export const LineAlert = (props: LineAlertProps) => {
  const { children, type = 'info' } = props;

  /**
   * FN: Render Icon depending on type
   */
  function renderIcon() {
    switch (type) {
      case 'danger':
        return (
          <Icon testId={'line-alert-icon'} color={'--e500'} type={IconSize.small} hasCircle={true}>
            {IconNames.exclamation}
          </Icon>
        );
      case 'warning':
        return (
          <Icon testId={'line-alert-icon'} color={'--w500'} type={IconSize.large} hasCircle={false}>
            {IconNames.warning}
          </Icon>
        );
      case 'success':
        return (
          <Icon testId={'line-alert-icon'} color={'--s500'} type={IconSize.small} hasCircle={true}>
            {IconNames.check}
          </Icon>
        );
      case 'info':
      default:
        return (
          <Icon testId={'line-alert-icon'} color={'--i500'} type={IconSize.small} hasCircle={true}>
            {IconNames.exclamation}
          </Icon>
        );
    }
  }

  /**
   * Return View
   */
  return (
    <ComponentContainer data-slot="line-alert" data-type={type} className={classNames(styles.lineAlert, styles[type])}>
      {renderIcon()}
      <Text className={styles.text}>{children}</Text>
    </ComponentContainer>
  );
};
