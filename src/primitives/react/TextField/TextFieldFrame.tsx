import { classNames } from '@helpers/classNames';
import React from 'react';

/* eslint-disable @typescript-eslint/no-explicit-any */
type AnyProps = Record<string, any>;

export type TextFieldSize = 'small' | 'medium';

const capitalize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

/** MUI's `Mui-focused/-disabled/-error` state classes, in MUI's order, before `base`. */
export const textFieldStateClasses = (state: { focused: boolean; disabled: boolean; error: boolean }, base = '') =>
  classNames(
    state.focused ? 'Mui-focused' : '',
    state.disabled ? 'Mui-disabled' : '',
    state.error ? 'Mui-error' : '',
    base,
  );

export interface TextFieldFrameProps {
  id: string;
  /** Root (`MuiFormControl-root`) props: consumer className, sx/style and the remaining TextField props. */
  className?: string;
  sx?: unknown;
  style?: React.CSSProperties;
  rootProps?: AnyProps;
  fullWidth: boolean;

  label?: React.ReactNode;
  labelId?: string;
  /** `slots.inputLabel` replaces the label host; otherwise `component`/`vanguardComponent` from the label slot. */
  labelSlotComponent?: React.ElementType;
  labelSlot?: AnyProps;
  shrink: boolean;

  size: TextFieldSize;
  color: string;
  required: boolean;
  error: boolean;
  disabled: boolean;
  focused: boolean;
  filled: boolean;
  /** `vg-typography-vanguard` inside VanguardThemeProvider, else ''. */
  vgType: string;

  /** InputBase root: the `slotProps.input` rest (minus adornments/className), its className, extra MUI classes. */
  inputRootRest?: AnyProps;
  inputRootClassName?: string;
  /** Variant classes after `MuiInputBase-sizeSmall`, e.g. `MuiSelect-root` or `MuiInputBase-multiline`. */
  inputRootExtraClasses?: string;
  /** Full InputBase root class list (replaces the select-mode default order built from the props above). */
  inputRootClasses?: string;
  /** Handlers/ref on the InputBase root, applied after the rest. */
  inputRootHandlers?: AnyProps;
  startAdornment?: React.ReactNode;
  endAdornment?: React.ReactNode;

  helperText?: React.ReactNode;
  helperId?: string;
  helperSlot?: AnyProps;

  /** The control inside the InputBase root, between the adornments (select display + native input, input, textarea). */
  children: React.ReactNode;
  /** Rendered after the helper text inside the root (the select's menu). */
  after?: React.ReactNode;
}

/**
 * Outlined MUI 9.5 TextField frame on Vanguard's own core: FormControl root, shrinking/notched InputLabel, InputBase
 * root with the notched outline, FormHelperText. Same DOM, classes and data-slot hooks as MUI rendered; the control
 * inside is the caller's (SelectTextField, InputTextField). Paint: src/primitives/react/TextField/TextField.scss.
 */
export const TextFieldFrame = (props: TextFieldFrameProps) => {
  const {
    id,
    className,
    sx,
    style,
    rootProps,
    fullWidth,
    label,
    labelId,
    labelSlotComponent,
    labelSlot = {},
    shrink,
    size,
    color,
    required,
    error,
    disabled,
    focused,
    filled,
    vgType,
    inputRootRest,
    inputRootClassName,
    inputRootExtraClasses,
    inputRootClasses,
    inputRootHandlers,
    startAdornment,
    endAdornment,
    helperText,
    helperId,
    helperSlot = {},
    children,
    after,
  } = props;
  const hasLabel = label != null && label !== '';
  const state = { focused, disabled, error };
  const {
    component: labelComponent,
    vanguardComponent,
    shrink: _shrink,
    className: labelClassName,
    ...labelRest
  } = labelSlot;
  const LabelHost: React.ElementType = labelSlotComponent ?? labelComponent ?? vanguardComponent ?? 'label';

  return (
    <div
      className={classNames(
        'MuiFormControl-root',
        fullWidth ? 'MuiFormControl-fullWidth' : '',
        'MuiTextField-root',
        className ?? '',
      )}
      data-slot="text-field"
      style={{ ...(sx && typeof sx === 'object' && !Array.isArray(sx) ? sx : {}), ...style }}
      {...rootProps}
    >
      {hasLabel ? (
        <LabelHost
          data-shrink={shrink ? 'true' : 'false'}
          data-slot="text-field-label"
          htmlFor={id}
          id={labelId}
          {...labelRest}
          className={classNames(
            'MuiFormLabel-root',
            'MuiInputLabel-root',
            'MuiInputLabel-formControl',
            'MuiInputLabel-animated',
            shrink ? 'MuiInputLabel-shrink' : '',
            size === 'small' ? 'MuiInputLabel-sizeSmall' : '',
            'MuiInputLabel-outlined',
            `MuiFormLabel-color${capitalize(color)}`,
            textFieldStateClasses(state, filled ? 'MuiFormLabel-filled' : ''),
            required ? 'Mui-required' : '',
            vgType,
            labelClassName ?? '',
          )}
        >
          {label}
          {required ? (
            <span
              aria-hidden
              className={classNames('MuiFormLabel-asterisk', 'MuiInputLabel-asterisk', error ? 'Mui-error' : '')}
            >
              {' *'}
            </span>
          ) : null}
        </LabelHost>
      ) : null}
      <div
        data-slot="text-field-input"
        {...inputRootRest}
        onFocus={undefined}
        onBlur={undefined}
        {...inputRootHandlers}
        className={
          inputRootClasses ??
          classNames(
            'MuiInputBase-root',
            'MuiOutlinedInput-root',
            `MuiInputBase-color${capitalize(color)}`,
            fullWidth ? 'MuiInputBase-fullWidth' : '',
            startAdornment ? 'MuiInputBase-adornedStart' : '',
            endAdornment ? 'MuiInputBase-adornedEnd' : '',
            'MuiInputBase-formControl',
            size === 'small' ? 'MuiInputBase-sizeSmall' : '',
            inputRootExtraClasses ?? '',
            textFieldStateClasses(state),
            vgType,
            inputRootClassName ?? '',
          )
        }
      >
        {startAdornment}
        {children}
        {endAdornment}
        <fieldset aria-hidden="true" className="MuiOutlinedInput-notchedOutline" data-slot="text-field-outline">
          <legend
            className="vg-notched-legend"
            data-with-label={hasLabel ? '' : undefined}
            data-notched={hasLabel && shrink ? '' : undefined}
          >
            {hasLabel ? (
              <span>
                {label}
                {required ? ' *' : null}
              </span>
            ) : (
              <span className="notranslate" aria-hidden="true">
                {'​'}
              </span>
            )}
          </legend>
        </fieldset>
      </div>
      {helperText != null ? (
        <p
          id={helperId}
          data-slot="text-field-helper"
          {...helperSlot}
          className={classNames(
            'MuiFormHelperText-root',
            size === 'small' ? 'MuiFormHelperText-sizeSmall' : 'MuiFormHelperText-sizeMedium',
            'MuiFormHelperText-contained',
            textFieldStateClasses(state, filled ? 'MuiFormHelperText-filled' : ''),
            required ? 'Mui-required' : '',
            vgType,
            helperSlot.className ?? '',
          )}
        >
          {helperText}
        </p>
      ) : null}
      {after}
    </div>
  );
};
