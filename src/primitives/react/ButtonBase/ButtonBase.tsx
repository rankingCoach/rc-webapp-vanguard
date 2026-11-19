// Ported from @mui/material@9.5.0 ButtonBase/ButtonBase.js (MIT)
import './ButtonBase.scss';

import { classNames } from '@helpers/classNames';
import React, { useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { hasNativeActivation, isFocusVisible, pressAttrs, pressKeyDown, pressKeyUp } from '../../core/press';
import { TouchRippleActions, TouchRippleProps, useRipple } from './use-ripple';

export type { TouchRippleActions, TouchRippleProps } from './use-ripple';

export interface ButtonBaseActions {
  focusVisible: () => void;
}

/**
 * Vanguard's own ButtonBase: press behavior from the core plus the ripple, on any host element. Same props as the
 * MUI ButtonBase it replaces; keeps the legacy `MuiButtonBase-root` / `Mui-disabled` / `Mui-focusVisible` classes.
 * Unstyled except for the ripple: each skin includes the `button-base-reset` mixin in its own root rule.
 */
export type ButtonBaseProps = Omit<React.HTMLAttributes<HTMLElement>, 'color'> & {
  action?: React.Ref<ButtonBaseActions>;
  centerRipple?: boolean;
  classes?: Partial<Record<'root' | 'disabled' | 'focusVisible', string>>;
  component?: React.ElementType;
  disabled?: boolean;
  disableRipple?: boolean;
  disableTouchRipple?: boolean;
  focusRipple?: boolean;
  focusVisibleClassName?: string;
  href?: string;
  LinkComponent?: React.ElementType;
  nativeButton?: boolean;
  onFocusVisible?: React.FocusEventHandler;
  TouchRippleProps?: Partial<TouchRippleProps>;
  touchRippleRef?: React.Ref<TouchRippleActions>;
  type?: string;
  value?: unknown;
  ref?: React.Ref<HTMLElement>;
  [dataAttr: `data-${string}`]: unknown;
};

export const ButtonBase = (props: ButtonBaseProps) => {
  const {
    action,
    centerRipple = false,
    classes,
    component = 'button',
    LinkComponent = 'a',
    disabled = false,
    disableRipple = false,
    disableTouchRipple = false,
    focusRipple = false,
    focusVisibleClassName,
    nativeButton: nativeButtonProp,
    onFocusVisible,
    TouchRippleProps: touchRippleProps,
    touchRippleRef,
    tabIndex = 0,
    type,
    className,
    children,
    ref,
    onClick,
    onKeyDown,
    onKeyUp,
    onFocus,
    onBlur,
    onMouseDown,
    onMouseUp,
    onMouseLeave,
    onContextMenu,
    onDragLeave,
    onTouchStart,
    onTouchEnd,
    onTouchMove,
    ...other
  } = props;
  const hostRef = useRef<HTMLElement | null>(null);
  const [focusVisible, setFocusVisible] = useState(false);
  if (disabled && focusVisible) setFocusVisible(false);

  const isLink = Boolean(other.href || (other as { to?: unknown }).to);
  const Host: React.ElementType = component === 'button' && isLink ? LinkComponent : component;
  const native = nativeButtonProp ?? (typeof Host === 'string' && Host === 'button');
  const ripple = useRipple({ center: centerRipple, touchRippleRef, TouchRippleProps: touchRippleProps });
  const { pulsate } = ripple;

  useImperativeHandle(action, () => ({
    focusVisible: () => {
      setFocusVisible(true);
      hostRef.current?.focus();
    },
  }));

  useEffect(() => {
    if (focusVisible && focusRipple && !disableRipple) pulsate();
  }, [focusVisible, focusRipple, disableRipple, pulsate]);

  // Stable across renders: a consumer callback ref fires only on mount/unmount or when `ref` itself changes.
  const handleRef = useCallback(
    (node: HTMLElement | null) => {
      hostRef.current = node;
      if (typeof ref === 'function') return ref(node);
      if (ref) (ref as React.RefObject<HTMLElement | null>).current = node;
    },
    [ref],
  );

  const touch =
    <E extends React.SyntheticEvent>(kind: 'start' | 'stop', handler?: (e: E) => void) =>
    (e: E) => {
      handler?.(e);
      if (disableTouchRipple || disableRipple) return;
      if (kind === 'start') ripple.start(e);
      else ripple.stop(e);
    };

  const nativeActivation = () => hasNativeActivation(hostRef.current, native);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    if (disabled) return;
    if (focusRipple && !event.repeat && focusVisible && event.key === ' ') {
      ripple.stop(event, () => ripple.start(event));
    }
    onKeyDown?.(event);
    pressKeyDown(event, nativeActivation());
  };

  const handleKeyUp = (event: React.KeyboardEvent<HTMLElement>) => {
    if (disabled) return;
    if (focusRipple && event.key === ' ' && focusVisible && !event.defaultPrevented) {
      ripple.stop(event, () => ripple.pulsate(event));
    }
    onKeyUp?.(event);
    pressKeyUp(event, nativeActivation());
  };

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    if (disabled) {
      event.preventDefault();
      return;
    }
    onClick?.(event);
  };

  const handleFocus = (event: React.FocusEvent<HTMLElement>) => {
    if (isFocusVisible(event.target)) {
      setFocusVisible(true);
      onFocusVisible?.(event);
    }
    onFocus?.(event);
  };

  const handleBlur = (event: React.FocusEvent<HTMLElement>) => {
    ripple.stop(event);
    if (!isFocusVisible(event.target)) setFocusVisible(false);
    onBlur?.(event);
  };

  const handleMouseLeave = (event: React.MouseEvent<HTMLElement>) => {
    if (focusVisible) event.preventDefault();
    onMouseLeave?.(event);
    if (!disableTouchRipple && !disableRipple) ripple.stop(event);
  };

  const hostAttrs = isLink
    ? { tabIndex: disabled ? -1 : tabIndex, ...(disabled ? { 'aria-disabled': true } : {}), type }
    : pressAttrs({
        native,
        disabled,
        tabIndex,
        type,
        hasFormAction: Boolean((other as { formAction?: unknown }).formAction),
      });

  return (
    <Host
      className={classNames(
        'MuiButtonBase-root',
        classes?.root ?? '',
        disabled ? classNames('Mui-disabled', classes?.disabled ?? '') : '',
        focusVisible ? classNames('Mui-focusVisible', classes?.focusVisible ?? '', focusVisibleClassName ?? '') : '',
        className,
      )}
      ref={handleRef}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onMouseDown={touch('start', onMouseDown)}
      onMouseUp={touch('stop', onMouseUp)}
      onMouseLeave={handleMouseLeave}
      onContextMenu={touch('stop', onContextMenu)}
      onDragLeave={touch('stop', onDragLeave)}
      onTouchStart={touch('start', onTouchStart)}
      onTouchEnd={touch('stop', onTouchEnd)}
      onTouchMove={touch('stop', onTouchMove)}
      {...hostAttrs}
      {...other}
    >
      {children}
      {ripple.mounted && !disableRipple && !disabled ? ripple.element : null}
    </Host>
  );
};
