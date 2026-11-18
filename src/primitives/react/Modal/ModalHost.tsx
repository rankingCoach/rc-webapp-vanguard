import { classNames } from '@helpers/classNames';
import React, { useEffect, useLayoutEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
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
    backdropClassName,
    backdropStyle,
    children,
    ...rest
  } = props;
  const rootRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const modal = useRef<ManagedModal>({ modalRef: null });
  const restoreTo = useRef<HTMLElement | null>(null);
  const mounted = open || exiting;

  useLayoutEffect(() => {
    if (!open) return undefined;
    restoreTo.current = document.activeElement as HTMLElement | null;
    modal.current.modalRef = rootRef.current;
    defaultModalManager.add(modal.current, document.body);
    defaultModalManager.mount(modal.current, { disableScrollLock });
    return () => {
      defaultModalManager.remove(modal.current, false);
    };
  }, [open, disableScrollLock]);

  // Restore focus in a passive cleanup (like MUI FocusTrap): a layout cleanup runs inside React's commit, whose
  // selection restore would immediately re-focus the element that was focused in the popup.
  useEffect(() => {
    if (!open) return undefined;
    return () => {
      if (!disableRestoreFocus && restoreTo.current?.isConnected) restoreTo.current.focus();
    };
  }, [open, disableRestoreFocus]);

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
      {...rest}
    >
      <div
        aria-hidden="true"
        data-slot="modal-backdrop"
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
