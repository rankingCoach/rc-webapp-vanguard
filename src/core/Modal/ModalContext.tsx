import { OverlayStackingService } from '@vanguard/OverlayStacking/OverlayStackingService';
import React, { createContext, ReactNode, useCallback, useContext, useRef, useState } from 'react';

import { ModalTransition } from './ModalRoot/ModalTransition/ModalTransition';

export type ModalState = Record<string, any>;

export type ModalRootState = {
  growModals: string[];
  slideModals: string[];
  popModals: string[];
};

interface ModalContextType {
  getModal: (modalId: string) => any;
  modalRootState: ModalRootState;
  addModal: (modalId: string, animation: ModalTransition, component: any) => void;
  removeModal: (modalId: string) => void;
  getModalZIndex: (modalId: string) => number;
  compactModals: Record<string, boolean>;
  setModalCompact: (modalId: string, isCompact: boolean) => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const useModalContext = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModalContext must be used within a ModalProvider');
  }
  return context;
};

interface ModalProviderProps {
  children: ReactNode;
}

export const ModalProvider: React.FC<ModalProviderProps> = ({ children }) => {
  // Use a ref to store components to avoid circular reference serialization issues
  const modalsRef = useRef<Map<string, any>>(new Map());
  const [compactModals, setCompactModals] = useState<Record<string, boolean>>({});
  const setModalCompact = useCallback((modalId: string, isCompact: boolean) => {
    if (!modalsRef.current.has(modalId)) return;
    setCompactModals((prev) => ({ ...prev, [modalId]: isCompact }));
  }, []);
  const [modalRootState, setModalRootState] = useState<ModalRootState>({
    growModals: [],
    slideModals: [],
    popModals: [],
  });

  const getModal = useCallback((modalId: string) => {
    return modalsRef.current.get(modalId);
  }, []);

  const getModalZIndex = useCallback((modalId: string) => {
    return OverlayStackingService.getZIndex(modalId);
  }, []);

  const addModal = useCallback((modalId: string, animation: ModalTransition, component: any) => {
    modalsRef.current.set(modalId, component);
    if (component?.isCompact) {
      setCompactModals((prev) => ({ ...prev, [modalId]: true }));
    }

    setModalRootState((prev) => {
      const newState = { ...prev };
      const addModalToArr = (arr: string[], modal: string) => {
        if (arr.indexOf(modal) >= 0) {
          return;
        }
        arr.push(modal);
      };

      switch (animation) {
        case 'grow':
          addModalToArr(newState.growModals, modalId);
          break;
        case 'slide':
          addModalToArr(newState.slideModals, modalId);
          break;
        case 'pop':
          addModalToArr(newState.popModals, modalId);
          break;
        default:
          addModalToArr(newState.growModals, modalId);
          console.warn(
            `Modal with id: ${modalId} was asked to be opened with animation: ${animation} which is not supported.`,
          );
      }
      return newState;
    });
  }, []);

  const removeModal = useCallback((modalId: string) => {
    modalsRef.current.delete(modalId);
    setCompactModals((prev) => {
      if (!(modalId in prev)) return prev;
      const next = { ...prev };
      delete next[modalId];
      return next;
    });

    setModalRootState((prev) => ({
      growModals: prev.growModals.filter((id) => id !== modalId),
      slideModals: prev.slideModals.filter((id) => id !== modalId),
      popModals: prev.popModals.filter((id) => id !== modalId),
    }));
  }, []);

  const value: ModalContextType = {
    getModal,
    modalRootState,
    addModal,
    removeModal,
    getModalZIndex,
    compactModals,
    setModalCompact,
  };

  return <ModalContext.Provider value={value}>{children}</ModalContext.Provider>;
};
