import { MenuItem as MuiMenuItem, MenuItemProps as MuiMenuItemProps } from '@mui/material';
import { IconNames } from '@vanguard/Icon';
import { Icon, IconProps } from '@vanguard/Icon/Icon';
import { Text, TextTypes } from '@vanguard/Text/Text';
import React from 'react';

export type MenuItemIconPosition = 'before' | 'after';

export type MenuItemProps = {
  testId?: string;
  className?: string;
  textType?: TextTypes;
  icon?: IconNames;
  iconProps?: Omit<IconProps, 'children'>;
  iconPosition?: MenuItemIconPosition;
} & Omit<MuiMenuItemProps, 'className'>;

export const MenuItem = ({
  testId,
  className,
  children,
  textType = TextTypes.text,
  icon,
  iconProps,
  iconPosition = 'before',
  ...rest
}: MenuItemProps) => {
  const text = typeof children === 'string' ? <Text type={textType}>{children}</Text> : children;

  const iconEl = icon ? <Icon {...iconProps}>{icon}</Icon> : null;

  const content = iconEl ? (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        gap: 8,
        justifyContent: iconPosition === 'after' ? 'space-between' : 'flex-start',
      }}
    >
      {iconPosition === 'before' && iconEl}
      {text}
      {iconPosition === 'after' && iconEl}
    </div>
  ) : (
    text
  );

  return (
    <MuiMenuItem data-testid={testId} className={className} {...rest}>
      {content}
    </MuiMenuItem>
  );
};
