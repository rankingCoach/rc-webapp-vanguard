import { createContext } from 'react';

/** Presentation of the owning service modal, inherited without forwarding props through consumers. */
export const ModalPresentationContext = createContext({ allowCompact: false, isCompact: false, modalId: '', stacked: false, active: true });
