import { mt2 } from '@globalStyles';
import { classNames } from '@helpers/classNames';
import { uuidv4 } from '@helpers/generate-uid';
import { PUB_SUB_EVENTS, pubSubService } from '@helpers/pub-sub';
import { deviceService } from '@services/device.service';
import { PublicWidgetData } from '@stores/public-widgets-data.store';
import { IconNames } from '@vanguard/Icon/IconNames';
import { Modal } from '@vanguard/Modal/Modal';
import { ModalFooterAction, SubButtonProps } from '@vanguard/Modal/ModalFooter/ModalFooter';
import { ModalHeader, ModalType } from '@vanguard/Modal/Modalheader/ModalHeader';
import { StandardModalProps } from '@vanguard/Modal/ModalRoot/ModalRoot';
import { ModalTransition } from '@vanguard/Modal/ModalRoot/ModalTransition/ModalTransition';
import { Render } from '@vanguard/Render/Render';
import { AcceptModal } from '@vanguard/StandardModals/AcceptModal/AcceptModal';
import { ErrorModal } from '@vanguard/StandardModals/ErrorModal/ErrorModal';
import { FontWeights, Text, TextReplacements, TextTypes } from '@vanguard/Text/Text';
import React, { Dispatch, SetStateAction } from 'react';

import { PhotoCarouselModal } from '../CustomModals/PhotoCarouselModal/PhotoCarouselModal';
import { MediaItemFile } from '../Gallery/Gallery/Gallery';
import { ConfirmModal } from '../StandardModals/ConfirmModal/ConfirmModal';
import { LoadingModal } from '../StandardModals/LoadingModal/LoadingModal';
import { ModalResponse } from './ModalResponse';

export type ComponentWithId = any;

export type ModalOpts = {
  testId?: string;
  className?: string;
  padding?: string;
  fullscreen?: boolean;
  animation?: ModalTransition;
  modalPosition?: 'top' | 'center' | 'bottom';
  width?: string;
  minHeight?: string;
  maxWidth?: string;
  wrapInModal?: boolean;
  type?: ModalType;
  title?: string;
  message?: string | React.ReactNode;
  hideHeaderCloseBtn?: boolean;
  onContentClick?: (event: React.MouseEvent) => void;
  onOutsideClick?: (event: React.MouseEvent) => void;
  backgroundColor?: string;
};

export interface OpenConfirmModalOptions {
  closeFn: (e: ModalResponse<any>) => void;
  title?: string;
  message?: string | React.ReactNode;
  positiveCtaText?: string;
  negativeCtaText?: string;
  headerType?: ModalType;
  positiveIconLeft?: IconNames;
  replacements?: TextReplacements;
  hideHeaderCloseBtn?: boolean;
  customNegativeFn?: (change?: Dispatch<SetStateAction<number>>) => void;
  hideNegativeBtn?: boolean;
}

export interface OpenAcceptModalOptions {
  closeFn: (e: ModalResponse<any>) => void;
  title?: string;
  message?: string | React.ReactNode;
  headerType?: ModalType;
  positiveCtaText?: string;
  replacements?: TextReplacements;
  hideHeaderCloseBtn?: boolean;
}

export interface OpenLoadingModalOptions {
  title?: string;
  message?: string | React.ReactNode;
  loadingAnimation?: 'default' | 'rocket' | 'ai';
  headerTitle?: string;
}

const WrapperModal = <ResponseModel,>(
  props: StandardModalProps<ResponseModel> & {
    children: React.ReactNode;
    padding?: string;
  },
) => {
  const { close, children, title, headerType, message, hideHeaderCloseBtn, padding } = props;

  return (
    <Modal {...props}>
      <ModalHeader
        closeFn={close}
        hideCloseButtonOnMobile={false}
        hideHeaderCloseBtn={hideHeaderCloseBtn}
        type={headerType}
      >
        <Render if={!!title}>
          <Text type={TextTypes.heading4} fontWeight={FontWeights.bold}>
            {title}
          </Text>
        </Render>

        <Render if={!!message && typeof message === 'string'}>
          <div className={classNames(mt2)}>
            <Text fontWeight={FontWeights.regular}>{message}</Text>
          </div>
        </Render>
      </ModalHeader>
      <span style={{ padding }}>{children}</span>
    </Modal>
  );
};

/**
 * Modal Service Class
 * ---------------------------------------------------------------------------------------------------------------------
 */
export const MODAL_BASE_Z_INDEX = 1100;

