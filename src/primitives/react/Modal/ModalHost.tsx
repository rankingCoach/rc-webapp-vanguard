// Ported from @mui/material@9.5.0 Modal/Modal.js, Unstable_TrapFocus/FocusTrap.js (MIT)

import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { defaultLayerStack } from '../../core/layer-stack';
import { defaultModalManager, ManagedModal } from '../../core/modal-manager';
import { cx } from '../class-names';
import { Fade } from '../Transitions/Fade';
import { TransitionTimeout } from '../Transitions/Transition';

export type ModalCloseReason = 'escapeKeyDown' | 'backdropClick' | 'tabKeyDown';

export interface ModalHostProps {
  open: boolean;
  /** Keep the portal mounted while an exit transition runs (the child calls `onExited`). */
  exiting?: boolean;
  /**
   * MUI `closeAfterTransition` (Drawer sets it): the ModalManager entry (order, scroll lock, sibling aria-hidden) and
   * the layer stay registered until the exit transition ends (`exiting` turns false), not until `open` turns false.
   */
  closeAfterTransition?: boolean;
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
  /** MUI `hideBackdrop`: no backdrop element. */
  hideBackdrop?: boolean;
  /** MUI Backdrop `invisible` (default true: the menu/select popups' SimpleBackdrop-like invisible backdrop). */
  backdropInvisible?: boolean;
  /** MUI Modal's visible Backdrop: wrap the backdrop in Fade with this timeout (Drawer: its transitionDuration). */
  backdropTransition?: TransitionTimeout;
  onKeyDown?: React.KeyboardEventHandler<HTMLDivElement>;
  children: React.ReactNode;
  [dataAttr: `data-${string}`]: unknown;
}

// MUI FocusTrap's tabbable set: elements with tabindex -1 are focusable but never tab targets.
const focusableSelector = [
  'a[href]',
  'area[href]',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'button:not([disabled])',
  '[tabindex]',
]
  .map((sel) => `${sel}:not([tabindex^="-"])`)
  .join(',');

/**
 * Modal host (MUI Modal parity, without MUI): portal into document.body with the legacy `MuiModal-root` DOM,
 * an invisible backdrop, focus-trap sentinels, Escape / backdrop-click close, aria-hiding of siblings and scroll lock
 * via the core ModalManager, and focus restored to the previously focused element on close.
 */
