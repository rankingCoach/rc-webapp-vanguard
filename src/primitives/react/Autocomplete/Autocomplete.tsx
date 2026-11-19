'use client';

// Ported from @mui/material@9.5.0 Autocomplete/Autocomplete.js (MIT)
import * as React from 'react';
import { ButtonBase } from '../ButtonBase/ButtonBase';
import { cx } from '../class-names';
import { OwnPopper } from '../Popper/Popper';
import { useVanguardTypography } from '../typography-context';
import { zIndexClass } from '../z-index-class';
import { type UseAutocompleteProps, useAutocomplete } from './useAutocomplete';

type AnyProps = Record<string, any>;
type SlotProps = AnyProps | ((ownerState: AnyProps) => AnyProps);

export interface AutocompleteRenderInputParams {
  id: string;
  disabled: boolean;
  fullWidth: boolean;
  size: 'small' | undefined;
  slotProps: { inputLabel: AnyProps; input: AnyProps; htmlInput: AnyProps };
}

export interface OwnAutocompleteProps extends UseAutocompleteProps<any, boolean, boolean, boolean> {
  ref?: React.Ref<any>;
  onInputChange?: (
    event: React.SyntheticEvent | null,
    value: string,
    reason: 'input' | 'reset' | 'clear' | 'blur' | 'selectOption' | 'removeOption',
  ) => void;
  renderInput: (params: AutocompleteRenderInputParams) => React.ReactNode;
  renderValue?: (
    value: any,
    getItemProps: (params?: { index?: number }) => AnyProps,
    ownerState: AnyProps,
  ) => React.ReactNode;
  renderOption?: (props: AnyProps, option: any, state: AnyProps, ownerState: AnyProps) => React.ReactNode;
  renderGroup?: (params: { key: number; group: string; children: React.ReactNode }) => React.ReactNode;
  slots?: Record<string, React.ElementType>;
  slotProps?: Record<string, SlotProps>;
}

const capitalize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);
const useEnhancedEffect = typeof window === 'undefined' ? React.useEffect : React.useLayoutEffect;
const paperShadow =
  '0px 2px 1px -1px rgba(0,0,0,0.2),0px 1px 1px 0px rgba(0,0,0,0.14),0px 1px 3px 0px rgba(0,0,0,0.12)';

// MUI useSlot's merge order, including refs and hook-owned event composition.
// Styling-only objects never reach native DOM slots.
function useSlot(
  name: string,
  fallback: React.ElementType,
  ownerState: AnyProps,
  className: string,
  additional: AnyProps = {},
  getProps?: (handlers: AnyProps) => AnyProps,
  forwarded: AnyProps = {},
  ref?: React.Ref<any>,
): [React.ElementType, AnyProps] {
  const external = ownerState.slotProps?.[name];
  const resolved = (typeof external === 'function' ? external(ownerState) : external) ?? {};
  const { component, sx, ...slot } = resolved;
  const handlers: AnyProps = {};
  const other: AnyProps = {};
  for (const [key, value] of Object.entries({ ...forwarded, ...slot })) {
    if (/^on[A-Z]/.test(key) && typeof value === 'function') handlers[key] = value;
    else other[key] = value;
  }
  const internal = getProps?.(handlers) ?? {};
  const internalRef = internal.ref;
  const externalRef = resolved.ref;
  const mergedRef = React.useMemo(() => {
    if (!internalRef && !externalRef && !ref) return undefined;
    // MUI useForkRef (React 19): each callback ref's returned cleanup runs on detach instead of a call with null.
    return (node: any) => {
      const cleanups = [internalRef, externalRef, ref].map((target) => {
        if (typeof target === 'function') {
          const cleanup = target(node);
          return typeof cleanup === 'function' ? cleanup : () => target(null);
        }
        if (target) {
          target.current = node;
          return () => {
            target.current = null;
          };
        }
        return () => undefined;
      });
      return () => {
        for (const cleanup of cleanups) cleanup();
      };
    };
  }, [internalRef, externalRef, ref]);
  const props = getProps ? { ...internal, ...additional, ...other } : { ...additional, ...forwarded, ...slot };
  // MUI `sx={{ zIndex }}` is an emotion class (runtime rule), not an inline style: zIndexClass mirrors that.
  props.className = cx(
    internal.className,
    additional.className,
    className,
    forwarded.className,
    slot.className,
    zIndexClass(sx?.zIndex),
  );
  if (internal.style || additional.style || forwarded.style || slot.style) {
    props.style = {
      ...internal.style,
      ...additional.style,
      ...forwarded.style,
      ...slot.style,
    };
  }
  props.ref = mergedRef;
  props['data-vg-core'] = '';
  const Slot = ownerState.slots?.[name] ?? fallback;
  if (component) {
    if (typeof Slot === 'string') return [component, props];
    props.component = component;
  }
  if (ownerState.slots?.[name] && typeof Slot !== 'string') props.ownerState = ownerState;
  return [Slot, props];
}

