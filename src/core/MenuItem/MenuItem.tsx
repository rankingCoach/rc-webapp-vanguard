import { MenuItem as MuiMenuItem, MenuItemProps as MuiMenuItemProps } from '@mui/material';
import { IconNames } from '@vanguard/Icon';
import { Icon, IconProps } from '@vanguard/Icon/Icon';
import { Text, TextTypes } from '@vanguard/Text/Text';
import React from 'react';

import { MenuOption } from '../../primitives/react/Menu/MenuOption';
import { useInOwnOptionHost } from '../../primitives/react/Menu/option-host-context';
import { sxToStyle } from '../../primitives/react/sx-compat';

export type MenuItemIconPosition = 'before' | 'after';

export type MenuItemProps = {
  testId?: string;
  className?: string;
  textType?: TextTypes;
  icon?: IconNames;
  iconProps?: Omit<IconProps, 'children'>;
  iconPosition?: MenuItemIconPosition;
  useActiveIcon?: boolean;
} & Omit<MuiMenuItemProps, 'className'>;

export const MenuItem = ({
  testId,
  className,
  children,
  textType = TextTypes.text,
  icon,
  iconProps,
  iconPosition = 'before',
  useActiveIcon = false,
  ...rest
}: MenuItemProps) => {
  const inOwnHost = useInOwnOptionHost();
  const text = typeof children === 'string' ? <Text type={textType}>{children}</Text> : children;

  const isSelected = rest.selected;
  const resolvedIcon = icon && useActiveIcon ? (`${icon}-active` as IconNames) : icon;
  const iconColor = isSelected ? 'var(--fn-fg-cta)' : undefined;
  const iconEl = resolvedIcon ? (
    <Icon color={iconColor} {...iconProps}>
      {resolvedIcon}
    </Icon>
  ) : null;

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

  if (inOwnHost) {
    // Inside an own-core popup (Select menu): same content and props on the own-core option.
    const {
      autoFocus: _autoFocus,
      classes: _classes,
      focusVisibleClassName: _fvc,
      disableRipple: _dr,
      disableTouchRipple: _dtr,
      focusRipple: _fr,
      TouchRippleProps: _trp,
      touchRippleRef: _trr,
      component: _component,
      sx,
      style,
      ...optionProps
    } = rest as typeof rest & Record<string, unknown>;
    return (
      <MenuOption
        data-testid={testId}
        className={className}
        style={sx || style ? { ...sxToStyle(sx as never, 'MenuItem'), ...(style as React.CSSProperties) } : undefined}
        {...(optionProps as Record<string, unknown>)}
      >
        {content}
      </MenuOption>
    );
  }

  return (
    <MuiMenuItem data-testid={testId} className={className} {...rest}>
      {content}
    </MuiMenuItem>
  );
};
