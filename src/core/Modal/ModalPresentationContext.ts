import { createContext } from 'react';

/** Presentation of the owning service modal, inherited without forwarding props through consumers. */
export const defaultModalPresentation = { allowCompact: false, isCompact: false, modalId: '', stacked: false, active: true };
export const ModalPresentationContext = createContext(defaultModalPresentation);

/**
 * Same value, but never reset by Modal: content (and nested inline modals) inside a service modal
 * still read the owning window's presentation. Modal itself must keep reading ModalPresentationContext.
 */
export const ModalOwnerPresentationContext = createContext(defaultModalPresentation);
