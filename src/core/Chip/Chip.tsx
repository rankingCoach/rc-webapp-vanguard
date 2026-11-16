import { classNames } from '@helpers/classNames';
import { Chip as MuiChip } from '@mui/material';
import React from 'react';

import styles from './Chip.module.scss';

export interface ChipProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onClick' | 'color' | 'children'> {
  label: React.ReactNode;
  /** Default 'medium'. */
  size?: 'small' | 'medium';
  /** Default 'filled'. */
  variant?: 'filled' | 'outlined';
  disabled?: boolean;
  /** Shows a delete icon; called when it is clicked or Backspace/Delete is pressed on the chip. */
  onDelete?: (event: React.SyntheticEvent) => void;
  /** Makes the chip clickable. */
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
  /** Leading icon/avatar. */
  icon?: React.ReactElement;
  className?: string;
  testId?: string;
}

/**
 * Compact element for a value, filter or tag. Accepts the props returned by an Autocomplete's
 * `getItemProps({ index })` spread (key, className, disabled, data-item-index, tabIndex, onDelete).
 */
export const Chip = (props: ChipProps) => {
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