class ModalServiceClass {
  private loadingModalId: null | string;
  private confirmModalId: null | string;
  private errorModalId: null | string;
  private modalCloseListeners: Map<string, { cbs: ((resp?: ModalResponse<any>) => void)[]; data: any }>;
  private modalComponents: Map<string, any>;
  private modalOrder: Map<string, number>;
  private popoverOrder: Map<string, number>;

  constructor() {
    this.loadingModalId = null;
    this.confirmModalId = null;
    this.errorModalId = null;
    this.modalCloseListeners = new Map();
    this.modalComponents = new Map();
    this.modalOrder = new Map();
    this.popoverOrder = new Map();
  }

  on(event: any, callback: (details: any) => any) {
    document.addEventListener(event, (e) => callback(e.detail));
  }

  onModalClose<T = any, U = any>(id: string, cb?: (resp: ModalResponse<T>) => void, data?: U) {
    if (!this.modalCloseListeners.has(id)) {
      this.modalCloseListeners.set(id, { cbs: [], data: data });
    }
    if (cb) {
      this.modalCloseListeners.get(id)?.cbs?.push(cb);
    }
  }

  cleanModalClose(id: string) {
    this.modalCloseListeners.delete(id);
  }

  getModalComponent(id: string) {
    return this.modalComponents.get(id);
  }

  removeModalComponent(id: string) {
    this.modalComponents.delete(id);
    this.modalOrder.delete(id);
  }

  openConfirmModal(options: OpenConfirmModalOptions): string;
  /** @deprecated Use openConfirmModal({ ... }) instead. */
  openConfirmModal(
    closeFn: (e: ModalResponse<any>) => void,
    title?: string,
    message?: string | React.ReactNode,
    positiveCtaText?: string,
    negativeCtaText?: string,
    headerType?: ModalType,
    positiveIconLeft?: IconNames,
    replacements?: TextReplacements,
    hideHeaderCloseBtn?: boolean,
    customNegativeFn?: (change?: Dispatch<SetStateAction<number>>) => void,
    hideNegativeBtn?: boolean,
  ): string;
  openConfirmModal(
    closeFnOrOptions: OpenConfirmModalOptions | ((e: ModalResponse<any>) => void),
    title = '',
    message: string | React.ReactNode = '',
    positiveCtaText: string = '',
    negativeCtaText: string = '',
    headerType: ModalType = 'default',
    positiveIconLeft: IconNames | undefined = undefined,
    replacements: TextReplacements | undefined = undefined,
    hideHeaderCloseBtn?: boolean,
    customNegativeFn?: (change?: Dispatch<SetStateAction<number>>) => void,
    hideNegativeBtn?: boolean,
  ): string {
    let options: OpenConfirmModalOptions;
    if (typeof closeFnOrOptions === 'function') {
      // deprecated
      options = {
        closeFn: closeFnOrOptions,
        title,
        message,
        positiveCtaText,
        negativeCtaText,
        headerType,
        positiveIconLeft,
        replacements,
        hideHeaderCloseBtn,
        customNegativeFn,
        hideNegativeBtn,
      };
    } else {
      options = closeFnOrOptions;
    }

    const {
      closeFn,
      title: finalTitle = '',
      message: finalMessage = '',
      positiveCtaText: finalPositiveCtaText = '',
      negativeCtaText: finalNegativeCtaText = '',
      headerType: finalHeaderType = 'default',
      positiveIconLeft: finalPositiveIconLeft,
      replacements: finalReplacements,
      hideHeaderCloseBtn: finalHideHeaderCloseBtn,
      customNegativeFn: finalCustomNegativeFn,
    } = options;

    this.confirmModalId = this.open(
      <ConfirmModal
        close={closeFn}
        message={finalMessage}
        title={finalTitle}
        positiveCtaText={finalPositiveCtaText}
        positiveIconLeft={finalPositiveIconLeft}
        negativeCtaText={finalNegativeCtaText}
        headerType={finalHeaderType}
        replacements={finalReplacements}
        hideHeaderCloseBtn={finalHideHeaderCloseBtn}
        customNegativeFn={finalCustomNegativeFn}
      />,
    );
    return this.confirmModalId;
  }

