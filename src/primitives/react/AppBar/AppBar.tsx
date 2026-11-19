// Ported from @mui/material@9.5.0 AppBar/AppBar.js, Toolbar/Toolbar.js, Paper/Paper.js (MIT)
import React from 'react';
import { cx } from '../class-names';

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const PAPER_SHADOW_4 =
  '0px 2px 4px -1px rgba(0,0,0,0.2),0px 4px 5px 0px rgba(0,0,0,0.14),0px 1px 10px 0px rgba(0,0,0,0.12)';

export interface OwnAppBarProps extends React.HTMLAttributes<HTMLElement> {
  color?: 'default' | 'inherit' | 'primary' | 'secondary' | 'transparent' | 'error' | 'info' | 'success' | 'warning';
  position?: 'fixed' | 'absolute' | 'sticky' | 'static' | 'relative';
  enableColorOnDark?: boolean;
  ref?: React.Ref<HTMLElement>;
}

/**
 * MUI 9.5 AppBar on the own core: `header` Paper (square, elevation 4, `--Paper-shadow` inline), classes in MUI's
 * order (Paper root, AppBar root, color, position, className, `mui-fixed` when fixed: the ModalManager's scrollbar-gap
 * compensation targets it). Styles: AppBar.compat.scss (mui-compat.scss).
 */
export const OwnAppBar = (props: OwnAppBarProps) => {
  const {
    className,
    color = 'primary',
    enableColorOnDark: _enableColorOnDark,
    position = 'fixed',
    style,
    ref,
    ...other
  } = props;
  return (
    <header
      className={cx(
        'MuiPaper-root MuiPaper-elevation MuiPaper-elevation4',
        'MuiAppBar-root',
        `MuiAppBar-color${capitalize(color)}`,
        `MuiAppBar-position${capitalize(position)}`,
        className,
        position === 'fixed' && 'mui-fixed',
      )}
      data-slot="app-bar"
      data-vg-core=""
      ref={ref}
      {...other}
      style={{ ['--Paper-shadow' as string]: PAPER_SHADOW_4, ...style }}
    />
  );
};

export interface OwnToolbarProps extends React.HTMLAttributes<HTMLDivElement> {
  disableGutters?: boolean;
  variant?: 'regular' | 'dense';
  ref?: React.Ref<HTMLDivElement>;
}

/** MUI 9.5 Toolbar: `div.MuiToolbar-root` + gutters (unless disabled) + variant, then className. */
export const OwnToolbar = (props: OwnToolbarProps) => {
  const { className, disableGutters = false, variant = 'regular', ref, ...other } = props;
  return (
    <div
      className={cx('MuiToolbar-root', !disableGutters && 'MuiToolbar-gutters', `MuiToolbar-${variant}`, className)}
      data-slot="toolbar"
      data-vg-core=""
      ref={ref}
      {...other}
    />
  );
};
