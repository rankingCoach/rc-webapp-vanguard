import { Menu as MuiMenu, MenuProps as MuiMenuProps } from '@mui/material';
import { MenuItem, MenuItemProps } from '@vanguard/MenuItem/MenuItem';
import React from 'react';

import styles from './Menu.module.scss';

export type MenuItemConfig = MenuItemProps & {
  key?: React.Key;
};

export type MenuProps = {
  testId?: string;
  items?: MenuItemConfig[];
  width?: React.CSSProperties['width'];
  height?: React.CSSProperties['height'];
  maxWidth?: React.CSSProperties['maxWidth'];
  maxHeight?: React.CSSProperties['maxHeight'];
} & Omit<MuiMenuProps, 'children'> & {
    children?: React.ReactNode;
  };

export const Menu = ({ testId, items, children, width, height, maxWidth, maxHeight, ...rest }: MenuProps) => {
  const sizeStyle = width || height || maxWidth || maxHeight ? { width, height, maxWidth, maxHeight } : undefined;

  const slotProps = sizeStyle
    ? { paper: { style: { ...sizeStyle, ...rest.slotProps?.paper?.['style'] }, ...rest.slotProps?.paper } }
    : rest.slotProps;

  return (
    <MuiMenu data-testid={testId} {...rest} slotProps={slotProps} className={styles.menu}>
      {items ? items.map(({ key, ...itemProps }, index) => <MenuItem key={key ?? index} {...itemProps} />) : children}
    </MuiMenu>
  );
};
