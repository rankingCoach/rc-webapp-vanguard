// Ported from @mui/material@9.5.0 Chip/Chip.js, internal/svg-icons/Cancel.js, SvgIcon/SvgIcon.js (MIT)

import styles from './Chip.module.scss';
import { classNames } from '@helpers/classNames';
import React from 'react';
import { ButtonBase } from '../../primitives/react/ButtonBase/ButtonBase';
import { useVanguardTypography } from '../../primitives/react/typography-context';

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

/** MUI's internal Cancel icon path (svg-icons/Cancel.js). */
const CANCEL_PATH =
  'M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z';

const isDeleteKeyboardEvent = (event: React.KeyboardEvent) => event.key === 'Backspace' || event.key === 'Delete';

/**
 * Compact element for a value, filter or tag. Accepts the props returned by an Autocomplete's
 * `getItemProps({ index })` spread (key, className, disabled, data-item-index, tabIndex, onDelete).
 *
 * Renders MUI 9.5 Chip's DOM itself (color 'default'): a plain div, or A's ButtonBase as a div when clickable or
 * deletable (role=button, focus-visible, ripple only when clickable and not deletable), the label span, MUI's Cancel
 * svg as delete icon; Backspace/Delete on the chip itself calls onDelete on key up. Emotion's rules are static in
 * _Chip.compat.scss (D15 last block); `vg-typography-vanguard` selects VanguardThemeProvider's rem sizes.
 */
export const Chip = (props: ChipProps) => {
  const {
    label,
    size = 'medium',
    variant = 'filled',
    disabled = false,
    onDelete,
    onClick,
    icon: iconProp,
    className,
    testId = 'chip',
    tabIndex,
    onKeyDown,
    onKeyUp,
    ...rest
  } = props;
  const vgType = useVanguardTypography() === 'vanguard' ? 'vg-typography-vanguard' : '';
  const clickable = !!onClick;
  const isButton = clickable || !!onDelete;

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.currentTarget === event.target && isDeleteKeyboardEvent(event)) event.preventDefault();
    onKeyDown?.(event);
  };
  const handleKeyUp = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.currentTarget === event.target && onDelete && isDeleteKeyboardEvent(event)) onDelete(event);
    onKeyUp?.(event);
  };

  const icon =
    iconProp && React.isValidElement<{ className?: string; color?: string }>(iconProp)
      ? React.cloneElement(iconProp, { className: classNames('MuiChip-icon', iconProp.props.className) })
      : null;
  // MUI's `iconColor === color` variant (icon colour #616161): true unless the icon element brings its own colour.
  const iconColorDefault = !!icon && ((icon.props as { color?: string }).color ?? 'default') === 'default';

  const chipClasses = classNames(
    'MuiChip-root',
    `MuiChip-${variant}`,
    disabled ? 'Mui-disabled' : undefined,
    size === 'small' ? 'MuiChip-sizeSmall' : 'MuiChip-sizeMedium',
    'MuiChip-colorDefault',
    clickable ? 'MuiChip-clickable' : undefined,
    onDelete ? 'MuiChip-deletable' : undefined,
    styles.chip,
    'vanguard-chip',
    className,
    vgType,
  );
  const own = {
    'data-vg-core': '',
    'data-slot': 'chip',
    'data-variant': variant,
    'data-size': size,
    'data-disabled': disabled ? '' : undefined,
    'data-icon-color': iconColorDefault ? 'default' : undefined,
  };
  const children = (
    <>
      {icon}
      <span data-vg-core="" data-slot={'chip-label'} className={'MuiChip-label'}>
        {label}
      </span>
      {onDelete ? (
        <svg
          data-vg-core=""
          data-slot={'chip-delete'}
          className={'MuiSvgIcon-root MuiSvgIcon-fontSizeMedium MuiChip-deleteIcon'}
          focusable="false"
          aria-hidden="true"
          viewBox="0 0 24 24"
          data-testid="CancelIcon"
          onClick={(event) => {
            event.stopPropagation();
            onDelete(event);
          }}
        >
          <path d={CANCEL_PATH} />
        </svg>
      ) : null}
    </>
  );

  if (!isButton) {
    return (
      <div
        {...rest}
        {...own}
        tabIndex={tabIndex}
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
        data-testid={testId}
        className={chipClasses}
      >
        {children}
      </div>
    );
  }
  return (
    <ButtonBase
      {...rest}
      {...own}
      component={'div'}
      nativeButton={false}
      focusVisibleClassName={'Mui-focusVisible'}
      disableRipple={!!onDelete}
      disabled={clickable && disabled ? true : undefined}
      tabIndex={tabIndex}
      onClick={(event) => onClick?.(event as React.MouseEvent<HTMLDivElement>)}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
      data-testid={testId}
      className={chipClasses}
    >
      {children}
    </ButtonBase>
  );
};
