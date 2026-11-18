import { classNames } from '@helpers/classNames';
import React from 'react';
import { ButtonBase } from '../ButtonBase/ButtonBase';
import { useVanguardTypography } from '../typography-context';

export interface MenuOptionProps extends Omit<React.LiHTMLAttributes<HTMLLIElement>, 'value'> {
  selected?: boolean;
  disabled?: boolean;
  dense?: boolean;
  disableGutters?: boolean;
  divider?: boolean;
  value?: unknown;
  'data-value'?: unknown;
  ref?: React.Ref<HTMLElement>;
  [dataAttr: `data-${string}`]: unknown;
}

/**
 * Menu option = MUI MenuItem parity on Vanguard's ButtonBase (`li`, legacy MuiMenuItem/Mui-selected/Mui-disabled
 * classes, focus ripple off like MUI MenuItem's default, roving tab index managed by the popup).
 */
export const MenuOption = (props: MenuOptionProps) => {
  const {
    selected = false,
    disabled = false,
    dense,
    disableGutters = false,
    divider,
    className,
    children,
    value: _v,
    ...rest
  } = props;
  const vgType = useVanguardTypography() === 'vanguard' ? 'vg-typography-vanguard' : '';
  return (
    <ButtonBase
      component="li"
      nativeButton={false}
      role="option"
      tabIndex={-1}
      disabled={disabled}
      data-slot="menu-option"
      data-selected={selected ? '' : undefined}
      data-disabled={disabled ? '' : undefined}
      {...(rest as Record<string, unknown>)}
      aria-disabled={disabled ? true : undefined}
      className={classNames(
        'MuiMenuItem-root',
        dense ? 'MuiMenuItem-dense' : '',
        divider ? 'MuiMenuItem-divider' : '',
        disableGutters ? '' : 'MuiMenuItem-gutters',
        selected ? 'Mui-selected' : '',
        vgType,
        className ?? '',
      )}
    >
      {children}
    </ButtonBase>
  );
};
