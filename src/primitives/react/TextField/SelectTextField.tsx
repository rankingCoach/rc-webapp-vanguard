import { classNames } from '@helpers/classNames';
import React, { useCallback, useEffect, useId, useImperativeHandle, useRef, useState } from 'react';
import { isMouseEventInsideElement as inside } from '../../core/hit-test';
import { areEqualValues, createTypeahead, TYPEAHEAD_RESET_MS, TypeaheadOption } from '../../core/typeahead';
import { FocusSource, MenuPopup } from '../Menu/MenuPopup';
import { useVanguardTypography } from '../typography-context';
import { TextFieldFrame } from './TextFieldFrame';

/* eslint-disable @typescript-eslint/no-explicit-any */
type AnyProps = Record<string, any>;

const SELECTED_MOUSE_UP_DELAY = 400;
const UNSELECTED_MOUSE_UP_DELAY = 200;

/** Props as MUI v9 TextField receives them after Vanguard's legacy-slot mapping (MuiTextField.tsx). */
export interface SelectTextFieldProps extends AnyProps {
  id?: string;
  select: true;
  children?: React.ReactNode;
  /**
   * MUI `<FormControl fullWidth?><Select>` instead of `<TextField select>`: no `MuiTextField-root`, the input root
   * not full width (FormControl's fullWidth only), InputBase's class order. `slotProps.input` lands on the input root.
   */
  bare?: boolean;
  slots?: { inputLabel?: React.ElementType } & AnyProps;
  slotProps?: {
    input?: AnyProps;
    htmlInput?: AnyProps;
    inputLabel?: AnyProps;
    select?: AnyProps;
    formHelperText?: AnyProps;
  };
}

const isFilled = (value: unknown) => value != null && !(Array.isArray(value) && value.length === 0) && value !== '';

const isEmptyDisplay = (display: React.ReactNode) =>
  display == null || (typeof display === 'string' && !display.trim());

const textOf = (node: React.ReactNode): string => {
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  let text = '';
  React.Children.forEach(node, (child) => {
    if (typeof child === 'string' || typeof child === 'number') text += String(child);
    else if (React.isValidElement<{ children?: React.ReactNode }>(child)) text += textOf(child.props.children);
  });
  return text;
};

const openInteractionType = (event?: { type?: string; detail?: number }): FocusSource => {
  if (!event) return null;
  if (event.type === 'mousedown' || event.type === 'pointerdown' || event.type === 'touchstart') return 'pointer';
  if (event.type === 'keydown' || (event.type === 'click' && event.detail === 0)) return 'keyboard';
  return null;
};

const ArrowDropDown = (props: { className?: string }) => (
  <svg
    className={props.className}
    focusable="false"
    aria-hidden="true"
    viewBox="0 0 24 24"
    data-testid="ArrowDropDownIcon"
    data-slot="select-icon"
    data-vg-core=""
  >
    <path d="M7 10l5 5 5-5z" />
  </svg>
);

/**
 * Outlined TextField in select mode on Vanguard's own core: MUI 9.5 TextField + Select + Menu DOM, classes,
 * behaviour and timings (FormControl focus/filled state, shrinking/notched label, closed typeahead, mouse-up
 * selection, cloned-event onChange, Menu anchored bottom-centre with the anchor's width), no MUI import.
 */
