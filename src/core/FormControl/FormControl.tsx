import './FormControl.scss';

import type { FormControlProps } from '@mui/material';
import React from 'react';
import { lazyFallback } from '../_internal/lazy-fallback';
import { ComponentContainer } from '../ComponentContainer/ComponentContainer';

// MUI's FormControl behind a lazy boundary (plan §36.2 B.3; the own port comes last, unreachable today).
const FormControlBase = lazyFallback(
  () => import('./FormControlMuiFallback') as never,
) as React.ComponentType<FormControlProps>;

type Props = {} & FormControlProps;

export const FormControl = (props: Props) => {
  const {} = props;

  return (
    <ComponentContainer className={'FormControl-container'}>
      <FormControlBase {...props} />
    </ComponentContainer>
  );
};