export const ModalHost = (props: ModalHostProps) => {
  const {
    open,
    exiting = false,
    closeAfterTransition = false,
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
    hideBackdrop = false,
    backdropInvisible = true,
    backdropTransition,
    children,
    onKeyDown: onKeyDownProp,
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
  // MUI Portal is two-phase: it renders nothing in the commit that mounts it and portals the content in the next one
  // (its mount node is set in a layout effect), so MUI Modal registers, locks the scroll and hides siblings one commit
  // later, after the first commit's passive effects (e.g. Vanguard's ModalRoot resetting body overflow on mount).
  // Locking in the first commit let that reset undo the lock (H16 FAIL: drawer open on page mount, page scrolls).
  const [portalReady, setPortalReady] = useState(false);
  useLayoutEffect(() => {
    if (mounted !== portalReady) setPortalReady(mounted);
  }, [mounted, portalReady]);
  const ariaHiddenOnClose = !(rest['aria-hidden'] === false || rest['aria-hidden'] === 'false');

  // MUI useModal: `handleOpen` (manager.add → sibling aria-hidden) runs in a passive effect when `open` turns on,
  // `handleMounted` (manager.mount → scroll lock) once the Portal has attached the root, and `handleClose`
  // (manager.remove) in a passive effect after the FocusTrap restored focus (or on exit with closeAfterTransition).
  const wantRegistered = open || (closeAfterTransition && exiting);
  const registered = portalReady && wantRegistered;
  // Focus restore / trap / auto-focus act once the content is portaled (MUI FocusTrap lives inside the Portal).
  const active = open && portalReady;
  useLayoutEffect(() => {
    if (!registered) return undefined;
    modal.current.modalRef = rootRef.current;
    // Idempotent: normally added in the open effect below (a commit earlier); a reopen during the exit transition
    // keeps the portal, so mount can run first.
    defaultModalManager.add(modal.current, document.body);
    defaultModalManager.mount(modal.current, { disableScrollLock });
    // Layer order for click-away hosts below this modal (core/layer-stack.ts).
    const layer = defaultLayerStack.push(() => rootRef.current, restoreTo.current);
    return () => {
      defaultLayerStack.remove(layer);
    };
  }, [registered, disableScrollLock]);

  // Restore focus in a passive cleanup (like MUI FocusTrap): a layout cleanup runs inside React's commit, whose
  // selection restore would immediately re-focus the element that was focused in the popup.
  useEffect(() => {
    if (!active) return undefined;
    return () => {
      if (!disableRestoreFocus && restoreTo.current?.isConnected) {
        ignoreNextEnforce.current = true;
        restoreTo.current.focus();
      }
    };
  }, [active, disableRestoreFocus]);

  // Declared after the focus-restore effect: on close MUI restores focus, then unlocks and un-hides (cleanup order).
  useEffect(() => {
    if (!wantRegistered) return undefined;
    defaultModalManager.add(modal.current, document.body);
    return () => {
      // MUI useModal: the root stays aria-hidden while it exits unless the caller passes aria-hidden={false}.
      defaultModalManager.remove(modal.current, ariaHiddenOnClose);
    };
  }, [wantRegistered, ariaHiddenOnClose]);

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
    if (active) activated.current = !disableAutoFocus || Boolean(rootRef.current?.contains(document.activeElement));
  }, [active, disableAutoFocus]);
  useEffect(() => {
    if (!active || disableEnforceFocus) return undefined;
    const doc = document;
    // While MUI still renders some modals (migration), its ModalManager is invisible to the own one: an open MUI modal
    // root mounted after this one (portals mount in order) is on top, and this trap stands down (Codex review, 2.5).
    const newerForeignModal = () => {
      const root = rootRef.current;
      if (!root) return false;
      return Array.from(doc.querySelectorAll('.MuiModal-root:not(.MuiModal-hidden)')).some(
        (el) =>
          el !== root &&
          !root.contains(el) &&
          !defaultModalManager.isRegisteredRoot(el) &&
          Boolean(root.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING),
      );
    };
    const contain = () => {
      const content = contentRef.current?.nextElementSibling as HTMLElement | null;
      if (!content || !rootRef.current) return;
      if (
        !doc.hasFocus() ||
        !defaultModalManager.isTopModal(modal.current) ||
        newerForeignModal() ||
        ignoreNextEnforce.current
      ) {
        ignoreNextEnforce.current = false;
        return;
      }
      const focused = doc.activeElement;
      if (content.contains(focused)) return;
      // The sentinels move focus themselves (trap()); disableAutoFocus = not activated, like MUI.
      if (focused instanceof HTMLElement && focused.dataset.testid?.startsWith('sentinel')) return;
      if (focused !== reactFocusTarget.current) reactFocusTarget.current = null;
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
  }, [active, disableEnforceFocus]);

  useEffect(() => {
    if (!active || disableAutoFocus) return;
    const content = contentRef.current?.nextElementSibling as HTMLElement | null;
    if (content && !content.contains(document.activeElement)) content.focus();
  }, [active, disableAutoFocus]);

  // MUI Portal renders nothing on the server (its mount node is set in an effect).
  if (!mounted || !portalReady || typeof document === 'undefined') return null;

  const trap = (edge: 'start' | 'end') => () => {
    const content = contentRef.current?.nextElementSibling as HTMLElement | null;
    if (!content) return;
    const list = Array.from(content.querySelectorAll<HTMLElement>(focusableSelector));
    // focus() returns undefined, so `target?.focus() ?? content.focus()` always fell through to the content.
    const target = edge === 'start' ? list[list.length - 1] : list[0];
    if (target) target.focus();
    else content.focus();
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    // MUI useModal: the consumer's onKeyDown first; IME composition (which 229) is not an Escape.
    onKeyDownProp?.(event as React.KeyboardEvent<HTMLDivElement>);
    if (event.key !== 'Escape' || event.which === 229 || !defaultModalManager.isTopModal(modal.current)) return;
    if (!disableEscapeKeyDown) {
      event.stopPropagation();
      onClose?.(event, 'escapeKeyDown');
    }
  };

  const backdrop = (
    <div
      data-slot="modal-backdrop"
      data-vg-core=""
      // MUI Modal backdrop: class, the Fade style, then aria-hidden.
      className={cx(
        'MuiBackdrop-root',
        backdropInvisible ? 'MuiBackdrop-invisible' : '',
        'MuiModal-backdrop',
        backdropClassName,
      )}
      style={backdropStyle}
      aria-hidden="true"
      onClick={(event) => open && onClose?.(event, 'backdropClick')}
    />
  );

  return createPortal(
    <div
      role="presentation"
      id={id}
      style={style}
      // MUI Modal: clsx(className, classes.root, hidden) after the root props.
      className={cx(className, 'MuiModal-root', !open && !exiting ? 'MuiModal-hidden' : '')}
      ref={rootRef}
      onKeyDown={handleKeyDown}
      onFocus={(event) => {
        activated.current = true;
        const target = event.target as HTMLElement;
        if (!target.dataset?.testid?.startsWith('sentinel')) reactFocusTarget.current = target;
      }}
      {...rest}
    >
      {hideBackdrop ? null : backdropTransition !== undefined ? (
        <Fade in={open} timeout={backdropTransition}>
          {backdrop}
        </Fade>
      ) : (
        backdrop
      )}
      <div tabIndex={open ? 0 : -1} data-testid="sentinelStart" ref={contentRef} onFocus={trap('start')} />
      {children}
      <div tabIndex={open ? 0 : -1} data-testid="sentinelEnd" onFocus={trap('end')} />
    </div>,
    document.body,
  );
};