function Paper({ component: Component = 'div', className, style, ownerState: _ownerState, ...props }: AnyProps) {
  return (
    <Component
      {...props}
      data-vg-core=""
      className={cx('MuiPaper-root MuiPaper-elevation MuiPaper-rounded MuiPaper-elevation1', className)}
      style={{ '--Paper-shadow': paperShadow, ...style }}
    />
  );
}

function SvgIcon({ path, name, fontSize = 'medium', className, ...props }: AnyProps) {
  return (
    <svg
      className={cx('MuiSvgIcon-root', `MuiSvgIcon-fontSize${capitalize(fontSize)}`, className)}
      focusable="false"
      aria-hidden="true"
      viewBox="0 0 24 24"
      data-testid={`${name}Icon`}
      {...props}
      data-vg-core=""
    >
      <path d={path} data-vg-core="" />
    </svg>
  );
}

function Indicator({ className, disabled, size = 'medium', ownerState: _ownerState, ...props }: AnyProps) {
  return (
    <ButtonBase
      {...props}
      data-vg-core=""
      disabled={disabled}
      centerRipple
      focusRipple
      className={cx(
        'MuiIconButton-root',
        disabled && 'Mui-disabled',
        `MuiIconButton-size${capitalize(size)}`,
        className,
      )}
    />
  );
}

// Default MUI tags; Vanguard normally supplies renderValue instead. Deletion
// happens on keyup, and delete-icon clicks must not bubble to the chip/root.
function DefaultChip({
  label,
  size = 'medium',
  disabled = false,
  className,
  onDelete,
  onKeyDown,
  onKeyUp,
  component = 'div',
  ownerState: _ownerState,
  ...props
}: AnyProps) {
  const remove = (event: React.SyntheticEvent) => {
    event.stopPropagation();
    onDelete?.(event);
  };
  const classes = cx(
    'MuiChip-root MuiChip-filled',
    disabled && 'Mui-disabled',
    `MuiChip-size${capitalize(size)}`,
    'MuiChip-colorDefault',
    onDelete && 'MuiChip-deletable',
    className,
  );
  const content = (
    <>
      <span className="MuiChip-label" data-vg-core="">
        {label}
      </span>
      {onDelete && (
        <SvgIcon
          name="Cancel"
          className="MuiChip-deleteIcon"
          onClick={remove}
          path="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"
        />
      )}
    </>
  );
  const handlers = {
    onKeyDown: (event: React.KeyboardEvent) => {
      if (event.currentTarget === event.target && ['Backspace', 'Delete'].includes(event.key)) event.preventDefault();
      onKeyDown?.(event);
    },
    onKeyUp: (event: React.KeyboardEvent) => {
      if (event.currentTarget === event.target && ['Backspace', 'Delete'].includes(event.key)) onDelete?.(event);
      onKeyUp?.(event);
    },
  };
  if (onDelete)
    return (
      <ButtonBase
        {...props}
        {...handlers}
        component={component}
        nativeButton={false}
        disableRipple
        className={classes}
        data-vg-core=""
      >
        {content}
      </ButtonBase>
    );
  const Component = component;
  return (
    <Component {...props} {...handlers} className={classes} data-vg-core="">
      {content}
    </Component>
  );
}

