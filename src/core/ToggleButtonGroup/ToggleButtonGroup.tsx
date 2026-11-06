import './ToggleButtonGroup.scss';

import { classNames } from '@helpers/classNames';
import { ToggleButtonGroup as ToggleButtonGroupBase, ToggleButtonGroupProps } from '@mui/material';
import React from 'react';

import { ComponentContainer } from '../ComponentContainer/ComponentContainer';

type Props = ToggleButtonGroupProps & {
  /**
   * `segmented`: a 32px muted track with the pressed item as a white glass chip; labels keep their case.
   * Holds text items and icon-only items (a single `Icon` child, painted in the item's text colour).
   */
  variant?: 'default' | 'segmented';
};

export const ToggleButtonGroup = (props: Props) => {
  const { variant = 'default', ...rest } = props;

  return (
    <ComponentContainer
      className={classNames(
        'ToggleButtonGroup-container',
        variant === 'segmented' ? 'ToggleButtonGroup-segmented' : '',
      )}
    >
      <ToggleButtonGroupBase {...rest} />
    </ComponentContainer>
  );
};
