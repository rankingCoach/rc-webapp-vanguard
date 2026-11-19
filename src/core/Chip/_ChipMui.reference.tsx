// Test-only reference: the former MUI implementation of Chip, verbatim (rename only). Used by the parity spec and
// the Chromium differential story; not exported from the package.

import styles from './Chip.module.scss';
import { classNames } from '@helpers/classNames';
import { Chip as MuiChip } from '@mui/material';
import React from 'react';
import type { ChipProps } from './Chip';

/**
 * Compact element for a value, filter or tag. Accepts the props returned by an Autocomplete's
 * `getItemProps({ index })` spread (key, className, disabled, data-item-index, tabIndex, onDelete).
 */
export const ChipMui = (props: ChipProps) => {
  const {
    label,
    size = 'medium',
    variant = 'filled',
    disabled,
    onDelete,
    onClick,
    icon,
    className,
    testId = 'chip',
    ...rest
  } = props;
  return (
    <MuiChip
      {...rest}
      label={label}
      size={size}
      variant={variant}
      disabled={disabled}
      onDelete={onDelete}
      onClick={onClick}
      icon={icon}
      data-testid={testId}
      className={classNames(styles.chip, 'vanguard-chip', className)}
    />
  );
};
