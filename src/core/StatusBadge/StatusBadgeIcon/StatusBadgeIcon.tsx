import { Icon } from '@vanguard/Icon/Icon';
import { IconNames } from '@vanguard/Icon/IconNames';
import { getColorsBasedOnStatus } from '@vanguard/StatusBadge/status-badge-get-colors-based-on-status';
import { StatusBadgeIconVariant, StatusBadgeStatus } from '@vanguard/StatusBadge/StatusBadge';
import React from 'react';

import styles from './StatusBadgeIcon.module.scss';

export interface StatusBadgeIconProps {
  status?: StatusBadgeStatus;
  hasIconReverse?: boolean;
  variant?: 'small' | 'big';
  iconVariant?: StatusBadgeIconVariant;
  iconName?: IconNames;
  /** Shrinks the small icon's circle to 18px (10px glyph), for `<StatusBadge size="compact" />`. */
  compact?: boolean;
}

export const StatusBadgeIcon = (props: StatusBadgeIconProps) => {
  const { status, variant = 'small', hasIconReverse, iconVariant, iconName: propIconName, compact } = props;

  if (!status) {
    return null;
  }

  const { reverseColor, textColor, bgColor, borderColor, iconColor } = getColorsBasedOnStatus(status);
  let { iconName } = getColorsBasedOnStatus(status);

  if (propIconName) {
    iconName = propIconName;
  }

  if (iconVariant === 'none') {
    iconName = 'NO_ICON' as IconNames;
  }
  if (variant === 'big') {
    return (
      <Icon
        spin={status === 'publishing' || status === 'queued'}
        forceSize={24}
        hasCircle={true}
        fillColor={!hasIconReverse ? iconColor : bgColor}
        color={!hasIconReverse ? '--n000' : reverseColor}
        className={styles.bigIcon}
      >
        {iconName}
      </Icon>
    );
  }
  return (
    <Icon
      spin={status === 'publishing' || status === 'queued'}
      hasCircle={true}
      forceSize={compact ? 10 : undefined}
      fillColor={!hasIconReverse ? iconColor : bgColor}
      color={!hasIconReverse ? '--n000' : reverseColor}
    >
      {iconName}
    </Icon>
  );
};
