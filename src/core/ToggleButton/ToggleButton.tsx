import './ToggleButton.scss';

import { classNames } from '@helpers/classNames';
import { ToggleButton as ToggleButtonBase, ToggleButtonProps } from '@mui/material';
import { Icon } from '@vanguard/Icon/Icon';
import React from 'react';

import { ComponentContainer } from '../ComponentContainer/ComponentContainer';

type Props = ToggleButtonProps & {
  testId?: string;
};

export const ToggleButton = (props: Props) => {
  const { testId, className, ...rest } = props;
  const isIconOnly = React.isValidElement(rest.children) && rest.children.type === Icon;

  return (
    <ComponentContainer testId={testId} className={'ToggleButton-container'}>
      <ToggleButtonBase {...rest} className={classNames(className, isIconOnly ? 'ToggleButton-icon-only' : '')} />
    </ComponentContainer>
  );
};
