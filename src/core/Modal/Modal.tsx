import './Modal.scss';

import { useOnEscapeKyePress } from '@custom-hooks/use-on-escape-kye-press';
import { classNames } from '@helpers/classNames';
import { deviceService } from '@services/device.service.ts';
import { Button, ButtonSizes, ButtonTypes } from '@vanguard/Button/Button';
import { IconNames } from '@vanguard/Icon/IconNames';
import { ModalOpts } from '@vanguard/Modal/ModalService';
import React, { useCallback, useEffect, useRef } from 'react';

import { ModalResponse } from './ModalResponse';

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
} & ModalOpts;

/**
 * Module-scoped LIFO registry of modals that opt into Esc-to-close. The Esc
 * key listener lives on `document`, so without this guard every stacked modal
 * would close on a single Esc press. Mount order follows open order, so the
 * last-registered token is the topmost modal and the only one allowed to close.
 */
const escStack: symbol[] = [];

/**
 * Component
 * ---------------------------------------------------------------------------------------------------------------------
 */
export const Modal = (props: Props) => {
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

  /**
   * Close behavior
   */
  const shouldRenderCloseBtn = !!onClose && showCloseButton;
  const shouldCloseOnEsc = !!onClose && closeOnEsc;
  const shouldCloseOnOutsideClick = !!onClose && closeOnOutsideClick;

  // Register this instance on the Esc stack while Esc-to-close is enabled.
  const escTokenRef = useRef<symbol>(Symbol('modal-esc'));
  useEffect(() => {
    if (!shouldCloseOnEsc) {
      return;
    }
    const token = escTokenRef.current;
    escStack.push(token);
    return () => {
      const index = escStack.indexOf(token);
      if (index !== -1) {
        escStack.splice(index, 1);
      }
    };
  }, [shouldCloseOnEsc]);

  useOnEscapeKyePress(
    useCallback(() => {
      if (!shouldCloseOnEsc || !onClose) {
        return;
      }
      // Only the topmost Esc-enabled modal reacts.
      if (escStack[escStack.length - 1] !== escTokenRef.current) {
        return;
      }
      onClose();
    }, [shouldCloseOnEsc, onClose]),
  );

  /**
   * Get Classes
   */
  const getContainerClassName = () => {
    const positionClass = `modal-position-${modalPosition}`;
    const fullscreenClass = fullscreen ? 'modal-fullscreen' : '';
    return classNames(positionClass, fullscreenClass, className);
  };

  const getContentStyle = () => {
    return { width: width, maxWidth: maxWidth, backgroundColor: backgroundColor, minHeight };
  };

  /**
   * Return view
   * ---
   */
  return (
    <div
      onClick={(e) => {
        onOutsideClick && onOutsideClick(e);
        if (shouldCloseOnOutsideClick && onClose) {
          onClose();
        }
      }}
      data-testid={testId}
      className={classNames('rc-modal', getContainerClassName())}
    >
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
          <div
            className={classNames('modal-close-btn', hideCloseButtonOnMobile ? 'modal-close-btn-hidden-mobile' : '')}
          >
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
    </div>
  );
};
export type { Props as ModalProps };