  openAcceptModal(options: OpenAcceptModalOptions): string;
  /** @deprecated Use openAcceptModal({ ... }) instead. */
  openAcceptModal(
    closeFn: (e: ModalResponse<any>) => void,
    title?: string,
    message?: string | React.ReactNode,
    headerType?: ModalType,
    positiveCtaText?: string,
    replacements?: TextReplacements,
    hideHeaderCloseBtn?: boolean,
  ): string;
  openAcceptModal(
    closeFnOrOptions: OpenAcceptModalOptions | ((e: ModalResponse<any>) => void),
    title = '',
    message: string | React.ReactNode = '',
    headerType: ModalType = 'default',
    positiveCtaText: string = '',
    replacements: TextReplacements | undefined = undefined,
    hideHeaderCloseBtn?: boolean,
  ): string {
    let options: OpenAcceptModalOptions;
    if (typeof closeFnOrOptions === 'function') {
      // deprecated
      options = {
        closeFn: closeFnOrOptions,
        title,
        message,
        headerType,
        positiveCtaText,
        replacements,
        hideHeaderCloseBtn,
      };
    } else {
      options = closeFnOrOptions;
    }

    const {
      closeFn,
      title: finalTitle = '',
      message: finalMessage = '',
      headerType: finalHeaderType = 'default',
      positiveCtaText: finalPositiveCtaText = '',
      replacements: finalReplacements,
      hideHeaderCloseBtn: finalHideHeaderCloseBtn,
    } = options;

    this.confirmModalId = this.open(
      <AcceptModal
        close={closeFn}
        message={finalMessage}
        title={finalTitle}
        positiveCtaText={finalPositiveCtaText}
        headerType={finalHeaderType}
        replacements={finalReplacements}
        hideHeaderCloseBtn={finalHideHeaderCloseBtn}
      />,
    );
    return this.confirmModalId;
  }

  closeConfirmModal() {
    this.closeEv(this.confirmModalId);
    this.confirmModalId = null;
  }

  openLoadingModal(options?: OpenLoadingModalOptions): string;
  /** @deprecated Use openLoadingModal({ ... }) instead. */
  openLoadingModal(
    title?: string,
    message?: string | React.ReactNode,
    loadingAnimation?: 'default' | 'rocket' | 'ai',
    headerTitle?: string,
  ): string;
  openLoadingModal(
    titleOrOptions?: string | OpenLoadingModalOptions,
    message?: string | React.ReactNode,
    loadingAnimation?: 'default' | 'rocket' | 'ai',
    headerTitle?: string,
  ): string {
    let options: OpenLoadingModalOptions;

    if (typeof titleOrOptions === 'object' && titleOrOptions !== null) {
      options = titleOrOptions as OpenLoadingModalOptions;
    } else {
      // deprecated
      options = {
        title: titleOrOptions as string | undefined,
        message,
        loadingAnimation,
        headerTitle,
      };
    }

    const {
      title,
      message: finalMessage,
      loadingAnimation: finalLoadingAnimation = 'default',
      headerTitle: finalHeaderTitle,
    } = options;

    this.loadingModalId = this.open(
      <LoadingModal
        title={title}
        message={finalMessage}
        loadingAnimation={finalLoadingAnimation}
        headerTitle={finalHeaderTitle}
        close={() => {}}
      />,
      {
        fullscreen: false,
        maxWidth: '650px',
        modalPosition: 'center',
        backgroundColor: 'var(--n000)',
      },
    );

    return this.loadingModalId;
  }

  closeLoadingModal() {
    this.closeEv(this.loadingModalId);
    this.loadingModalId = null;
  }

  openPhotoGalleryModal(gallery: MediaItemFile[], idx?: MediaItemFile) {
    return this.open(<PhotoCarouselModal defaultMediaItem={idx} gallery={gallery} close={() => {}} />, {
      modalPosition: 'center',
      maxWidth: '996px',
      width: '100%',
      wrapInModal: false,
    });
  }

  openSlide<ResponseModel>(component: ComponentWithId, opts?: ModalOpts) {
    opts = { ...opts, animation: 'slide' };
    return this.open(component, opts);
  }

  openErrorModal = ({
    err,
    source,
    message,
    title,
    ctaPositive,
    onClose,
  }: {
    err?: any;
    source: string;
    message?: string;
    title?: string;
    ctaPositive?: (ModalFooterAction & SubButtonProps) | null;
    onClose?: () => void;
  }) => {
    this.errorModalId = this.open(
      <ErrorModal
        close={() => {
          onClose && onClose();
        }}
        err={err}
        source={source}
        message={message}
        title={title}
        ctaPositive={ctaPositive}
      />,
    );
  };

  closeErrorModal() {
    this.closeEv(this.errorModalId);
    this.errorModalId = null;
  }

  closeAllModals() {
    // Close all open modals
    this.modalComponents.forEach((_, id) => {
      this.closeEv(id);
    });
  }

  /**
   * Highest order across modals AND popovers — used internally when assigning
   * the next slot so modals/popovers never tie or interleave wrongly.
   */
  private getCurrentMaxOrder(): number {
    let maxOrder = 0;
    this.modalOrder.forEach((order) => {
      if (order > maxOrder) maxOrder = order;
    });
    this.popoverOrder.forEach((order) => {
      if (order > maxOrder) maxOrder = order;
    });
    return maxOrder;
  }

