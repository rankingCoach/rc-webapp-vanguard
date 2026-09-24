import './ModalRoot.scss';

import { PUB_SUB_EVENTS, pubSubService } from '@helpers/pub-sub';
import { IconNames } from '@vanguard/Icon/IconNames';
import { ModalFooterAction, SubButtonProps } from '@vanguard/Modal/ModalFooter/ModalFooter';
import { ModalType } from '@vanguard/Modal/Modalheader/ModalHeader';
import { useGetModals } from '@vanguard/Modal/ModalRoot/use-get-modals';
import React, { Dispatch, SetStateAction, useEffect, useRef, useSyncExternalStore } from 'react';

import { useModalContext } from '../ModalContext';
import { ModalResponse } from '../ModalResponse';
import { ModalService } from '../ModalService';
import { ModalTransition } from './ModalTransition/ModalTransition';

export type ModalState = Record<string, any>;
export type ModalResponseHandler<T> = (r: ModalResponse<T>) => void;
export type StandardModalProps<T> = {
  close: ModalResponseHandler<T>;
  /** Injected only when ModalService.open opts into allowCompact. */
  compact?: () => void;
  /** Restore the original presentation without losing component state. */
  expand?: () => void;
  message?: string | React.ReactNode;
  title?: string;
  negativeCtaText?: string;
  positiveCtaText?: string;
  positiveIconLeft?: IconNames;
  ctaNegative?: (ModalFooterAction & SubButtonProps) | null;
  ctaPositive?: (ModalFooterAction & SubButtonProps) | null;
  ctaPosition?: 'start' | 'end' | 'between' | 'center';
  headerType?: ModalType;
  hideHeaderCloseBtn?: boolean;
  customNegativeFn?: (change?: Dispatch<SetStateAction<number>>) => void;
};

export const ModalRoot = () => {
  const { modalRootState, addModal, removeModal, setModalCompact } = useModalContext();
  useSyncExternalStore(ModalService.subscribePresentation, ModalService.getPresentationRevision, ModalService.getPresentationRevision);
  const subscriptionsRef = useRef<any[]>([]);

  const { growModals, slideModals, popModals } = useGetModals(modalRootState);
  const hasBlockingModal = [...growModals, ...slideModals, ...popModals].some((id) => !ModalService.getModalComponent(id)?.isCompact);

  useEffect(() => {
    // Clean up previous subscriptions
    subscriptionsRef.current.forEach((sub) => sub?.unsubscribe());
    subscriptionsRef.current = [];

    /**
     * Open Modal
     */
    const openSub = pubSubService.$sub(PUB_SUB_EVENTS.reactModalOpen, ({ modalId, animation }) => {
      const component = ModalService.getModalComponent(modalId);
      addModal(modalId, animation, component);
    });

    /**
     * Close Modal
     */
    const closeSub = pubSubService.$sub(PUB_SUB_EVENTS.reactModalClose, ({ modalId }) => {
      removeModal(modalId);
    });

    const compactSub = pubSubService.$sub(PUB_SUB_EVENTS.reactModalCompactChange, ({ modalId, isCompact }) => {
      setModalCompact(modalId, isCompact);
    });

    subscriptionsRef.current = [openSub, closeSub, compactSub];

    return () => {
      subscriptionsRef.current.forEach((sub) => sub?.unsubscribe());
      subscriptionsRef.current = [];
    };
  }, [addModal, removeModal, setModalCompact]);

  /**
   * Handle no scroll on page body
   */
  useEffect(() => {
    if (hasBlockingModal) {
      document.body.style.marginRight = `${window.innerWidth - document.body.offsetWidth}px`;
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.marginRight = '';
      document.body.style.overflow = '';
    }
  }, [hasBlockingModal]);

  /**
   * Return View
   * ---
   */
  return (
    <div data-testid={'modal-root'} id={'modals-storage'}>
      <ModalTransition modalsList={slideModals} animation={'slide'} />
      <ModalTransition modalsList={growModals} animation={'grow'} />
      <ModalTransition modalsList={popModals} animation={'pop'} />
    </div>
  );
};
