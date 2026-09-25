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
import { modalLayout } from './modal-layout';

export type CompactWindowBounds = { x: number; y: number; width: number; height: number };

/** Keep the whole window reachable, including on viewports smaller than its preferred minimum. */
export const clampCompactWindowBounds = (bounds: CompactWindowBounds, viewportWidth: number, viewportHeight: number): CompactWindowBounds => {
  const width = Math.min(viewportWidth, Math.max(Math.min(modalLayout.minWidth, viewportWidth), bounds.width));
  const height = Math.min(viewportHeight, Math.max(Math.min(modalLayout.minHeight, viewportHeight), bounds.height));
  return { width, height, x: Math.max(0, Math.min(bounds.x, viewportWidth - width)), y: Math.max(0, Math.min(bounds.y, viewportHeight - height)) };
};

export type ComponentWithId = any;

/** Opaque consumer-owned values. Vanguard never reads or navigates a route. */
export type ModalWindowMetadata = Readonly<Record<string, unknown>>;
export type ModalWindow = Readonly<{ id: string; metadata: ModalWindowMetadata }>;
export type ModalWindowEvent =
  | { type: 'activated'; window: ModalWindow; previousWindowId: string | null; reason: 'open' | 'focus' | 'dock' | 'close' }
  | { type: 'closed'; window: ModalWindow; wasActive: boolean; activeWindow: ModalWindow | null }
  | { type: 'metadataChanged'; window: ModalWindow; isActive: boolean };

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
  private windows = new Map<string, ModalWindow>();
  private activeWindowId: string | null = null;
  private windowListeners = new Set<(event: ModalWindowEvent) => void>();

  /** No initial event; read getActiveWindow()/getWindows() after subscribing. */
  subscribeWindowEvents(listener: (event: ModalWindowEvent) => void) {
    this.windowListeners.add(listener);
    return () => { this.windowListeners.delete(listener); };
  }

  getWindows(): ModalWindow[] { return [...this.windows.values()]; }
  getWindow(id: string): ModalWindow | undefined { return this.windows.get(id); }
  getActiveWindow(): ModalWindow | null { return this.activeWindowId ? this.windows.get(this.activeWindowId) ?? null : null; }

  /** Replace metadata on an already opted-in window, without changing its focus or presentation. */
  setWindowMetadata(id: string, metadata: ModalWindowMetadata) {
    if (!this.windows.has(id)) return;
    const modalWindow = Object.freeze({ id, metadata: Object.freeze({ ...metadata }) });
    this.windows.set(id, modalWindow);
    this.emitWindowEvent({ type: 'metadataChanged', window: modalWindow, isActive: id === this.activeWindowId });
  }

  private emitWindowEvent(event: ModalWindowEvent) {
    for (const listener of [...this.windowListeners]) {
      try { listener(event); } catch (error) { console.error('Modal window listener failed', error); }
    }
  }

  private syncActiveWindow(reason: Extract<ModalWindowEvent, { type: 'activated' }>['reason']) {
    if (!this.windows.size && this.activeWindowId === null) return;
    const modalWindow = [...this.windows.values()].sort((a, b) => OverlayStackingService.getZIndex(b.id) - OverlayStackingService.getZIndex(a.id))[0];
    const previousWindowId = this.activeWindowId;
    this.activeWindowId = modalWindow?.id ?? null;
    if (modalWindow && previousWindowId !== modalWindow.id) this.emitWindowEvent({ type: 'activated', window: modalWindow, previousWindowId, reason });
  }
  private compactMode = false;
  private compactWindowControlsEnabled = false;
  private interactingCompactWindows = new Set<string>();
  /** Scope interaction cleanup to its owner; omitted id retains the legacy shared control. */
  setCompactWindowInteracting(active: boolean, modalId = 'legacy') {
    if (!this.compactWindowControlsEnabled) return;
    const wasInteracting = this.isCompactWindowInteracting();
    if (active) this.interactingCompactWindows.add(modalId);
    else this.interactingCompactWindows.delete(modalId);
    if (wasInteracting !== this.isCompactWindowInteracting()) this.notifyPresentation();
  }
  isCompactWindowInteracting() { return this.interactingCompactWindows.size > 0; }
  private floatingWindows = new Map<string, CompactWindowBounds>();
  // Unassigned BAMs belong to the original stack; docked groups have their own identity.
  private compactWindowGroups = new Map<string, string>();
  private compactStackBounds = new Map<string, CompactWindowBounds>();
  private compactGroupKey(id?: string) {
    return id ? this.compactWindowGroups.get(id) ?? 'default' : 'default';
  }

  private pruneCompactGroups() {
    const used = new Set(this.compactWindowGroups.values());
    for (const key of this.compactStackBounds.keys()) {
      if (key !== 'default' && !used.has(key)) this.compactStackBounds.delete(key);
    }
  }

  /** Independent opt-in. Disabling discards custom geometry and restores the existing presentation. */
  setCompactWindowControlsEnabled(enabled: boolean) {
    if (this.compactWindowControlsEnabled === enabled) return;
    this.compactWindowControlsEnabled = enabled;
    if (!enabled) {
      this.interactingCompactWindows.clear();
      this.floatingWindows.clear();
      this.compactStackBounds.clear();
      this.compactWindowGroups.clear();
    }
    this.enforceStackLimit();
    this.notifyPresentation();
  }

  isCompactWindowControlsEnabled() { return this.compactWindowControlsEnabled; }

  private canManageCompactWindow(id: string) {
    const component = this.modalComponents.get(id);
    return this.compactWindowControlsEnabled && !!component?.isCompact && !!component?.isFullscreen;
  }

  isCompactWindowDetached(id: string) {
    return this.canManageCompactWindow(id) && this.floatingWindows.has(id);
  }

  private compactWindowDockThreshold = 50;

  /** Percentage of the smaller window covered before a drop can form a stack. */
  setCompactWindowDockThreshold(percentage: number) {
    if (Number.isFinite(percentage) && percentage > 0 && percentage <= 100) this.compactWindowDockThreshold = percentage;
  }

  findCompactWindowDropTarget(id: string, candidates: { id: string; bounds: CompactWindowBounds }[], group = false) {
    if (!this.canManageCompactWindow(id)) return undefined;
    if (group && (!this.stackingEnabled || this.isCompactWindowDetached(id))) return undefined;
    const source = group ? this.getCompactStackBounds(id) : this.floatingWindows.get(id);
    const members = new Set(group ? this.getStackedBamIds(id) : [id]);
    if (!source) return undefined;
    return candidates.filter((candidate) => {
      if (members.has(candidate.id) || !this.canManageCompactWindow(candidate.id)) return false;
      const target = candidate.bounds;
      const overlap = Math.max(0, Math.min(source.x + source.width, target.x + target.width) - Math.max(source.x, target.x)) *
        Math.max(0, Math.min(source.y + source.height, target.y + target.height) - Math.max(source.y, target.y));
      const area = Math.min(source.width * source.height, target.width * target.height);
      return area > 0 && overlap / area >= this.compactWindowDockThreshold / 100;
    }).sort((a, b) => OverlayStackingService.getZIndex(b.id) - OverlayStackingService.getZIndex(a.id))[0];
  }

  dockCompactWindow(id: string, candidates: { id: string; bounds: CompactWindowBounds }[], group = false) {
    const target = this.findCompactWindowDropTarget(id, candidates, group);
    if (!target) return;
    const sourceMembers = group ? this.getStackedBamIds(id) : [id];
    const targetIsStacked = this.stackingEnabled && !this.isCompactWindowDetached(target.id);
    const targetMembers = targetIsStacked ? this.getStackedBamIds(target.id) : [target.id];
    const groupKey = targetIsStacked ? this.compactGroupKey(target.id) : uuidv4();
    const targetBounds = targetIsStacked ? this.getCompactStackBounds(target.id) : target.bounds;

    if (!this.stackingEnabled) {
      // Independent windows not participating in the drop must stay independent.
      for (const candidate of candidates) {
        if (!sourceMembers.includes(candidate.id) && !targetMembers.includes(candidate.id) && this.canManageCompactWindow(candidate.id)) {
          this.floatingWindows.set(candidate.id, candidate.bounds);
          this.compactWindowGroups.delete(candidate.id);
        }
      }
    }
    const combined = [...targetMembers, ...sourceMembers];
    for (const member of combined) {
      this.floatingWindows.delete(member);
      this.compactWindowGroups.set(member, groupKey);
    }
    if (targetBounds) this.compactStackBounds.set(groupKey, clampCompactWindowBounds(targetBounds, window.innerWidth, window.innerHeight));
    this.stackingEnabled = true;
    // Only the participating windows change slots; other stacks keep their order and geometry.
    OverlayStackingService.reorder(combined);
    this.syncActiveWindow('dock');
    this.pruneCompactGroups();
    this.enforceStackLimit();
    this.notifyPresentation();
  }

  getCompactWindowBounds(id: string) { return this.floatingWindows.get(id); }
  getCompactStackBounds(id?: string) { return this.compactStackBounds.get(this.compactGroupKey(id)); }

  /** Viewport changes clamp geometry without changing stack membership. */
  fitCompactWindowToViewport(id: string) {
    if (!this.canManageCompactWindow(id)) return;
    const floating = this.floatingWindows.get(id);
    const key = this.compactGroupKey(id);
    const bounds = floating ?? this.compactStackBounds.get(key);
    if (bounds) {
      const fitted = clampCompactWindowBounds(bounds, window.innerWidth, window.innerHeight);
      if (floating) this.floatingWindows.set(id, fitted);
      else this.compactStackBounds.set(key, fitted);
    }
    this.notifyPresentation();
  }

  setCompactWindowBounds(id: string, bounds: CompactWindowBounds, group = false) {
    if (!this.canManageCompactWindow(id) || !Object.values(bounds).every(Number.isFinite)) return;
    const next = clampCompactWindowBounds(bounds, window.innerWidth, window.innerHeight);
    if (group && this.stackingEnabled && !this.floatingWindows.has(id)) this.compactStackBounds.set(this.compactGroupKey(id), next);
    else {
      this.floatingWindows.set(id, next);
      this.compactWindowGroups.delete(id);
      this.pruneCompactGroups();
    }
    this.notifyPresentation();
  }

  focusCompactWindow(id: string) {
    if (!this.canManageCompactWindow(id)) return;
    const ids = this.getBamIds();
    const members = this.stackingEnabled && !this.isCompactWindowDetached(id) ? this.getStackedBamIds(id) : [id];
    const next = [...ids.filter((other) => !members.includes(other)), ...members.filter((other) => other !== id), id];
    if (next.every((other, index) => ids[index] === other)) return;
    OverlayStackingService.reorder(next);
    this.syncActiveWindow('focus');
    this.notifyPresentation();
  }

  returnCompactWindowToStack(id: string) {
    if (!this.canManageCompactWindow(id)) return;
    this.floatingWindows.delete(id);
    this.compactWindowGroups.delete(id);
    this.pruneCompactGroups();
    this.stackingEnabled = true;
    this.focusCompactWindow(id);
    this.enforceStackLimit();
    this.notifyPresentation();
  }

  stackAllCompactWindows() {
    if (!this.compactWindowControlsEnabled || !this.compactMode) return;
    this.floatingWindows.clear();
    this.compactWindowGroups.clear();
    this.pruneCompactGroups();
    this.stackingEnabled = true;
    this.enforceStackLimit();
    this.notifyPresentation();
  }

  /** All attached BAMs, or only the stack containing a specified BAM. */
  getStackedBamIds(modalId?: string) {
    const ids = this.getBamIds().filter((id) => !this.isCompactWindowDetached(id));
    if (!modalId || !this.compactWindowControlsEnabled || !this.compactMode) return ids;
    if (this.isCompactWindowDetached(modalId)) return [];
    const key = this.compactGroupKey(modalId);
    return ids.filter((id) => this.compactGroupKey(id) === key);
  }

  private maxStackSize: number | undefined;
  private stackEvictions = new Set<string>();

  /** Maximum attached BAMs. Omit/undefined/null restores unlimited stacking. */
  setMaxStackSize(max?: number | null) {
    if (max != null && (!Number.isInteger(max) || max < 1)) {
      throw new RangeError('Maximum BAM stack size must be a positive integer.');
    }
    this.maxStackSize = max ?? undefined;
    this.enforceStackLimit();
  }

  getMaxStackSize() { return this.maxStackSize; }

  private enforceStackLimit() {
    if (!this.stackingEnabled || this.maxStackSize === undefined) return;
    const ids = this.getStackedBamIds().filter((id) => !this.stackEvictions.has(id));
    const groups = new Map<string, string[]>();
    for (const id of ids) {
      const key = this.compactWindowControlsEnabled && this.compactMode ? this.compactGroupKey(id) : 'default';
      const members = groups.get(key) ?? [];
      members.push(id);
      groups.set(key, members);
    }
    const closing = [...groups.values()].flatMap((members) => members.slice(0, Math.max(0, members.length - this.maxStackSize!)));
    // Reserve the entire batch before callbacks, which may themselves open windows.
    closing.forEach((id) => this.stackEvictions.add(id));
    for (const id of closing) {
      this.modalComponents.get(id)?.props.close({ isOk: false });
    }
  }

  private stackingEnabled = false;
  private presentationListeners = new Set<() => void>();
  private presentationRevision = 0;

  subscribePresentation = (listener: () => void) => {
    this.presentationListeners.add(listener);
    return () => { this.presentationListeners.delete(listener); };
  };

  getPresentationRevision = () => this.presentationRevision;

  private notifyPresentation() {
    this.presentationRevision++;
    this.presentationListeners.forEach((listener) => listener());
  }

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
    const closedWindow = this.windows.get(id);
    const wasActive = this.activeWindowId === id;
    this.stackEvictions.delete(id);
    this.modalComponents.delete(id);
    this.interactingCompactWindows.delete(id);
    this.floatingWindows.delete(id);
    this.compactWindowGroups.delete(id);
    this.pruneCompactGroups();
    OverlayStackingService.unregister(id);
    this.windows.delete(id);
    if (closedWindow) {
      // Close first, then announce any replacement. The close event already carries
      // the replacement so consumers never need to clear the URL between windows.
      const activeWindow = [...this.windows.values()].sort((a, b) => OverlayStackingService.getZIndex(b.id) - OverlayStackingService.getZIndex(a.id))[0] ?? null;
      this.activeWindowId = activeWindow?.id ?? null;
      this.emitWindowEvent({ type: 'closed', window: closedWindow, wasActive, activeWindow });
      if (wasActive && activeWindow && this.activeWindowId === activeWindow.id) {
        this.emitWindowEvent({ type: 'activated', window: activeWindow, previousWindowId: id, reason: 'close' });
      }
    }
    this.notifyPresentation();
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
    this.compactMode = enabled;
    this.modalComponents.forEach((component, id) => {
      if (component.isFullscreen || component.props.allowCompact) this.setCompact(id, enabled);
    });
    this.enforceStackLimit();
    this.notifyPresentation();
  }

  /** Opt into the visual card stack. Disabled by default. */
  setStackingEnabled(enabled: boolean) {
    this.stackingEnabled = enabled;
    this.enforceStackLimit();
    this.notifyPresentation();
  }

  isStackingEnabled() { return this.stackingEnabled; }

  /** Fullscreen Modal reports its actual presentation, even through consumer wrappers. */
  registerFullscreen(modalId: string, fullscreen: boolean) {
    const component = this.modalComponents.get(modalId);
    if (!component || component.isFullscreen === fullscreen) return;
    component.isFullscreen = fullscreen;
    if (fullscreen && this.compactMode) this.setCompact(modalId, true);
    if (!fullscreen && !component.props.allowCompact) this.setCompact(modalId, false);
    this.enforceStackLimit();
    this.notifyPresentation();
  }

  getBamIds() {
    return [...this.modalComponents.keys()]
      .filter((id) => this.modalComponents.get(id)?.isFullscreen)
      .sort((a, b) => OverlayStackingService.getZIndex(a) - OverlayStackingService.getZIndex(b));
  }

  /** Promote within the BAM stack; unrelated dialogs/drawers retain their overlay slots. */
  bringToFront(modalId: string) {
    if (!this.stackingEnabled) return;
    if (this.canManageCompactWindow(modalId)) {
      this.focusCompactWindow(modalId);
      return;
    }
    const ids = this.getBamIds();
    if (!ids.includes(modalId) || ids.at(-1) === modalId) return;
    OverlayStackingService.reorder([...ids.filter((id) => id !== modalId), modalId]);
    this.syncActiveWindow('focus');
    this.notifyPresentation();
  }

  /** Consumer control: compact the entire BAM group. */
  compact(modalId?: string | null) {
    if (modalId && this.modalComponents.get(modalId)?.props.allowCompact) this.setCompactMode(true);
  }

  /** Consumer control: expand the entire BAM group. */
  expand(modalId?: string | null) {
    if (modalId && this.modalComponents.get(modalId)?.props.allowCompact) this.setCompactMode(false);
  }

  /** @deprecated Use compact(modalId). */
  compactEv(modalId?: string | null) { this.compact(modalId); }

  /** @deprecated Use expand(modalId). */
  expandEv(modalId?: string | null) { this.expand(modalId); }

  private setCompact(modalId: string, isCompact: boolean) {
    const component = this.modalComponents.get(modalId);
    if (!component || Boolean(component.isCompact) === isCompact) return;
    component.compactManaged = true;
    component.isCompact = isCompact;
    pubSubService.$pub(PUB_SUB_EVENTS.reactModalCompactChange, { modalId, isCompact });
  }

  /** Test-only: wipe internal state. Not for production code paths. */
  __resetForTests() {
    this.windows.clear();
    this.activeWindowId = null;
    this.windowListeners.clear();
    this.maxStackSize = undefined;
    this.stackEvictions.clear();
    this.compactMode = false;
    this.compactWindowControlsEnabled = false;
    this.compactWindowDockThreshold = 50;
    this.interactingCompactWindows.clear();
    this.floatingWindows.clear();
    this.compactStackBounds.clear();
    this.compactWindowGroups.clear();
    this.stackingEnabled = false;
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
      isCompact: this.compactMode && !!(opts?.fullscreen || opts?.allowCompact),
      compactManaged: this.compactMode && !!(opts?.fullscreen || opts?.allowCompact),
    });

    OverlayStackingService.register(id, 'modal', opts?.baseZIndex);
    if (opts?.windowMetadata !== undefined) {
      this.windows.set(id, Object.freeze({ id, metadata: Object.freeze({ ...opts.windowMetadata }) }));
    }

    pubSubService.$pub(PUB_SUB_EVENTS.reactModalOpen, {
      modalId: id,
      animation: opts?.animation || 'grow',
    });
    this.enforceStackLimit();
    this.notifyPresentation();
    this.syncActiveWindow('open');
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
