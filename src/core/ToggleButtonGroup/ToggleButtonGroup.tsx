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
  /** Segmented only: the track and its items as pills. */
  rounded?: boolean;
  /** Segmented only: `large` is a 48px track with 16px labels, for a page's main switch (e.g. its sources). */
  segmentedSize?: 'default' | 'large';
};

export const ToggleButtonGroup = (props: Props) => {
  const { variant = 'default', rounded = false, segmentedSize = 'default', ...rest } = props;
  const isSegmented = variant === 'segmented';

  return (
    <ComponentContainer
      className={classNames(
        'ToggleButtonGroup-container',
        isSegmented ? 'ToggleButtonGroup-segmented' : '',
        isSegmented && rounded ? 'ToggleButtonGroup-segmented-rounded' : '',
        isSegmented && segmentedSize === 'large' ? 'ToggleButtonGroup-segmented-large' : '',
      )}
    >
      <ToggleButtonGroupBase {...rest} />
    </ComponentContainer>
  );
};
