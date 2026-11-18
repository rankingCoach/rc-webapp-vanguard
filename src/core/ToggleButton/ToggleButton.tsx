import './ToggleButton.scss';

import { classNames } from '@helpers/classNames';
import { Icon } from '@vanguard/Icon/Icon';
import React from 'react';
import { ROVING_ITEM_ATTR } from '../../primitives/core/roving-focus';
import { isValueSelected } from '../../primitives/core/selection';
import { ButtonBase, ButtonBaseProps } from '../../primitives/react/ButtonBase/ButtonBase';
import { SxCompat, sxToStyle } from '../../primitives/react/sx-compat';
import { useToggleGroup, useToggleGroupPosition } from '../../primitives/react/ToggleGroup/toggle-group-context';
import { useVanguardTypography } from '../../primitives/react/typography-context';
import { ComponentContainer } from '../ComponentContainer/ComponentContainer';

type ToggleButtonColor = 'standard' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';

/** Same props as before (formerly MUI ToggleButtonProps), now on Vanguard's own core. */
type Props = Omit<ButtonBaseProps, 'onChange' | 'onClick' | 'value'> & {
  value: NonNullable<any>;
  selected?: boolean;
  onChange?: (event: React.MouseEvent<HTMLElement>, value: any) => void;
  onClick?: (event: React.MouseEvent<HTMLElement>, value: any) => void;
  size?: 'small' | 'medium' | 'large';
  color?: ToggleButtonColor;
  fullWidth?: boolean;
  disableFocusRipple?: boolean;
  /** MUI `classes` keys (toggleButtonClasses), plus the extra palette colours. */
  classes?: Partial<
    Record<
      'root' | 'disabled' | 'selected' | 'sizeSmall' | 'sizeMedium' | 'sizeLarge' | 'fullWidth' | ToggleButtonColor,
      string
    >
  >;
  /** Accepts every MUI SxProps shape; only flat CSS objects apply (see sx-compat). */
  sx?: SxCompat;
  testId?: string;
};

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export const ToggleButton = (props: Props) => {
  const group = useToggleGroup();
  const position = useToggleGroupPosition();
  const typography = useVanguardTypography();
  const {
    testId,
    className,
    children,
    value,
    selected = isValueSelected(props.value, group?.value),
    onChange = group?.onChange,
    onClick,
    size = group?.size ?? 'medium',
    color = (group?.color as ToggleButtonColor | undefined) ?? 'standard',
    fullWidth = group?.fullWidth ?? false,
    disabled = group?.disabled ?? false,
    disableFocusRipple = false,
    classes,
    sx,
    style,
    tabIndex,
    ...rest
  } = props;
  const isIconOnly = React.isValidElement(children) && children.type === Icon;

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    if (onClick) {
      onClick(event, value);
      if (event.defaultPrevented) return;
    }
    onChange?.(event, value);
  };

  return (
    <ComponentContainer testId={testId} className={'ToggleButton-container'}>
      <ButtonBase
        data-slot="toggle-button"
        data-value={typeof value === 'object' ? undefined : String(value)}
        data-pressed={selected ? '' : undefined}
        data-disabled={disabled ? '' : undefined}
        {...(group ? { [ROVING_ITEM_ATTR]: '' } : {})}
        {...rest}
        className={classNames(
          group?.groupedClassName ?? '',
          'MuiToggleButton-root',
          selected ? 'Mui-selected' : '',
          disabled ? 'Mui-disabled' : '',
          fullWidth ? 'MuiToggleButton-fullWidth' : '',
          `MuiToggleButton-size${capitalize(size)}`,
          classes?.[`size${capitalize(size)}` as 'sizeSmall'] ?? '',
          `MuiToggleButton-${color}`,
          classes?.[color] ?? '',
          fullWidth ? (classes?.fullWidth ?? '') : '',
          typography === 'vanguard' ? 'vg-typography-vanguard' : '',
          classes?.root ?? '',
          selected ? (classes?.selected ?? '') : '',
          disabled ? (classes?.disabled ?? '') : '',
          className,
          position
            ? classNames(`MuiToggleButtonGroup-${position}Button`, group?.positionClassNames?.[position] ?? '')
            : '',
          isIconOnly ? 'ToggleButton-icon-only' : '',
        )}
        style={sx || style ? { ...sxToStyle(sx, 'ToggleButton'), ...style } : undefined}
        value={value}
        disabled={disabled}
        focusRipple={!disableFocusRipple}
        tabIndex={tabIndex ?? 0}
        aria-pressed={selected}
        onClick={handleClick}
      >
        {children}
      </ButtonBase>
    </ComponentContainer>
  );
};
