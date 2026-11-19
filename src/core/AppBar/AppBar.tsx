import './AppBar.scss';

import type { AppBarProps } from '@mui/material/AppBar';
import React from 'react';
import { OwnAppBar } from '../../primitives/react/AppBar/AppBar';
import { lazyFallback } from '../_internal/lazy-fallback';
import { useThemeDefaultProps } from '../_internal/theme-default-props';
import { ComponentContainer } from '../ComponentContainer/ComponentContainer';

// MUI's AppBar route behind a lazy boundary (plan §36.2 B.3).
const AppBarBase = lazyFallback(() => import('./AppBarMuiFallback') as never) as React.ComponentType<AppBarProps>;

type Props = {} & AppBarProps;

/** Props the own AppBar models (rc-webapp's Navbar: ref, className, position, style); anything else keeps MUI. */
const OWN_PROPS = new Set([
  'children',
  'className',
  'style',
  'position',
  'color',
  'enableColorOnDark',
  'ref',
  'id',
  'role',
]);
const isOwn = (props: object) =>
  Object.keys(props).every(
    (k) => OWN_PROPS.has(k) || k.startsWith('data-') || k.startsWith('aria-') || /^on[A-Z]/.test(k),
  );

export const AppBar = (inProps: Props) => {
  // MUI's useThemeProps semantics without importing MUI (src/core/_internal/theme-default-props.ts, option 5.3).
  const props = useThemeDefaultProps(inProps as Record<string, unknown>, 'MuiAppBar') as Props;

  return (
    <ComponentContainer className={'AppBar-container'}>
      {isOwn(props) ? <OwnAppBar {...(props as React.ComponentProps<typeof OwnAppBar>)} /> : <AppBarBase {...props} />}
    </ComponentContainer>
  );
};
