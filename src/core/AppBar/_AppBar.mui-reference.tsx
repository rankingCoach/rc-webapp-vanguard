// Frozen MUI implementation (HEAD a3f9ab4) for the own-core differential; do not edit.
import './AppBar.scss';

import { AppBar as AppBarBase } from '@mui/material';
import { AppBarProps } from '@mui/material/AppBar';
import { useThemeProps } from '@mui/material/styles';
import React from 'react';
import { ComponentContainer } from '../ComponentContainer/ComponentContainer';

type Props = {} & AppBarProps;

export const AppBarMuiReference = (inProps: Props) => {
  const props = useThemeProps({ props: inProps, name: 'MuiAppBar' });

  return (
    <ComponentContainer className={'AppBar-container'}>
      <AppBarBase
        {...props}
        sx={[
          ...(props.color === 'inherit' ? [{ color: 'inherit' }] : []),
          ...(Array.isArray(props.sx) ? props.sx : [props.sx]),
        ]}
      />
    </ComponentContainer>
  );
};
