import './ToggleButton.scss';

import { ToggleButton as ToggleButtonBase, ToggleButtonProps } from '@mui/material';
import React from 'react';

import { ComponentContainer } from '../ComponentContainer/ComponentContainer';

type Props = ToggleButtonProps & {
  testId?: string;
};

export const ToggleButton = (props: Props) => {
  const { testId, ...rest } = props;

  return (
    <ComponentContainer testId={testId} className={'ToggleButton-container'}>
      <ToggleButtonBase {...rest} tabIndex={rest.tabIndex ?? 0} />
    </ComponentContainer>
  );
};