  private getMaxModalOrder(): number {
    let maxOrder = 0;
    this.modalOrder.forEach((order) => {
      if (order > maxOrder) maxOrder = order;
    });
    return maxOrder;
  }

  /**
   * Z-index of the topmost mounted modal, or MODAL_BASE_Z_INDEX (the stacking
   * floor) when no modal is open. Popovers are excluded — this reports modal
   * stacking only. Mirrors ModalTransition's formula: BASE + order.
   */
  getTopmostModalZIndex(): number {
    return MODAL_BASE_Z_INDEX + this.getMaxModalOrder();
  }

  /**
   * Single source of truth for a modal's stack order. ModalContext delegates
   * to this so the dropdown and ModalTransition cannot drift apart.
   */
  getModalOrder(id: string): number {
    return this.modalOrder.get(id) ?? 0;
  }

  /**
   * Register a popover (e.g. DropdownMenu) into the shared stacking ledger.
   * Returns its z-index so the caller can position itself. Modals opened
   * after this call will land above the popover; closing the popover with
   * `unregisterPopover` frees the slot.
   */
  registerPopover(id: string): number {
    const order = this.getCurrentMaxOrder() + 1;
    this.popoverOrder.set(id, order);
    return MODAL_BASE_Z_INDEX + order;
  }

  unregisterPopover(id: string) {
    this.popoverOrder.delete(id);
  }

  /** Test-only: wipe internal state. Not for production code paths. */
  __resetForTests() {
    this.loadingModalId = null;
    this.confirmModalId = null;
    this.errorModalId = null;
    this.modalCloseListeners.clear();
    this.modalComponents.clear();
    this.modalOrder.clear();
    this.popoverOrder.clear();
  }

  open<ResponseModel>(component: ComponentWithId, opts?: ModalOpts) {
    let id = uuidv4();
    const instance = PublicWidgetData.getInstance();
    const { widgetId } = instance.get();

    if (widgetId) {
      id = `${id}_${widgetId}`;
    }

    /**
     * Set animation depending on screen size
     * Note: see fullscreen prop in Modal.tsx
     */
    if (deviceService.isMobile() && (!opts || !opts.hasOwnProperty('fullscreen'))) {
      opts = { ...{ fullscreen: false, animation: 'pop' }, ...opts };
    } else {
      opts = { ...{ fullscreen: false, animation: 'grow' }, ...opts };
    }

    const thisComponent = { ...component };

    const closeFn = (r: ModalResponse<ResponseModel>) => {
      thisComponent.props.close && thisComponent.props.close(r);
      this.closeEv(id, r);
    };

    if (opts?.wrapInModal) {
      component = (
        <WrapperModal<ResponseModel>
          close={closeFn}
          padding={opts.padding}
          headerType={opts.type}
          title={opts.title}
          message={opts.message}
        >
          {React.isValidElement(component)
            ? React.cloneElement(component, {
                modalId: id,
                close: closeFn,
              } as any)
            : component}
        </WrapperModal>
      );
    }

    /**
     * Make props
     */
    const props = {
      ...component.props,
      close: closeFn,
      ...opts,
    };

    /**
     * Store component and publish modal open event
     */
    this.modalComponents.set(id, {
      ...component,
      props: {
        ...props,
      },
      modalId: id,
    });

    // Assign order = (current topmost order) + 1, so closing modals frees their slots
    // and the counter naturally returns to 1 when all modals close.
    this.modalOrder.set(id, this.getCurrentMaxOrder() + 1);

    pubSubService.$pub(PUB_SUB_EVENTS.reactModalOpen, {
      modalId: id,
      animation: opts?.animation || 'grow',
    });
    return id;
  }

  closeEv<T = any>(modalId?: string | null, resp?: ModalResponse<T>): Promise<undefined | any> {
    if (modalId) {
      return new Promise((resolve) => {
        setTimeout(() => {
          pubSubService.$pub(PUB_SUB_EVENTS.reactModalClose, { modalId });

          const listeners = this.modalCloseListeners.get(modalId);
          if (listeners) {
            listeners.cbs.forEach((cb) => cb(resp));
          }

          this.cleanModalClose(modalId);
          this.removeModalComponent(modalId);
          resolve(listeners?.data);
        }, 0);
      });
    }

    return new Promise((resolve) => {
      resolve(undefined);
    });
  }
}

export const ModalService = new ModalServiceClass();
