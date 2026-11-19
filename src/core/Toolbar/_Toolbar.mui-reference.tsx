// Frozen MUI implementation (HEAD a3f9ab4) for the own-core differential; do not edit.
import './Toolbar.scss';

import { Toolbar as ToolbarBase } from '@mui/material';
import { ToolbarProps } from '@mui/material/Toolbar';
import React from 'react';
import { ComponentContainer } from '../ComponentContainer/ComponentContainer';

type Props = {} & ToolbarProps;

export const ToolbarMuiReference = (props: Props) => {
  const {} = props;

  return (
    <ComponentContainer className={'Toolbar-container'}>
      <ToolbarBase {...props} />
    </ComponentContainer>
  );
};
