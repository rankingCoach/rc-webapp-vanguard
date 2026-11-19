import './AppBar.scss';

import { AppBar as AppBarBase } from '@mui/material';
import { AppBarProps } from '@mui/material/AppBar';
import { useThemeProps } from '@mui/material/styles';
import React from 'react';
import { OwnAppBar } from '../../primitives/react/AppBar/AppBar';
import { ComponentContainer } from '../ComponentContainer/ComponentContainer';

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
  const props = useThemeProps({ props: inProps, name: 'MuiAppBar' });

  return (
    <ComponentContainer className={'AppBar-container'}>
      {isOwn(props) ? (
        <OwnAppBar {...(props as React.ComponentProps<typeof OwnAppBar>)} />
      ) : (
        <AppBarBase
          {...props}
          sx={[
            ...(props.color === 'inherit' ? [{ color: 'inherit' }] : []),
            ...(Array.isArray(props.sx) ? props.sx : [props.sx]),
          ]}
        />
      )}
    </ComponentContainer>
  );
};
