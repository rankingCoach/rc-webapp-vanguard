import { classNames } from '@helpers/classNames';
import React, { useEffect, useLayoutEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { defaultLayerStack } from '../../core/layer-stack';
import { defaultModalManager, ManagedModal } from '../../core/modal-manager';

export type ModalCloseReason = 'escapeKeyDown' | 'backdropClick' | 'tabKeyDown';

export interface ModalHostProps {
  open: boolean;
  /** Keep the portal mounted while an exit transition runs (the child calls `onExited`). */
  exiting?: boolean;
  onClose?: (event: React.SyntheticEvent | Event, reason: ModalCloseReason) => void;
  className?: string;
  style?: React.CSSProperties;
  id?: string;
  disableScrollLock?: boolean;
  disableRestoreFocus?: boolean;
  disableAutoFocus?: boolean;
  disableEscapeKeyDown?: boolean;
  /** MUI `disableEnforceFocus`: do not pull focus back into the modal when it leaves. */
  disableEnforceFocus?: boolean;
  backdropClassName?: string;
  backdropStyle?: React.CSSProperties;
  children: React.ReactNode;
  [dataAttr: `data-${string}`]: unknown;
}

const focusableSelector =
  'a[href],area[href],input:not([disabled]):not([type="hidden"]),select:not([disabled]),textarea:not([disabled]),button:not([disabled]),[tabindex]:not([tabindex="-1"])';

/**
 * Modal host (MUI Modal parity, without MUI): portal into document.body with the legacy `MuiModal-root` DOM,
 * an invisible backdrop, focus-trap sentinels, Escape / backdrop-click close, aria-hiding of siblings and scroll lock
 * via the core ModalManager, and focus restored to the previously focused element on close.
 */
export const ModalHost = (props: ModalHostProps) => {
  const {
    open,
    exiting = false,
    onClose,
    className,
    style,
    id,
    disableScrollLock = false,
    disableRestoreFocus = false,
    disableAutoFocus = false,
    disableEscapeKeyDown = false,
    disableEnforceFocus = false,
    backdropClassName,
    backdropStyle,
    children,
    ...rest
  } = props;
  const rootRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const modal = useRef<ManagedModal>({ modalRef: null });
  const restoreTo = useRef<HTMLElement | null>(null);
  // Record the element to restore focus to in the render that opens, before any child layout effect (e.g. a
  // MenuList auto-focusing its item) moves focus into the popup.
  const wasOpen = useRef(false);
  if (open && !wasOpen.current && typeof document !== 'undefined') {
    restoreTo.current = document.activeElement as HTMLElement | null;
  }
  wasOpen.current = open;
  const mounted = open || exiting;

  useLayoutEffect(() => {
    if (!open) return undefined;
    modal.current.modalRef = rootRef.current;
    defaultModalManager.add(modal.current, document.body);
    defaultModalManager.mount(modal.current, { disableScrollLock });
    // Layer order for click-away hosts below this modal (core/layer-stack.ts).
    const layer = defaultLayerStack.push(() => rootRef.current, restoreTo.current);
    return () => {
      defaultModalManager.remove(modal.current, false);
      defaultLayerStack.remove(layer);
    };
  }, [open, disableScrollLock]);

  // Restore focus in a passive cleanup (like MUI FocusTrap): a layout cleanup runs inside React's commit, whose
  // selection restore would immediately re-focus the element that was focused in the popup.
  useEffect(() => {
    if (!open) return undefined;
    return () => {
      if (!disableRestoreFocus && restoreTo.current?.isConnected) {
        ignoreNextEnforce.current = true;
        restoreTo.current.focus();
      }
    };
  }, [open, disableRestoreFocus]);

  // MUI FocusTrap enforcement: focus that leaves the content (focusin elsewhere, or falls to <body>) is pulled back
  // while this is the top modal; skipped once right after focus is restored on close.
  const ignoreNextEnforce = useRef(false);
  // MUI FocusTrap `activated`: on from open unless disableAutoFocus; any focus entering the modal turns it on.
  const activated = useRef(false);
  // MUI FocusTrap `reactFocusEventTarget`: the last element focused through the React tree (portaled descendants
  // count as inside).
  const reactFocusTarget = useRef<EventTarget | null>(null);
  // MUI's menu takes its first focus in a later commit (Grow onEntering), after this runs; ours focuses in the opening
  // commit, so focus already inside counts as entered (same outcome as MUI's order).
  useEffect(() => {
    if (open) activated.current = !disableAutoFocus || Boolean(rootRef.current?.contains(document.activeElement));
  }, [open, disableAutoFocus]);
  useEffect(() => {
    if (!open || disableEnforceFocus) return undefined;
    const doc = document;
    const contain = () => {
      const content = contentRef.current?.nextElementSibling as HTMLElement | null;
      if (!content || !rootRef.current) return;
      if (!doc.hasFocus() || !defaultModalManager.isTopModal(modal.current) || ignoreNextEnforce.current) {
        ignoreNextEnforce.current = false;
        return;
      }
      const active = doc.activeElement;
      if (content.contains(active)) return;
      // The sentinels move focus themselves (trap()); disableAutoFocus = not activated, like MUI.
      if (active instanceof HTMLElement && active.dataset.testid?.startsWith('sentinel')) return;
      if (active !== reactFocusTarget.current) reactFocusTarget.current = null;
      else if (reactFocusTarget.current !== null) return;
      if (!activated.current) return;
      content.focus();
    };
    doc.addEventListener('focusin', contain);
    const interval = setInterval(() => {
      if (doc.activeElement?.tagName === 'BODY') contain();
    }, 50);
    return () => {
      doc.removeEventListener('focusin', contain);
      clearInterval(interval);
    };
  }, [open, disableEnforceFocus]);

  useEffect(() => {
    if (!open || disableAutoFocus) return;
    const content = contentRef.current?.nextElementSibling as HTMLElement | null;
    if (content && !content.contains(document.activeElement)) content.focus();
  }, [open, disableAutoFocus]);

  if (!mounted) return null;

  const trap = (edge: 'start' | 'end') => () => {
    const content = contentRef.current?.nextElementSibling as HTMLElement | null;
    if (!content) return;
    const list = Array.from(content.querySelectorAll<HTMLElement>(focusableSelector));
    (edge === 'start' ? list[list.length - 1] : list[0])?.focus() ?? content.focus();
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key !== 'Escape' || event.defaultPrevented || !defaultModalManager.isTopModal(modal.current)) return;
    if (!disableEscapeKeyDown) {
      event.stopPropagation();
      onClose?.(event, 'escapeKeyDown');
    }
  };

  return createPortal(
    <div
      role="presentation"
      id={id}
      className={classNames('MuiModal-root', className ?? '', !open && !exiting ? 'MuiModal-hidden' : '')}
      style={style}
      ref={rootRef}
      onKeyDown={handleKeyDown}
      onFocus={(event) => {
        activated.current = true;
        const target = event.target as HTMLElement;
        if (!target.dataset?.testid?.startsWith('sentinel')) reactFocusTarget.current = target;
      }}
      {...rest}
    >
      <div
        aria-hidden="true"
        data-slot="modal-backdrop"
        data-vg-core=""
        className={classNames(
          'MuiBackdrop-root',
          'MuiBackdrop-invisible',
          'MuiModal-backdrop',
          backdropClassName ?? '',
        )}
        style={backdropStyle}
        onClick={(event) => open && onClose?.(event, 'backdropClick')}
      />
      <div tabIndex={open ? 0 : -1} data-testid="sentinelStart" ref={contentRef} onFocus={trap('start')} />
      {children}
      <div tabIndex={open ? 0 : -1} data-testid="sentinelEnd" onFocus={trap('end')} />
    </div>,
    document.body,
  );
};
