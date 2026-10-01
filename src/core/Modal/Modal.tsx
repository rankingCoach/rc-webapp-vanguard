import './Modal.scss';

import { useOnEscapeKyePress } from '@custom-hooks/use-on-escape-kye-press';
import { classNames } from '@helpers/classNames';
import { deviceService } from '@services/device.service.ts';
import { Button, ButtonSizes, ButtonTypes } from '@vanguard/Button/Button';
import { IconNames } from '@vanguard/Icon/IconNames';
import type { ModalOpts } from '@vanguard/Modal/ModalService';
import React, { useCallback, useContext, useEffect, useRef } from 'react';

import { ModalLifecycleContext } from './ModalLifecycleContext';
import { modalLayoutCss } from './modal-layout';
import { ModalResponse } from './ModalResponse';
import { defaultModalPresentation, ModalPresentationContext } from './ModalPresentationContext';
import { OverlayStackingService } from '../OverlayStacking/OverlayStackingService';

type Props = {
  children?: React.ReactNode;
  modalContentClassName?: string;
  disableOutsideClick?: boolean;
  /**
   * Close handler owned by the modal. When provided, the modal renders its own
   * close (✕) button and wires Esc / outside-click closing to it. Same
   * signature as the (deprecated) `ModalHeader` `closeFn`, so the `close`
   * injected by `ModalService` can be passed directly.
   */
  onClose?: (response?: ModalResponse<any>) => void;
  /** Render the built-in close button when `onClose` is set. Defaults to `true`. */
  showCloseButton?: boolean;
  /** Hide the built-in close button on mobile/tablet. Defaults to `false`. */
  hideCloseButtonOnMobile?: boolean;
  /** Close on Escape key press (topmost modal only). Defaults to `true`. */
  closeOnEsc?: boolean;
  /** Close on overlay / outside click. Defaults to `true`. */
  closeOnOutsideClick?: boolean;
  /**
   * Content rendered OUTSIDE the modal panel but inside the overlay, positioned
   * relative to the panel bounds (e.g. lightbox navigation arrows / counter).
   * Clicks on it do not trigger outside-click closing.
   */
  outerContent?: React.ReactNode;
} & ModalOpts;

/**
 * Module-scoped LIFO registry of modals that opt into Esc-to-close. The Esc
 * key listener lives on `document`, so without this guard every stacked modal
 * would close on a single Esc press. Mount order follows open order, so the
 * last-registered token is the topmost modal and the only one allowed to close.
 */
const escStack: symbol[] = [];
const escElements = new Map<symbol, HTMLDivElement>();
const handledEscapeEvents = new WeakSet<KeyboardEvent>();
/** The service-managed window (`.modalRoot`) an Esc token renders in; `undefined` for standalone modals. */
const getEscOwner = (token: symbol | undefined) =>
  token && escElements.get(token)?.closest<HTMLElement>('.modalRoot')?.dataset.modalId;

/**
 * Component
 * ---------------------------------------------------------------------------------------------------------------------
 */
