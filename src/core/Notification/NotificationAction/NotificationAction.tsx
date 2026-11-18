import './NotificationAction.scss';

import * as React from 'react';

import { Icon } from '../../Icon/Icon';
import { IconNames } from '../../Icon/IconNames';
import { Text, TextTypes } from '../../Text/Text';

interface Props {
  width?: number;
  label: string;
  cb: () => void;
  iconLeft?: IconNames;
  iconRight?: IconNames;
}

export type NotificationActionProps = Props;

export const NotificationAction = (props: Props) => {
  const { width = 100, label, iconLeft, iconRight, cb } = props;
  const renderIcon = (name?: IconNames) => {
    if (!name) return;
    return <Icon>{name}</Icon>;
  };
  return (
    <div
      data-slot={'notification-action'}
      style={{ width: `${width}%` }}
      onClick={() => {
        if (cb && typeof cb === 'function') {
          cb();
        }
      }}
      className={'notif-action'}
    >
      {renderIcon(iconLeft)}
      <Text type={TextTypes.textHelp}>{label}</Text>
      {renderIcon(iconRight)}
    </div>
  );
};
