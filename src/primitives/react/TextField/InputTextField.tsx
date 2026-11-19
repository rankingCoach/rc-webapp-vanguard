// Ported from @mui/material@9.5.0 InputBase/InputBase.js, TextField/TextField.js (MIT)

import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { cx } from '../class-names';
import { useVanguardTypography } from '../typography-context';
import { TextareaAutosize } from './TextareaAutosize';
import { TextFieldFrame } from './TextFieldFrame';

/* eslint-disable @typescript-eslint/no-explicit-any */
type AnyProps = Record<string, any>;

/** Props as MUI v9 TextField receives them after Vanguard's legacy-slot mapping (MuiTextField.tsx), text mode. */
export interface InputTextFieldProps extends AnyProps {
  id: string;
  slots?: { inputLabel?: React.ElementType } & AnyProps;
  slotProps?: {
    input?: AnyProps;
    htmlInput?: AnyProps;
    inputLabel?: AnyProps;
    formHelperText?: AnyProps;
  };
}

const MUI_AUTO_FILL_CANCEL = 'mui-auto-fill-cancel';

/** OutlinedInput/InputBase props MUI TextField sets itself and `slotProps.input` can override. */
const INPUT_BASE_KEYS = [
  'onChange',
  'onFocus',
  'onBlur',
  'onKeyDown',
  'onKeyUp',
  'inputRef',
  'value',
  'defaultValue',
  'type',
  'name',
  'placeholder',
  'autoComplete',
  'autoFocus',
  'id',
  'rows',
  'minRows',
  'maxRows',
  'multiline',
  'disabled',
  'error',
  'required',
  'color',
  'size',
  'fullWidth',
  'aria-describedby',
] as const;

const hasValue = (value: unknown) => value != null && !(Array.isArray(value) && value.length === 0);
/** MUI InputBase `isFilled`; `ssr` also counts `defaultValue` (FormControl's initial scan). */
const isFilled = (obj: { value?: unknown; defaultValue?: unknown } | null | undefined, ssr = false) =>
  Boolean(
    obj &&
      ((hasValue(obj.value) && obj.value !== '') || (ssr && hasValue(obj.defaultValue) && obj.defaultValue !== '')),
  );

const setRef = <T,>(ref: React.Ref<T> | undefined, value: T | null) => {
  if (typeof ref === 'function') ref(value);
  else if (ref && typeof ref === 'object') (ref as React.MutableRefObject<T | null>).current = value;
};

/**
 * Outlined TextField in text mode (single-line input or auto-growing multiline textarea) on Vanguard's own core:
 * MUI 9.5 TextField + FormControl + OutlinedInput + InputBase DOM, classes and state machine (focused, filled incl.
 * uncontrolled typing and browser autofill, shrinking/notched label, root click focuses the input), no MUI import.
 */
