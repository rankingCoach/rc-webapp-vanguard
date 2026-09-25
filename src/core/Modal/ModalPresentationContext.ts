import { createContext } from 'react';

/** Presentation of the owning service modal, inherited without forwarding props through consumers. */
export const defaultModalPresentation = { allowCompact: false, isCompact: false, modalId: '', stacked: false, active: true };
export const ModalPresentationContext = createContext(defaultModalPresentation);
