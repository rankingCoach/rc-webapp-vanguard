import './Toolbar.scss';

import type { ToolbarProps } from '@mui/material/Toolbar';
import React from 'react';
import { OwnToolbar } from '../../primitives/react/AppBar/AppBar';
import { lazyFallback } from '../_internal/lazy-fallback';
import { ComponentContainer } from '../ComponentContainer/ComponentContainer';

// MUI's Toolbar route behind a lazy boundary (plan §36.2 B.3).
const ToolbarBase = lazyFallback(() => import('./ToolbarMuiFallback') as never) as React.ComponentType<ToolbarProps>;

type Props = {} & ToolbarProps;

/** Props the own Toolbar models (rc-webapp's Navbar: className); anything else (sx, component, classes) keeps MUI. */
const OWN_PROPS = new Set(['children', 'className', 'style', 'disableGutters', 'variant', 'ref', 'id', 'role']);
const isOwn = (props: object) =>
  Object.keys(props).every(
    (k) => OWN_PROPS.has(k) || k.startsWith('data-') || k.startsWith('aria-') || /^on[A-Z]/.test(k),
  );

export const Toolbar = (props: Props) => (
  <ComponentContainer className={'Toolbar-container'}>
    {isOwn(props) ? <OwnToolbar {...(props as React.ComponentProps<typeof OwnToolbar>)} /> : <ToolbarBase {...props} />}
  </ComponentContainer>
);