export const InputTextField = (props: InputTextFieldProps) => {
  const {
    id,
    autoComplete,
    autoFocus = false,
    children: _children,
    className,
    color = 'primary',
    defaultValue,
    disabled = false,
    error = false,
    fullWidth = false,
    helperText,
    inputRef,
    label,
    maxRows,
    minRows,
    multiline = false,
    name,
    onBlur,
    onChange,
    onFocus,
    onKeyDown,
    onKeyUp,
    placeholder,
    required = false,
    rows,
    select: _select,
    size = 'medium',
    slots,
    slotProps,
    type,
    value,
    variant: _variant,
    sx,
    style,
    focused: focusedProp,
    margin: _margin,
    hiddenLabel: _hiddenLabel,
    ...rootRest
  } = props;
  const vgType = useVanguardTypography() === 'vanguard' ? 'vg-typography-vanguard' : '';
  const inputSlot = slotProps?.input ?? {};
  const htmlInput = slotProps?.htmlInput ?? {};
  const labelSlot = slotProps?.inputLabel ?? {};
  const helperSlot = slotProps?.formHelperText ?? {};
  const {
    startAdornment,
    endAdornment,
    className: inputRootClassName,
    readOnly = false,
    onClick: inputRootOnClick,
    notched: _notched,
    label: _outlinedLabel,
    ...inputSlotRest
  } = inputSlot;
  // MUI TextField spreads `slotProps.input` over the props it gives OutlinedInput, so InputBase-level keys there win
  // over the TextField's own (onChange, inputRef, value, disabled, ...); everything else lands on the InputBase root.
  const inputBaseOverrides: AnyProps = {};
  const inputRootRest: AnyProps = {};
  for (const [key, val] of Object.entries(inputSlotRest)) {
    if ((INPUT_BASE_KEYS as readonly string[]).includes(key)) inputBaseOverrides[key] = val;
    else inputRootRest[key] = val;
  }
  const ib = <T,>(key: (typeof INPUT_BASE_KEYS)[number], fallback: T): T =>
    key in inputBaseOverrides ? inputBaseOverrides[key] : fallback;
  const ibValue = ib('value', value);
  const ibDefaultValue = ib('defaultValue', defaultValue);
  const ibDisabled = ib('disabled', disabled);
  const ibError = ib('error', error);
  const ibRequired = ib('required', required);
  const ibColor: string = ib('color', color) ?? 'primary';
  const ibSize = ib('size', size);
  const ibFullWidth = ib('fullWidth', fullWidth);
  const ibMultiline = ib('multiline', multiline);
  const ibType = ib('type', type);
  const ibOnChange = ib('onChange', onChange);
  const ibOnFocus = ib('onFocus', onFocus);
  const ibOnBlur = ib('onBlur', onBlur);
  const ibOnKeyDown = ib('onKeyDown', onKeyDown);
  const ibOnKeyUp = ib('onKeyUp', onKeyUp);
  const ibInputRef = ib('inputRef', inputRef);

  // ---- FormControl state
  const [filledState, setFilled] = useState(() => isFilled({ value: ibValue, defaultValue: ibDefaultValue }, true));
  const [focusedState, setFocused] = useState(false);
  useEffect(() => {
    if (disabled && focusedState) setFocused(false);
  }, [disabled, focusedState]);
  const focused = focusedProp ?? (disabled ? false : focusedState);
  const adornedStart = Boolean(startAdornment);
  const shrink = labelSlot.shrink ?? (focused || filledState || adornedStart);
  const hasLabel = label != null && label !== '';
  const labelId = hasLabel ? `${id}-label` : undefined;
  const helperId = helperText != null ? `${id}-helper-text` : undefined;

  // ---- InputBase
  const htmlValue = htmlInput.value != null ? htmlInput.value : ibValue;
  const isControlled = useRef(htmlValue != null).current;
  const nodeRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);
  const handleRef = useCallback(
    (node: HTMLInputElement | HTMLTextAreaElement | null) => {
      nodeRef.current = node;
      setRef(ibInputRef, node);
      setRef(htmlInput.ref, node);
    },
    [ibInputRef, htmlInput.ref],
  );
  const checkDirty = useCallback((obj: { value?: unknown } | null | undefined) => {
    setFilled(isFilled(obj));
  }, []);

  useLayoutEffect(() => {
    if (isControlled) checkDirty({ value: htmlValue });
  }, [htmlValue, checkDirty, isControlled]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: MUI InputBase reads the DOM value once on mount (autofill/uncontrolled).
  useEffect(() => {
    checkDirty(nodeRef.current);
  }, []);

  useLayoutEffect(() => {
    if (!autoFocus) return;
    const input = nodeRef.current;
    if (!input) return;
    const doc = input.ownerDocument;
    const active = doc.activeElement;
    if (input === active) setFocused(true);
    else if (active == null || active === doc.body || active === doc.documentElement) input.focus();
  }, [autoFocus]);

  const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => {
    ibOnFocus?.(event);
    htmlInput.onFocus?.(event);
    setFocused(true);
  };
  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    ibOnBlur?.(event);
    htmlInput.onBlur?.(event);
    setFocused(false);
  };
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>, ...args: unknown[]) => {
    if (!isControlled) checkDirty({ value: (event.target ?? nodeRef.current)?.value });
    htmlInput.onChange?.(event, ...args);
    ibOnChange?.(event, ...args);
  };
  const handleAutoFill = (event: React.AnimationEvent<HTMLInputElement>) => {
    htmlInput.onAnimationStart?.(event);
    checkDirty(event.animationName === MUI_AUTO_FILL_CANCEL ? nodeRef.current : { value: 'x' });
  };
  const handleRootClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (nodeRef.current && event.currentTarget === event.target) nodeRef.current.focus();
    inputRootOnClick?.(event);
  };

  const {
    ref: _htmlRef,
    className: htmlClassName,
    onFocus: _f,
    onBlur: _b,
    onChange: _c,
    onAnimationStart: _a,
    value: _v,
    ...htmlRest
  } = htmlInput;
  const controlProps = {
    'aria-invalid': ibError,
    'aria-describedby': ib('aria-describedby', helperId),
    autoComplete: ib('autoComplete', autoComplete),
    autoFocus: ib('autoFocus', autoFocus),
    defaultValue: ibDefaultValue,
    disabled: ibDisabled,
    id: ib('id', id),
    onAnimationStart: handleAutoFill,
    name: ib('name', name),
    placeholder: ib('placeholder', placeholder),
    readOnly,
    required: ibRequired,
    rows: ib('rows', rows),
    value: htmlValue,
    onKeyDown: ibOnKeyDown,
    onKeyUp: ibOnKeyUp,
    type: ibMultiline ? undefined : ibType,
    ...htmlRest,
    'data-slot': 'text-field-control',
    'data-vg-core': '',
    className: cx(
      'MuiInputBase-input',
      'MuiOutlinedInput-input',
      ibDisabled ? 'Mui-disabled' : '',
      ibType === 'search' ? 'MuiInputBase-inputTypeSearch' : '',
      htmlClassName ?? '',
      readOnly ? 'MuiInputBase-readOnly' : '',
    ),
    onBlur: handleBlur,
    onChange: handleChange,
    onFocus: handleFocus,
  };

  const ibRows = ib('rows', rows);
  const control = ibMultiline ? (
    <TextareaAutosize
      {...controlProps}
      minRows={ibRows ?? ib('minRows', minRows)}
      maxRows={ibRows ?? ib('maxRows', maxRows)}
      ref={handleRef as React.Ref<HTMLTextAreaElement>}
    />
  ) : (
    <input {...controlProps} ref={handleRef as React.Ref<HTMLInputElement>} />
  );

  // MUI InputBase root class order: root, color, disabled, error, fullWidth, focused, formControl, size, multiline,
  // adornedStart, adornedEnd, readOnly (OutlinedInput adds its root class second).
  const inputRootClasses = cx(
    'MuiInputBase-root',
    'MuiOutlinedInput-root',
    `MuiInputBase-color${ibColor.charAt(0).toUpperCase()}${ibColor.slice(1)}`,
    ibDisabled ? 'Mui-disabled' : '',
    ibError ? 'Mui-error' : '',
    ibFullWidth ? 'MuiInputBase-fullWidth' : '',
    focused ? 'Mui-focused' : '',
    'MuiInputBase-formControl',
    ibSize === 'small' ? 'MuiInputBase-sizeSmall' : '',
    ibMultiline ? 'MuiInputBase-multiline' : '',
    startAdornment ? 'MuiInputBase-adornedStart' : '',
    endAdornment ? 'MuiInputBase-adornedEnd' : '',
    readOnly ? 'MuiInputBase-readOnly' : '',
    vgType,
    inputRootClassName ?? '',
  );

  return (
    <TextFieldFrame
      id={id}
      className={className}
      sx={sx}
      style={style}
      rootProps={rootRest}
      fullWidth={fullWidth}
      label={label}
      labelId={labelId}
      labelSlotComponent={slots?.inputLabel}
      labelSlot={labelSlot}
      shrink={shrink}
      size={size}
      color={color}
      required={required}
      error={error}
      disabled={disabled}
      focused={focused}
      filled={filledState}
      vgType={vgType}
      inputRootRest={inputRootRest}
      inputRootClasses={inputRootClasses}
      inputRootHandlers={{ onClick: handleRootClick }}
      startAdornment={startAdornment}
      endAdornment={endAdornment}
      helperText={helperText}
      helperId={helperId}
      helperSlot={helperSlot}
    >
      {control}
    </TextFieldFrame>
  );
};
