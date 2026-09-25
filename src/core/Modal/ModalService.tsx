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
import { OverlayStackingService } from '@vanguard/OverlayStacking/OverlayStackingService';
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
import { BamStack, ModalRegistry } from './services/bam-stack';
import { CompactWindowBounds } from './services/compact-window-geometry';
import { CompactWindowManager } from './services/compact-window-manager';
import { ModalWindow, ModalWindowEvent, ModalWindowEvents, ModalWindowMetadata } from './services/modal-window-events';
import { PresentationStore } from './services/presentation-store';

export type { CompactWindowBounds } from './services/compact-window-geometry';
export { clampCompactWindowBounds } from './services/compact-window-geometry';
export type { ModalWindow, ModalWindowEvent, ModalWindowMetadata } from './services/modal-window-events';

export type ComponentWithId = any;

export type ModalOpts = {
  /** Opt into window lifecycle events. Omit to retain ordinary modal behavior. */
  windowMetadata?: ModalWindowMetadata;
  /** Opt into compact()/expand() controls. Existing modals remain unchanged when omitted. */
  allowCompact?: boolean;
  /** Label shown on the exposed stacking tab. */
  stackTitle?: string;
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
  /**
   * Floor to stack this modal from. Defaults to the shared stacking floor.
   * Pass a higher value to force the modal above content outside the overlay
   * ledger (e.g. injected 3rd-party widgets). Layering against other overlays
   * is still managed by OverlayStackingService.
   */
  baseZIndex?: number;
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

class ModalServiceClass {
  private presentation = new PresentationStore();
  private windowEvents = new ModalWindowEvents();
  private registry: ModalRegistry = {
    get: (id) => this.modalComponents.get(id),
    ids: () => [...this.modalComponents.keys()],
    forEach: (callback) => this.modalComponents.forEach(callback),
    close: (id) => this.modalComponents.get(id)?.props.close({ isOk: false }),
  };
  private stack = new BamStack(this.registry, this.presentation, this.windowEvents);
  private compactWindows = new CompactWindowManager(this.registry, this.stack, this.presentation, this.windowEvents);

  /** No initial event; read getActiveWindow()/getWindows() after subscribing. */
  subscribeWindowEvents(listener: (event: ModalWindowEvent) => void) {
    return this.windowEvents.subscribe(listener);
  }
  getWindows(): ModalWindow[] {
    return this.windowEvents.getWindows();
  }
  getWindow(id: string): ModalWindow | undefined {
    return this.windowEvents.getWindow(id);
  }
  getActiveWindow(): ModalWindow | null {
    return this.windowEvents.getActive();
  }
  /** Replace metadata on an already opted-in window, without changing its focus or presentation. */
  setWindowMetadata(id: string, metadata: ModalWindowMetadata) {
    this.windowEvents.setMetadata(id, metadata);
  }

  /** Scope interaction cleanup to its owner; omitted id retains the legacy shared control. */
  setCompactWindowInteracting(active: boolean, modalId = 'legacy') {
    this.compactWindows.setCompactWindowInteracting(active, modalId);
  }
  isCompactWindowInteracting() {
    return this.compactWindows.isCompactWindowInteracting();
  }
  /** Independent opt-in. Disabling discards custom geometry and restores the existing presentation. */
  setCompactWindowControlsEnabled(enabled: boolean) {
    this.compactWindows.setCompactWindowControlsEnabled(enabled);
  }
  isCompactWindowControlsEnabled() {
    return this.compactWindows.isCompactWindowControlsEnabled();
  }
  isCompactWindowDetached(id: string) {
    return this.compactWindows.isCompactWindowDetached(id);
  }
  /** Percentage of the smaller window covered before a drop can form a stack. */
  setCompactWindowDockThreshold(percentage: number) {
    this.compactWindows.setCompactWindowDockThreshold(percentage);
  }
  findCompactWindowDropTarget(id: string, candidates: { id: string; bounds: CompactWindowBounds }[], group = false) {
    return this.compactWindows.findCompactWindowDropTarget(id, candidates, group);
  }
  dockCompactWindow(id: string, candidates: { id: string; bounds: CompactWindowBounds }[], group = false) {
    this.compactWindows.dockCompactWindow(id, candidates, group);
  }
  getCompactWindowBounds(id: string) {
    return this.compactWindows.getCompactWindowBounds(id);
  }
  getCompactStackBounds(id?: string) {
    return this.compactWindows.getCompactStackBounds(id);
  }
  /** Viewport changes clamp geometry without changing stack membership. */
  fitCompactWindowToViewport(id: string) {
    this.compactWindows.fitCompactWindowToViewport(id);
  }
  setCompactWindowBounds(id: string, bounds: CompactWindowBounds, group = false) {
    this.compactWindows.setCompactWindowBounds(id, bounds, group);
  }
  focusCompactWindow(id: string) {
    this.compactWindows.focusCompactWindow(id);
  }
  returnCompactWindowToStack(id: string) {
    this.compactWindows.returnCompactWindowToStack(id);
  }
  stackAllCompactWindows() {
    this.compactWindows.stackAllCompactWindows();
  }

  /** All attached BAMs, or only the stack containing a specified BAM. */
  getStackedBamIds(modalId?: string) {
    return this.stack.getStackedBamIds(modalId);
  }
  /** Maximum attached BAMs. Omit/undefined/null restores unlimited stacking. */
  setMaxStackSize(max?: number | null) {
    this.stack.setMaxStackSize(max);
  }
  getMaxStackSize() {
    return this.stack.getMaxStackSize();
  }

  subscribePresentation = (listener: () => void) => this.presentation.subscribe(listener);
  getPresentationRevision = () => this.presentation.getRevision();

  private loadingModalId: null | string;
  private confirmModalId: null | string;
  private errorModalId: null | string;
  private modalCloseListeners: Map<string, { cbs: ((resp?: ModalResponse<any>) => void)[]; data: any }>;
  private modalComponents: Map<string, any>;

  constructor() {
    this.loadingModalId = null;
    this.confirmModalId = null;
    this.errorModalId = null;
    this.modalCloseListeners = new Map();
    this.modalComponents = new Map();
    this.stack.attachCompactWindows(this.compactWindows);
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
    this.stack.handleRemoved(id);
    this.modalComponents.delete(id);
    this.compactWindows.handleRemoved(id);
    OverlayStackingService.unregister(id);
    this.windowEvents.handleRemoved(id);
    this.presentation.notify();
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
    return this.open<ResponseModel>(component, opts);
  }

  openErrorModal = ({
    err,
    source,
    message,
    title,
    ctaPositive,
    onClose,
    replacements,
    errorCodes,
  }: {
    err?: any;
    source: string;
    message?: string;
    title?: string;
    ctaPositive?: (ModalFooterAction & SubButtonProps) | null;
    onClose?: () => void;
    replacements?: TextReplacements;
    errorCodes?: string[];
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
        replacements={replacements}
        errorCodes={errorCodes}
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

  /** Enable/disable the shared compact presentation for ALL fullscreen BAMs. */
  setCompactMode(enabled: boolean) {
    this.stack.setCompactMode(enabled);
  }
  /** Opt into the visual card stack. Disabled by default. */
  setStackingEnabled(enabled: boolean) {
    this.stack.setStackingEnabled(enabled);
  }
  isStackingEnabled() {
    return this.stack.isStackingEnabled();
  }
  /** Fullscreen Modal reports its actual presentation, even through consumer wrappers. */
  registerFullscreen(modalId: string, fullscreen: boolean) {
    this.stack.registerFullscreen(modalId, fullscreen);
  }
  getBamIds() {
    return this.stack.getBamIds();
  }
  /** Promote within the BAM stack; unrelated dialogs/drawers retain their overlay slots. */
  bringToFront(modalId: string) {
    this.stack.bringToFront(modalId);
  }
  /** Consumer control: compact the entire BAM group. */
  compact(modalId?: string | null) {
    this.stack.compact(modalId);
  }
  /** Consumer control: expand the entire BAM group. */
  expand(modalId?: string | null) {
    this.stack.expand(modalId);
  }

  /** @deprecated Use compact(modalId). */
  compactEv(modalId?: string | null) {
    this.compact(modalId);
  }

  /** @deprecated Use expand(modalId). */
  expandEv(modalId?: string | null) {
    this.expand(modalId);
  }

  /** Test-only: wipe internal state. Not for production code paths. */
  __resetForTests() {
    this.windowEvents.reset();
    this.stack.reset();
    this.compactWindows.reset();
    this.loadingModalId = null;
    this.confirmModalId = null;
    this.errorModalId = null;
    this.modalCloseListeners.clear();
    this.modalComponents.clear();
    OverlayStackingService.__resetForTests();
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

    const closeFn = (r?: ModalResponse<ResponseModel>) => {
      if (thisComponent.props.close) {
        thisComponent.props.close(r ?? ({ isOk: false } as ModalResponse<ResponseModel>));
      }
      this.closeEv(id, r);
    };

    const compactControls = opts?.allowCompact
      ? { compact: () => this.compact(id), expand: () => this.expand(id) }
      : {};

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
                ...compactControls,
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
      ...compactControls,
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
      isFullscreen: !!opts?.fullscreen,
      isCompact: this.stack.isCompactMode() && !!(opts?.fullscreen || opts?.allowCompact),
      compactManaged: this.stack.isCompactMode() && !!(opts?.fullscreen || opts?.allowCompact),
    });

    OverlayStackingService.register(id, 'modal', opts?.baseZIndex);
    if (opts?.windowMetadata !== undefined) {
      this.windowEvents.register(id, opts.windowMetadata);
    }

    pubSubService.$pub(PUB_SUB_EVENTS.reactModalOpen, {
      modalId: id,
      animation: opts?.animation || 'grow',
    });
    this.stack.enforceStackLimit();
    this.presentation.notify();
    this.windowEvents.syncActive('open');
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