export const SelectTextField = (props: SelectTextFieldProps) => {
  const {
    id: idProp,
    autoFocus,
    children,
    className,
    color = 'primary',
    defaultValue,
    disabled = false,
    error = false,
    fullWidth = false,
    helperText,
    inputRef,
    label,
    name,
    onBlur,
    onChange,
    onFocus,
    placeholder: _placeholder,
    required = false,
    select: _select,
    size = 'medium',
    slots,
    slotProps,
    type: _type,
    value: valueProp,
    variant: _variant,
    multiline: _m,
    rows: _r,
    minRows: _mr,
    maxRows: _xr,
    sx,
    style,
    focused: focusedProp,
    margin: _margin,
    bare = false,
    ...rootRest
  } = props;
  const vgType = useVanguardTypography() === 'vanguard' ? 'vg-typography-vanguard' : '';
  // MUI TextField always has an id (useId when none is given); a bare Select does not.
  const autoId = useId();
  const id = bare ? idProp : (idProp ?? autoId);
  const inputSlot = slotProps?.input ?? {};
  const htmlInput = slotProps?.htmlInput ?? {};
  // MUI SelectInput takes aria-label / aria-describedby for the display; the rest lands on the native input.
  const { 'aria-label': _nativeAriaLabel, 'aria-describedby': _nativeDescribedby, ...nativeInputRest } = htmlInput;
  const labelSlot = slotProps?.inputLabel ?? {};
  const selectSlot = slotProps?.select ?? {};
  const helperSlot = slotProps?.formHelperText ?? {};
  const {
    renderValue,
    onOpen,
    onClose,
    IconComponent = ArrowDropDown,
    MenuProps = {},
    displayEmpty = false,
    multiple = false,
    SelectDisplayProps = {},
    labelId: labelIdProp,
    open: openProp,
    defaultOpen = false,
    autoWidth = false,
    readOnly = false,
  } = selectSlot;
  const { startAdornment, endAdornment, className: inputClassName, ...inputRest } = inputSlot;

  // ---- value (useControlled semantics: controlled iff `value` was defined at mount)
  const isControlled = useRef(valueProp !== undefined).current;
  // MUI useControlled: the uncontrolled value starts at defaultValue (undefined when none is given), so the first pick
  // of an empty-value option still changes it. `multiple` needs an array.
  const [valueState, setValueState] = useState<unknown>(defaultValue ?? (multiple ? [] : undefined));
  const value = isControlled ? valueProp : valueState;

  // ---- open state
  const isOpenControlled = useRef(openProp != null).current;
  const [openState, setOpenState] = useState<boolean>(defaultOpen);
  const displayRef = useRef<HTMLDivElement | null>(null);
  const [displayNode, setDisplayNode] = useState<HTMLDivElement | null>(null);
  const paperRef = useRef<HTMLDivElement | null>(null);
  const nativeRef = useRef<HTMLInputElement | null>(null);
  const open = displayNode !== null && (isOpenControlled ? Boolean(openProp) : openState);
  const openRef = useRef(false);
  openRef.current = open;
  const [focusSource, setFocusSource] = useState<FocusSource>(null);
  const [menuMinWidth, setMenuMinWidth] = useState<number | undefined>();
  const anchorElement = (displayNode?.parentNode as HTMLElement | null) ?? null;

  // ---- form-control state
  const [focusedState, setFocused] = useState(false);
  const focused = focusedProp ?? (disabled ? false : focusedState);
  const filled = isFilled(value);
  const adornedStart = Boolean(startAdornment);
  const shrink = labelSlot.shrink ?? (focused || filled || adornedStart);
  const hasLabel = label != null && label !== '';
  const labelId = labelIdProp ?? (hasLabel ? `${id}-label` : undefined);
  const helperId = helperText != null && id ? `${id}-helper-text` : undefined;
  const nativeInputId = useId();
  const listboxId = useId();

  // ---- timers / refs
  const typeahead = useRef(createTypeahead());
  const typeaheadTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const selectedTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const unselectedTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const selection = useRef({ allowSelectedMouseUp: false, allowUnselectedMouseUp: false });
  const didPointerDownOnItem = useRef(false);
  const hasSelectedItem = useRef(false);
  const openingMouseUpCleanup = useRef<(() => void) | null>(null);

  const resetTypeahead = useCallback(() => {
    clearTimeout(typeaheadTimer.current);
    typeahead.current.reset();
  }, []);
  const resetMouseUpSelection = useCallback(() => {
    clearTimeout(selectedTimer.current);
    clearTimeout(unselectedTimer.current);
    didPointerDownOnItem.current = false;
    selection.current = { allowSelectedMouseUp: false, allowUnselectedMouseUp: false };
  }, []);
  const clearOpeningMouseUp = useCallback(() => {
    openingMouseUpCleanup.current?.();
    openingMouseUpCleanup.current = null;
  }, []);

  useEffect(() => {
    if (!open) {
      resetMouseUpSelection();
      clearOpeningMouseUp();
    } else {
      resetTypeahead();
    }
  }, [open, resetMouseUpSelection, clearOpeningMouseUp, resetTypeahead]);
  useEffect(
    () => () => {
      resetMouseUpSelection();
      clearOpeningMouseUp();
      resetTypeahead();
    },
    [resetMouseUpSelection, clearOpeningMouseUp, resetTypeahead],
  );

  useEffect(() => {
    if (!open || !anchorElement || autoWidth || typeof ResizeObserver === 'undefined') return undefined;
    const observer = new ResizeObserver(() => setMenuMinWidth(anchorElement.clientWidth));
    observer.observe(anchorElement);
    return () => observer.disconnect();
  }, [open, anchorElement, autoWidth]);

  useEffect(() => {
    if (autoFocus) displayRef.current?.focus();
  }, [autoFocus]);

  useEffect(() => {
    if (!labelId || !displayRef.current) return undefined;
    const labelEl = displayRef.current.ownerDocument.getElementById(labelId);
    if (!labelEl) return undefined;
    const handler = () => {
      if (getSelection()?.isCollapsed) displayRef.current?.focus();
    };
    labelEl.addEventListener('click', handler);
    return () => labelEl.removeEventListener('click', handler);
  }, [labelId]);

  useImperativeHandle(
    inputRef,
    () => ({ focus: () => displayRef.current?.focus(), node: nativeRef.current, value }) as unknown as HTMLInputElement,
    [value],
  );

  const update = (next: boolean, event?: React.SyntheticEvent | Event) => {
    if (!next) {
      resetMouseUpSelection();
      clearOpeningMouseUp();
    }
    if (next) {
      resetTypeahead();
      setFocusSource(openInteractionType(event as { type?: string; detail?: number }));
      onOpen?.(event);
    } else {
      setFocusSource(null);
      onClose?.(event);
    }
    if (!isOpenControlled) {
      openRef.current = next;
      setMenuMinWidth(autoWidth ? undefined : anchorElement?.clientWidth);
      setOpenState(next);
    }
  };

  const childrenArray = React.Children.toArray(children) as React.ReactElement<AnyProps>[];

  const handleValueChange = (event: React.SyntheticEvent, child: React.ReactElement<AnyProps>, newValue: unknown) => {
    if (!isControlled) setValueState(newValue);
    if (onChange) {
      const nativeEvent = (event as React.SyntheticEvent).nativeEvent ?? (event as unknown as Event);
      const Ctor = nativeEvent.constructor as new (type: string, init: Event) => Event;
      const cloned = new Ctor(nativeEvent.type, nativeEvent);
      Object.defineProperty(cloned, 'target', { writable: true, value: { value: newValue, name } });
      onChange(cloned, child);
    }
  };

  const scheduleMouseUpSelection = () => {
    resetMouseUpSelection();
    if (!hasSelectedItem.current) {
      selectedTimer.current = setTimeout(() => {
        selection.current.allowSelectedMouseUp = true;
        selection.current.allowUnselectedMouseUp = true;
      }, SELECTED_MOUSE_UP_DELAY);
    } else {
      unselectedTimer.current = setTimeout(() => {
        selection.current.allowUnselectedMouseUp = true;
      }, UNSELECTED_MOUSE_UP_DELAY);
      selectedTimer.current = setTimeout(() => {
        selection.current.allowSelectedMouseUp = true;
      }, SELECTED_MOUSE_UP_DELAY);
    }
  };

  const handleMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    SelectDisplayProps.onMouseDown?.(event);
    if (event.button !== 0) return;
    event.preventDefault();
    if (!displayRef.current) return;
    displayRef.current.focus();
    const doc = event.currentTarget.ownerDocument;
    scheduleMouseUpSelection();
    clearOpeningMouseUp();
    const onMouseUp = (mouseEvent: MouseEvent) => {
      openingMouseUpCleanup.current = null;
      if (!displayRef.current) return;
      if (inside(mouseEvent, displayRef.current) || inside(mouseEvent, paperRef.current)) return;
      if (!openRef.current && isOpenControlled) return;
      update(false, mouseEvent);
    };
    doc.addEventListener('mouseup', onMouseUp, { capture: true, once: true });
    openingMouseUpCleanup.current = () => doc.removeEventListener('mouseup', onMouseUp, true);
    update(true, event);
  };

  const typeaheadOptions = () => {
    const options: (TypeaheadOption & { child: React.ReactElement<AnyProps> })[] = [];
    let selectedIndex = -1;
    for (const child of childrenArray) {
      if (!React.isValidElement(child) || !Object.hasOwn(child.props, 'value') || child.props.disabled) continue;
      const lbl = textOf(child.props.children).trim().toLowerCase();
      if (lbl === '') continue;
      if (selectedIndex === -1 && areEqualValues(value, child.props.value)) selectedIndex = options.length;
      options.push({ child, label: lbl, value: child.props.value });
    }
    return { options, selectedIndex };
  };

  const handleClosedTypeahead = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const native = event.nativeEvent as KeyboardEvent;
    if (
      open ||
      multiple ||
      disabled ||
      event.defaultPrevented ||
      native.isComposing ||
      event.key.length !== 1 ||
      event.ctrlKey ||
      event.metaKey ||
      event.altKey ||
      (event.key === ' ' && !typeahead.current.active)
    ) {
      return false;
    }
    if (event.key === ' ') event.preventDefault();
    const { options, selectedIndex } = typeaheadOptions();
    if (options.length === 0) {
      if (event.key !== ' ') resetTypeahead();
      return true;
    }
    clearTimeout(typeaheadTimer.current);
    typeaheadTimer.current = setTimeout(resetTypeahead, TYPEAHEAD_RESET_MS);
    const index = typeahead.current.type(event.key, options, selectedIndex);
    if (index !== -1) {
      const matched = options[index];
      if (!areEqualValues(value, matched.value)) handleValueChange(event, matched.child, matched.value);
      return true;
    }
    if (event.key !== ' ') resetTypeahead();
    return true;
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (readOnly) return;
    const handled = handleClosedTypeahead(event);
    const isOpenKey =
      event.key === ' ' || event.key === 'ArrowUp' || event.key === 'ArrowDown' || event.key === 'Enter';
    if (!handled && isOpenKey) {
      event.preventDefault();
      update(true, event);
    }
    SelectDisplayProps.onKeyDown?.(event);
  };

  const handleDisplayFocus = (event: React.FocusEvent<HTMLDivElement>) => {
    setFocused(true);
    onFocus?.(event);
    inputRest.onFocus?.(event);
  };

  const handleDisplayBlur = (event: React.FocusEvent<HTMLDivElement>) => {
    resetTypeahead();
    if (!open) {
      setFocused(false);
      Object.defineProperty(event, 'target', { writable: true, value: { value, name } });
      onBlur?.(event);
      inputRest.onBlur?.(event);
    }
  };

  // Items: MUI clones each child with option semantics; the popup decides the roving tab stop.
  let foundMatch = false;
  let display: React.ReactNode;
  let displaySingle: React.ReactNode;
  const displayMultiple: React.ReactNode[] = [];
  let computeDisplay = false;
  if (isFilled(value) || displayEmpty) {
    if (renderValue) display = renderValue(value);
    else computeDisplay = true;
  }
  const items = childrenArray.map((child) => {
    if (!React.isValidElement(child)) return null;
    const selected = multiple
      ? (value as unknown[]).some((v) => areEqualValues(v, child.props.value))
      : areEqualValues(value, child.props.value);
    if (selected) {
      foundMatch = true;
      if (computeDisplay) {
        if (multiple) displayMultiple.push(child.props.children);
        else displaySingle = child.props.children;
      }
    }
    const onItemClick = (event: React.MouseEvent<HTMLElement>) => {
      didPointerDownOnItem.current = false;
      if (!event.currentTarget.hasAttribute('tabindex')) return;
      let newValue: unknown;
      if (multiple) {
        const list = Array.isArray(value) ? [...value] : [];
        const i = list.indexOf(child.props.value);
        if (i === -1) list.push(child.props.value);
        else list.splice(i, 1);
        newValue = list;
      } else {
        newValue = child.props.value;
      }
      child.props.onClick?.(event);
      if (value !== newValue) handleValueChange(event, child, newValue);
      if (!multiple) update(false, event);
    };
    return React.cloneElement(child, {
      'aria-selected': selected ? 'true' : 'false',
      onMouseDown: (event: React.MouseEvent) => {
        didPointerDownOnItem.current = true;
        child.props.onMouseDown?.(event);
      },
      onPointerDown: (event: React.PointerEvent) => {
        didPointerDownOnItem.current = true;
        child.props.onPointerDown?.(event);
      },
      onClick: onItemClick,
      onMouseUp: (event: React.MouseEvent<HTMLElement>) => {
        child.props.onMouseUp?.(event);
        if (didPointerDownOnItem.current) {
          didPointerDownOnItem.current = false;
          return;
        }
        const blockSelected = !selection.current.allowSelectedMouseUp && selected;
        const blockUnselected = !selection.current.allowUnselectedMouseUp && !selected;
        if (blockSelected || blockUnselected) return;
        event.currentTarget.click();
      },
      onKeyUp: (event: React.KeyboardEvent) => {
        if (event.key === ' ') event.preventDefault();
        child.props.onKeyUp?.(event);
      },
      onKeyDown: (event: React.KeyboardEvent<HTMLElement>) => {
        child.props.onKeyDown?.(event);
        if (event.key === ' ' && event.target === event.currentTarget && !event.defaultPrevented) {
          event.preventDefault();
          if (!event.repeat) event.currentTarget.click();
        }
      },
      role: 'option',
      selected,
      value: undefined,
      'data-value': child.props.value,
    });
  });
  hasSelectedItem.current = foundMatch;
  // MUI SelectInput: closed, single-select, the value no longer matches an option → the closed typeahead buffer resets
  // (the next key starts a new search instead of extending a stale prefix).
  useEffect(() => {
    if (!open && !multiple && !foundMatch) resetTypeahead();
  }, [foundMatch, multiple, open, resetTypeahead]);
  if (computeDisplay) {
    display = multiple
      ? displayMultiple.length === 0
        ? null
        : displayMultiple.flatMap((c, i) => (i < displayMultiple.length - 1 ? [c, ', '] : [c]))
      : displaySingle;
  }

  const minWidth = !autoWidth && isOpenControlled && displayNode ? anchorElement?.clientWidth : menuMinWidth;
  const tabIndex = SelectDisplayProps.tabIndex ?? (disabled ? undefined : 0);
  const {
    slotProps: menuSlotProps = {},
    sx: menuSx,
    anchorOrigin,
    transformOrigin,
    onClose: menuOnClose,
    marginThreshold,
    disableScrollLock,
    disableAutoFocusItem,
    autoFocus: menuAutoFocus,
    // Menu/Popover/Modal props with no DOM meaning here (MUI consumed them internally):
    PaperProps: _pp,
    MenuListProps: _mlp,
    TransitionComponent: _tc,
    TransitionProps: _tp,
    transitionDuration: _td,
    slots: _ms,
    keepMounted: _km,
    disablePortal: _dp,
    container: _ct,
    variant: _mv,
    anchorEl: _ae,
    anchorReference: _ar,
    anchorPosition: _ap,
    elevation: _el,
    hideBackdrop: _hb,
    open: _mo,
    ...menuRest
  } = MenuProps;
  const closeMenu = (event: React.SyntheticEvent | Event) => update(false, event);
  // Modal root slot (MUI parity): may be a function of the owner state and may replace `onClose`
  // (the legacy `disableEscapeKeyDown` alias is mapped onto it).
  const rootSlot: AnyProps =
    typeof menuSlotProps.root === 'function'
      ? menuSlotProps.root({ ...MenuProps, onClose: closeMenu, slotProps: menuSlotProps })
      : (menuSlotProps.root ?? {});
  const { slots: _rootSlots, slotProps: _rootSlotProps, onClose: rootOnClose, ...rootSlotRest } = rootSlot;
  const paperSlot = typeof menuSlotProps.paper === 'function' ? menuSlotProps.paper({}) : (menuSlotProps.paper ?? {});
  const listSlot = typeof menuSlotProps.list === 'function' ? menuSlotProps.list({}) : (menuSlotProps.list ?? {});
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
      filled={filled}
      vgType={vgType}
      inputRootRest={inputRest}
      inputRootClassName={inputClassName}
      inputRootExtraClasses="MuiSelect-root"
      textFieldRoot={!bare}
      inputRootClasses={
        bare
          ? [
              'MuiInputBase-root',
              'MuiOutlinedInput-root',
              `MuiInputBase-color${color.charAt(0).toUpperCase()}${color.slice(1)}`,
              disabled ? 'Mui-disabled' : '',
              error ? 'Mui-error' : '',
              focused ? 'Mui-focused' : '',
              'MuiInputBase-formControl',
              size === 'small' ? 'MuiInputBase-sizeSmall' : '',
              startAdornment ? 'MuiInputBase-adornedStart' : '',
              endAdornment ? 'MuiInputBase-adornedEnd' : '',
              'MuiSelect-root',
              vgType,
              inputClassName ?? '',
            ]
              .filter(Boolean)
              .join(' ')
          : undefined
      }
      startAdornment={startAdornment}
      endAdornment={endAdornment}
      helperText={helperText}
      helperId={helperId}
      helperSlot={helperSlot}
      after={
        <MenuPopup
          id={`menu-${name || ''}`}
          anchorEl={anchorElement}
          open={open}
          onClose={rootOnClose ?? menuOnClose ?? closeMenu}
          marginThreshold={marginThreshold}
          disableScrollLock={disableScrollLock}
          // MUI Select spreads MenuProps into Menu: `autoFocus: false` turns off the menu's own initial focus too
          // (no list focus), so a child that autofocuses (SearchableSelect's search field) keeps it.
          autoFocus={menuAutoFocus ?? true}
          autoFocusItem={(menuAutoFocus ?? true) && !disableAutoFocusItem}
          anchorOrigin={anchorOrigin ?? { vertical: 'bottom', horizontal: 'center' }}
          transformOrigin={transformOrigin ?? { vertical: 'top', horizontal: 'center' }}
          focusSource={focusSource}
          disableListWrap
          rootProps={{
            ...menuRest,
            ...rootSlotRest,
            style: {
              ...(menuSx && typeof menuSx === 'object' ? menuSx : {}),
              ...menuRest.style,
              ...rootSlotRest.style,
            },
          }}
          paperProps={{
            ...paperSlot,
            ref: (node: HTMLDivElement | null) => {
              paperRef.current = node;
            },
            style: { minWidth, ...paperSlot.style },
          }}
          listProps={{
            'aria-labelledby': labelId,
            role: 'listbox',
            'aria-multiselectable': multiple ? 'true' : undefined,
            id: listboxId,
            ...listSlot,
          }}
        >
          {items}
        </MenuPopup>
      }
    >
      <div
        tabIndex={tabIndex}
        role="combobox"
        aria-controls={open ? listboxId : undefined}
        aria-disabled={disabled ? 'true' : undefined}
        aria-expanded={open ? 'true' : 'false'}
        aria-haspopup="listbox"
        aria-readonly={readOnly ? 'true' : undefined}
        aria-label={htmlInput['aria-label']}
        // MUI 9.5 SelectInput: the label id only (v5 joined the button id).
        aria-labelledby={labelId}
        aria-describedby={helperId}
        aria-required={required ? 'true' : undefined}
        aria-invalid={error ? 'true' : undefined}
        onKeyDown={handleKeyDown}
        onMouseDown={disabled || readOnly ? undefined : handleMouseDown}
        onBlur={handleDisplayBlur}
        onFocus={handleDisplayFocus}
        data-slot="select-trigger"
        data-vg-core=""
        data-open={open ? '' : undefined}
        data-disabled={disabled ? '' : undefined}
        // MUI SelectInput buttonId: SelectDisplayProps.id (TextField / Select put `id` there), else the name fallback.
        // Placed before the SelectDisplayProps spread, where MUI's `{ id, ...SelectDisplayProps }` puts the key.
        id={SelectDisplayProps.id ?? id ?? (name ? `mui-component-select-${name}` : undefined)}
        {...SelectDisplayProps}
        ref={(node: HTMLDivElement | null) => {
          displayRef.current = node;
          if (node) setDisplayNode(node);
        }}
        // MUI: clsx(SelectDisplayProps.className, classes.select, className).
        className={[
          SelectDisplayProps.className,
          'MuiSelect-select',
          'MuiSelect-outlined',
          'MuiInputBase-input',
          'MuiOutlinedInput-input',
          disabled ? 'Mui-disabled' : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {isEmptyDisplay(display) ? (
          <span className="notranslate" aria-hidden="true">
            {'​'}
          </span>
        ) : (
          display
        )}
      </div>
      <input
        aria-invalid={error}
        value={Array.isArray(value) ? value.join(',') : (value as string | number)}
        name={name}
        ref={nativeRef}
        aria-hidden
        onChange={(event) => {
          const child = childrenArray.find((c) => c.props.value === event.target.value);
          if (child === undefined) return;
          if (!isControlled) setValueState(child.props.value);
          onChange?.(event, child);
        }}
        tabIndex={-1}
        disabled={disabled}
        readOnly={readOnly}
        className={classNames('MuiSelect-nativeInput')}
        autoFocus={autoFocus}
        required={required}
        data-slot="select-native-input"
        data-vg-core=""
        {...nativeInputRest}
        id={htmlInput.id ?? nativeInputId}
      />
      <IconComponent
        className={[
          IconComponent === ArrowDropDown ? 'MuiSvgIcon-root MuiSvgIcon-fontSizeMedium' : '',
          'MuiSelect-icon',
          open ? 'MuiSelect-iconOpen' : '',
          disabled ? 'Mui-disabled' : '',
        ]
          .filter(Boolean)
          .join(' ')}
      />
    </TextFieldFrame>
  );
};
