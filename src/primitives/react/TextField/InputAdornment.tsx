import React from 'react';
import { useVanguardTypography } from '../typography-context';
import { OwnFormControlContext, useOwnFormControl } from './form-control-context';

export interface InputAdornmentProps {
  position: 'start' | 'end';
  children?: React.ReactNode;
  className?: string;
  component?: React.ElementType;
  disablePointerEvents?: boolean;
  disableTypography?: boolean;
  variant?: 'outlined' | 'filled' | 'standard';
  /** Anything else lands on the root, like MUI. */
  [extra: string]: unknown;
}

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const cx = (...parts: unknown[]) => parts.filter((p) => typeof p === 'string' && p !== '').join(' ');

/**
 * MUI 9.5 InputAdornment on the own core: classes in MUI's order (root, disablePointerEvents, position, variant,
 * hiddenLabel, size) with variant and size from the enclosing own TextFieldFrame, the zero-width span before `start`
 * children, string children in body1 Typography, and no form-control context for its children. Styles:
 * mui-compat.scss (TextField.scss).
 */
export const InputAdornment = (props: InputAdornmentProps) => {
  const {
    children,
    className,
    component: Root = 'div',
    disablePointerEvents = false,
    disableTypography = false,
    position,
    variant: variantProp,
    ...other
  } = props;
  const fc = useOwnFormControl();
  const vgType = useVanguardTypography() === 'vanguard' ? 'vg-typography-vanguard' : '';
  const variant = variantProp ?? fc?.variant;
  const classes = cx(
    'MuiInputAdornment-root',
    disablePointerEvents ? 'MuiInputAdornment-disablePointerEvents' : '',
    `MuiInputAdornment-position${capitalize(position)}`,
    variant ? `MuiInputAdornment-${variant}` : '',
    fc?.hiddenLabel ? 'MuiInputAdornment-hiddenLabel' : '',
    fc?.size ? `MuiInputAdornment-size${capitalize(fc.size)}` : '',
    className,
  );
  return (
    <OwnFormControlContext.Provider value={null}>
      <Root className={classes} data-slot="input-adornment" data-vg-core="" {...other}>
        {typeof children === 'string' && !disableTypography ? (
          <p className={cx('MuiTypography-root', 'MuiTypography-body1', vgType)} data-vg-core="">
            {children}
          </p>
        ) : (
          <>
            {position === 'start' ? (
              <span className="notranslate" aria-hidden="true">
                {'​'}
              </span>
            ) : null}
            {children}
          </>
        )}
      </Root>
    </OwnFormControlContext.Provider>
  );
};