/** MUI 9.5's render contract on the own hook, Popper and DOM-backed slots. */
export function OwnAutocomplete(props: OwnAutocompleteProps) {
  const {
    ref,
    autoComplete = false,
    autoHighlight = false,
    autoSelect = false,
    blurOnSelect = false,
    className,
    classes: classesProp = {},
    clearIcon = (
      <SvgIcon
        name="Close"
        fontSize="small"
        path="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
      />
    ),
    clearOnBlur = !props.freeSolo,
    clearOnEscape = false,
    clearText = 'Clear',
    closeText = 'Close',
    defaultValue = props.multiple ? [] : null,
    disableClearable = false,
    disableCloseOnSelect = false,
    disabled = false,
    disabledItemsFocusable = false,
    disableListWrap = false,
    disablePortal = false,
    filterOptions,
    filterSelectedOptions = false,
    forcePopupIcon = 'auto',
    freeSolo = false,
    fullWidth = false,
    getLimitTagsText = (more: number) => `+${more}`,
    getOptionDisabled,
    getOptionKey,
    getOptionLabel: getOptionLabelProp,
    getOptionValue,
    isOptionEqualToValue,
    groupBy,
    handleHomeEndKeys = !props.freeSolo,
    id: idProp,
    includeInputInList = false,
    inputValue: inputValueProp,
    limitTags = -1,
    loading = false,
    loadingText = 'Loading…',
    multiple = false,
    noOptionsText = 'No options',
    onChange,
    onClose,
    onHighlightChange,
    onInputChange,
    onOpen,
    open,
    openOnFocus = false,
    openText = 'Open',
    options,
    popupIcon = <SvgIcon name="ArrowDropDown" path="M7 10l5 5 5-5z" />,
    readOnly = false,
    renderGroup: renderGroupProp,
    renderInput,
    renderOption: renderOptionProp,
    renderValue,
    resetHighlightOnMouseLeave = false,
    selectOnFocus = !props.freeSolo,
    size = 'medium',
    slots = {},
    slotProps = {},
    value: valueProp,
    component,
    sx: _sx,
    ...other
  } = props;
  const {
    getRootProps,
    getInputProps,
    getInputLabelProps,
    getPopupIndicatorProps,
    getClearProps,
    getItemProps,
    getListboxProps,
    getOptionFromValue,
    getOptionProps,
    value,
    dirty,
    expanded,
    id,
    popupOpen,
    focused,
    focusedItem,
    anchorEl,
    setAnchorEl,
    inputValue,
    groupedOptions,
  } = useAutocomplete({ ...props, componentName: 'Autocomplete' });

  const [, forceRender] = React.useReducer((n: number) => n + 1, 0);
  React.useEffect(() => {
    if (!popupOpen || !anchorEl || typeof ResizeObserver === 'undefined') return;
    let lastWidth = anchorEl.clientWidth;
    const observer = new ResizeObserver(() => {
      if (lastWidth !== anchorEl.clientWidth) {
        lastWidth = anchorEl.clientWidth;
        forceRender();
      }
    });
    observer.observe(anchorEl);
    return () => observer.disconnect();
  }, [popupOpen, anchorEl]);

  const isGrouped = Boolean(groupBy);
  const previousOptions = React.useRef<{ options: any[]; isGrouped: boolean }>({ options: [], isGrouped: false });
  const previousOpen = React.useRef(false);
  const rendered = popupOpen ? { options: groupedOptions as any[], isGrouped } : previousOptions.current;
  useEnhancedEffect(() => {
    if (popupOpen && !previousOpen.current) previousOptions.current = { options: [], isGrouped };
    previousOpen.current = popupOpen;
    if (popupOpen && groupedOptions.length > 0)
      previousOptions.current = { options: groupedOptions as any[], isGrouped };
  }, [popupOpen, groupedOptions, isGrouped]);

  const hasClearIcon = !disableClearable && !disabled && dirty && !readOnly;
  const hasPopupIcon = (!freeSolo || forcePopupIcon === true) && forcePopupIcon !== false;
  const getOptionLabel = getOptionLabelProp ?? ((option: any) => option.label ?? option);
  const ownerState = {
    ...props,
    slots,
    slotProps,
    disablePortal,
    expanded,
    focused,
    fullWidth,
    getOptionLabel,
    hasClearIcon,
    hasPopupIcon,
    inputFocused: focusedItem === -1,
    popupOpen,
    size,
  };
  const utility = (...names: any[]) =>
    names
      .filter(Boolean)
      .map((name: string) =>
        cx(
          ['focused', 'expanded', 'focusVisible'].includes(name) ? `Mui-${name}` : `MuiAutocomplete-${name}`,
          classesProp[name],
        ),
      )
      .join(' ');
  const tagClass = utility('tag', `tagSize${capitalize(size)}`);
  // VanguardThemeProvider typography (pxToRem × 16/14) for the theme-dependent compat rules.
  const vgType = useVanguardTypography() === 'vanguard' ? 'vg-typography-vanguard' : '';
  const [Root, rootProps] = useSlot(
    'root',
    component ?? 'div',
    ownerState,
    cx(
      utility(
        'root',
        expanded && 'expanded',
        focused && 'focused',
        fullWidth && 'fullWidth',
        hasClearIcon && 'hasClearIcon',
        hasPopupIcon && 'hasPopupIcon',
      ),
      className,
    ),
    // MUI has no class for `multiple`; the compat rule for its flex-wrap variant keys on this own-core marker.
    { 'data-multiple': multiple ? '' : undefined },
    getRootProps,
    other,
    ref,
  );
  const [Listbox, listboxProps] = useSlot('listbox', 'ul', ownerState, utility('listbox'), {}, getListboxProps);
  const [PaperSlot, paperProps] = useSlot('paper', Paper, ownerState, cx(utility('paper'), vgType));
  const [Status, statusProps] = useSlot('status', 'div', ownerState, utility('status'), {
    role: 'status',
    'aria-live': 'polite',
    'aria-atomic': 'true',
  });
  const [Popper, popperProps] = useSlot(
    'popper',
    OwnPopper,
    ownerState,
    utility('popper', disablePortal && 'popperDisablePortal'),
    {
      disablePortal,
      style: { width: anchorEl ? anchorEl.clientWidth : null, pointerEvents: popupOpen ? undefined : 'none' },
      role: 'presentation',
      anchorEl,
      open: popupOpen,
    },
  );
  const [ClearIndicator, clearProps] = useSlot(
    'clearIndicator',
    Indicator,
    ownerState,
    cx(utility('clearIndicator'), vgType),
    {
      ...getClearProps(),
      'aria-label': clearText,
      title: clearText,
    },
  );
  const [PopupIndicator, popupProps] = useSlot(
    'popupIndicator',
    Indicator,
    ownerState,
    cx(utility('popupIndicator', popupOpen && 'popupIndicatorOpen'), vgType),
    {
      ...getPopupIndicatorProps(),
      disabled,
      'aria-label': popupOpen ? closeText : openText,
      title: popupOpen ? closeText : openText,
    },
  );
  const [Chip, chipProps] = useSlot('chip', DefaultChip, ownerState, tagClass);
  const getCustomizedItemProps = (params: { index?: number } = {}) => ({
    className: tagClass,
    disabled,
    ...getItemProps(params),
  });
  let startAdornment: React.ReactNode;
  if (multiple && value.length > 0) {
    startAdornment = renderValue
      ? renderValue(value, getCustomizedItemProps, ownerState)
      : value.map((item: any, index: number) => {
          const { key, ...itemProps } = getCustomizedItemProps({ index }) as AnyProps;
          const resolved = getOptionFromValue(item);
          return (
            <Chip
              key={key}
              label={resolved === null ? '' : getOptionLabel(resolved.option)}
              size={size}
              {...itemProps}
              {...chipProps}
            />
          );
        });
  } else if (!multiple && renderValue && value != null)
    startAdornment = renderValue(value, getCustomizedItemProps, ownerState);
  if (limitTags > -1 && Array.isArray(startAdornment)) {
    const more = startAdornment.length - limitTags;
    if (!focused && more > 0) {
      startAdornment = startAdornment.slice(0, limitTags);
      (startAdornment as React.ReactNode[]).push(
        <span className={tagClass} key={limitTags} data-vg-core="">
          {getLimitTagsText(more)}
        </span>,
      );
    }
  }
  const renderOption =
    renderOptionProp ??
    (({ key, ...optionProps }: AnyProps, option: any) => (
      <li key={key} {...optionProps} data-vg-core="">
        {getOptionLabel(option)}
      </li>
    ));
  const renderListOption = (option: any, index: number) => {
    const optionProps = getOptionProps({ option, index });
    return renderOption(
      { ...optionProps, className: utility('option'), 'data-vg-core': '' },
      option,
      { selected: optionProps['aria-selected'], index, inputValue },
      ownerState,
    );
  };
  const renderGroup =
    renderGroupProp ??
    ((params: { key: number; group: string; children: React.ReactNode }) => (
      <li key={params.key} data-vg-core="">
        <div
          className={cx(
            'MuiListSubheader-root MuiListSubheader-gutters MuiListSubheader-sticky',
            cx(utility('groupLabel'), vgType),
          )}
          data-vg-core=""
        >
          {params.group}
        </div>
        <ul className={utility('groupUl')} data-vg-core="">
          {params.children}
        </ul>
      </li>
    ));
  const hasPopupContent = rendered.options.length > 0 || loading || !freeSolo || popperProps.keepMounted === true;
  const input = {
    ref: setAnchorEl,
    className: utility('inputRoot'),
    startAdornment,
    onMouseDown: (event: React.MouseEvent) => {
      if (event.target === event.currentTarget) getInputProps().onMouseDown(event);
    },
    ...((hasClearIcon || hasPopupIcon) && {
      endAdornment: (
        <div className={utility('endAdornment')} data-vg-core="">
          {hasClearIcon ? <ClearIndicator {...clearProps}>{clearIcon}</ClearIndicator> : null}
          {hasPopupIcon ? <PopupIndicator {...popupProps}>{popupIcon}</PopupIndicator> : null}
        </div>
      ),
    }),
  };
  return (
    <>
      <Root {...rootProps}>
        {renderInput({
          id,
          disabled,
          fullWidth: props.fullWidth ?? true,
          size: size === 'small' ? 'small' : undefined,
          slotProps: {
            inputLabel: getInputLabelProps(),
            input,
            htmlInput: {
              className: utility('input', focusedItem === -1 && 'inputFocused'),
              disabled,
              readOnly,
              ...getInputProps(),
            },
          },
        })}
      </Root>
      {anchorEl && hasPopupContent ? (
        <Popper {...popperProps}>
          <PaperSlot {...paperProps}>
            <Status {...statusProps}>
              {loading && rendered.options.length === 0 ? (
                <div className={utility('loading')} data-vg-core="">
                  {loadingText}
                </div>
              ) : null}
              {rendered.options.length === 0 && !freeSolo && !loading ? (
                <div className={utility('noOptions')} onMouseDown={(event) => event.preventDefault()} data-vg-core="">
                  {noOptionsText}
                </div>
              ) : null}
            </Status>
            {rendered.options.length > 0 ? (
              <Listbox {...listboxProps}>
                {rendered.options.map((option: any, index: number) =>
                  rendered.isGrouped
                    ? renderGroup({
                        key: option.key,
                        group: option.group,
                        children: option.options.map((item: any, offset: number) =>
                          renderListOption(item, option.index + offset),
                        ),
                      })
                    : renderListOption(option, index),
                )}
              </Listbox>
            ) : null}
          </PaperSlot>
        </Popper>
      ) : null}
    </>
  );
}

export default OwnAutocomplete;
