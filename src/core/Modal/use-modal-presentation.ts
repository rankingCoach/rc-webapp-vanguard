import { useContext, useMemo } from 'react';

import { ModalOwnerPresentationContext } from './ModalPresentationContext';

export type ModalPresentationState = {
  /** Owning service modal; '' outside one. */
  modalId: string;
  /** False for rear stacked cards and background tabs; always true outside a service modal. */
  presented: boolean;
  isCompact: boolean;
  stacked: boolean;
};

/**
 * Presentation of the service modal rendering the caller, usable anywhere inside it (including inside <Modal>).
 * Same rule as ModalService.isModalPresented(modalId).
 */
export const useModalPresentation = (): ModalPresentationState => {
  const { modalId, isCompact, stacked, active } = useContext(ModalOwnerPresentationContext);
  return useMemo(() => ({ modalId, presented: !stacked || active, isCompact, stacked }), [modalId, isCompact, stacked, active]);
};
