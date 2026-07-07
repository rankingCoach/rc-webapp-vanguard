import { uuidv4 } from '@helpers/generate-uid';
import { Menu as MuiMenu, MenuProps as MuiMenuProps } from '@mui/material';
import { MenuItem, MenuItemProps } from '@vanguard/MenuItem/MenuItem';
import { OVERLAY_BASE_Z_INDEX, OverlayStackingService } from '@vanguard/OverlayStacking/OverlayStackingService';
import React, { useEffect, useRef, useState } from 'react';

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

  /**
   * Menu popper stacking
   * -------
   * MUI's Menu portals to <body> pinned to the static `theme.zIndex.modal`
   * (1300), so inside a stacked modal/drawer it paints *behind* the surface
   * that opened it. `open` is controlled by the caller, so we mirror it into
   * an effect: register a 'popover' slot while open, release it on close —
   * same pattern as the Select dropdown in InputBase.
   */
  const menuIdRef = useRef<string>(`menu-${uuidv4()}`);
  const [menuZIndex, setMenuZIndex] = useState(OVERLAY_BASE_Z_INDEX);

  useEffect(() => {
    if (rest.open) {
      setMenuZIndex(OverlayStackingService.register(menuIdRef.current, 'popover'));
    } else {
      OverlayStackingService.unregister(menuIdRef.current);
      setMenuZIndex(OVERLAY_BASE_Z_INDEX);
    }
    return () => OverlayStackingService.unregister(menuIdRef.current);
  }, [rest.open]);

  const slotProps = {
    ...rest.slotProps,
    ...(sizeStyle
      ? { paper: { style: { ...sizeStyle, ...rest.slotProps?.paper?.['style'] }, ...rest.slotProps?.paper } }
      : {}),
    // Override MUI's static z-index so the menu stacks above any modal/drawer
    // it was opened from (see OverlayStackingService). Caller style is merged
    // in (not replaced) so it can't clobber the zIndex override.
    root: { ...rest.slotProps?.root, style: { ...rest.slotProps?.root?.['style'], zIndex: menuZIndex } },
  };

  return (
    <MuiMenu data-testid={testId} {...rest} slotProps={slotProps} className={styles.menu}>
      {items ? items.map(({ key, ...itemProps }, index) => <MenuItem key={key ?? index} {...itemProps} />) : children}
    </MuiMenu>
  );
};