export const Modal = (props: Props) => {
  const lifecycle = useContext(ModalLifecycleContext);
  const modalElement = useRef<HTMLDivElement>(null);
  const { allowCompact, isCompact, modalId, stacked, active } = useContext(ModalPresentationContext);
  const {
    children,
    className,
    modalPosition = 'top',
    testId,
    onOutsideClick,
    onContentClick,
    modalContentClassName,
    disableOutsideClick,
    backgroundColor,
    onClose,
    showCloseButton = true,
    hideCloseButtonOnMobile = false,
    closeOnEsc = true,
    closeOnOutsideClick = true,
    outerContent,
  } = props;
  let { fullscreen, width, maxWidth, minHeight } = props;

  /**
   * Default Fullscreen value
   */
  if (fullscreen === undefined) {
    fullscreen = deviceService.isMobile();
  }
  if (fullscreen) {
    // Reset width props on fullscreen mode
    width = undefined;
    minHeight = undefined;
    maxWidth = undefined;
  }

  useEffect(() => {
    if (modalId) lifecycle.registerFullscreen(modalId, !!fullscreen);
  }, [modalId, fullscreen, lifecycle]);

  /**
   * Close behavior
   */
  const shouldRenderCloseBtn = !!onClose && showCloseButton;
  const shouldCloseOnEsc = !!onClose && closeOnEsc && (!stacked || active);
  const shouldCloseOnOutsideClick = !!onClose && closeOnOutsideClick;

  // Register this instance on the Esc stack while Esc-to-close is enabled.
  const escTokenRef = useRef<symbol>(Symbol('modal-esc'));
  useEffect(() => {
    if (!shouldCloseOnEsc) {
      return;
    }
    const token = escTokenRef.current;
    escStack.push(token);
    if (modalElement.current) escElements.set(token, modalElement.current);
    return () => {
      escElements.delete(token);
      const index = escStack.indexOf(token);
      if (index !== -1) {
        escStack.splice(index, 1);
      }
    };
  }, [shouldCloseOnEsc]);

  useOnEscapeKyePress(
    useCallback((event: KeyboardEvent) => {
      if (!shouldCloseOnEsc || !onClose || handledEscapeEvents.has(event)) {
        return;
      }
      // Only the topmost Esc-enabled modal reacts.
      const ownerId = modalId || modalElement.current?.closest<HTMLElement>('.modalRoot')?.dataset.modalId;
      const lastToken = escStack[escStack.length - 1];
      let isTopmost = lastToken === escTokenRef.current;
      // A standalone modal opened above the service windows keeps LIFO precedence.
      if (ownerId && lifecycle.isManagedEscape() && getEscOwner(lastToken)) {
        // Overlay order chooses the service window; DOM nesting chooses the one
        // Esc handler inside it, even when parent/child effects mount together.
        const tokens = escStack.filter((token) => getEscOwner(token) === ownerId);
        const topToken = tokens.reduce<symbol | undefined>((selected, token) => {
          if (selected && escElements.get(token)?.contains(escElements.get(selected)!)) return selected;
          return token;
        }, undefined);
        isTopmost = OverlayStackingService.getZIndex(ownerId) === OverlayStackingService.getTopmostZIndex('modal') && topToken === escTokenRef.current;
      }
      if (!isTopmost) {
        return;
      }
      handledEscapeEvents.add(event);
      onClose();
    }, [shouldCloseOnEsc, onClose, modalId, lifecycle]),
  );

  /**
   * Get Classes
   */
  const getContainerClassName = () => {
    const positionClass = `modal-position-${modalPosition}`;
    const fullscreenClass = fullscreen ? 'modal-fullscreen' : '';
    return classNames(positionClass, fullscreenClass, className,
      allowCompact ? 'modal-compact-enabled' : '', isCompact ? 'modal-compact' : '', stacked ? 'modal-stacked' : '');
  };

  const getContentStyle = () => {
    return { width: width, maxWidth: maxWidth, backgroundColor: backgroundColor, minHeight };
  };

  /**
   * Return view
   * ---
   */
  const panel = (
    <div
      onClick={(e) => {
        if (!disableOutsideClick) {
          e.stopPropagation();
          onContentClick && onContentClick(e);
        }
      }}
      className={classNames('modal-content', modalContentClassName)}
      style={getContentStyle()}
    >
      {shouldRenderCloseBtn ? (
        <div className={classNames('modal-close-btn', hideCloseButtonOnMobile ? 'modal-close-btn-hidden-mobile' : '')}>
          <Button
            testId={'modal-close-cta'}
            type={ButtonTypes.muted}
            size={ButtonSizes.large}
            icon={IconNames.close}
            rounded
            onClick={() => onClose?.()}
          />
        </div>
      ) : null}
      {children}
    </div>
  );

  return (
    <ModalPresentationContext.Provider value={defaultModalPresentation}>
    <div
      ref={modalElement}
      onClick={(e) => {
        onOutsideClick && onOutsideClick(e);
        if (shouldCloseOnOutsideClick && onClose) {
          onClose();
        }
      }}
      style={allowCompact || stacked ? modalLayoutCss as React.CSSProperties : undefined}
      data-testid={testId}
      className={classNames('rc-modal', getContainerClassName())}
    >
      {outerContent === undefined ? (
        panel
      ) : (
        <div className={'modal-content-wrapper'}>
          {panel}
          <div className={'modal-outer-content'} onClick={(e) => e.stopPropagation()}>
            {outerContent}
          </div>
        </div>
      )}
    </div>
    </ModalPresentationContext.Provider>
  );
};
export type { Props as ModalProps };
