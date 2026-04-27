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
  getModalOrder: (modalId: string) => number;
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
  const orderRef = useRef<Map<string, number>>(new Map());
  const orderCounterRef = useRef<number>(0);
  const [modalRootState, setModalRootState] = useState<ModalRootState>({
    growModals: [],
    slideModals: [],
    popModals: [],
  });

  const getModal = useCallback((modalId: string) => {
    return modalsRef.current.get(modalId);
  }, []);

  const getModalOrder = useCallback((modalId: string) => {
    return orderRef.current.get(modalId) ?? 0;
  }, []);

  const addModal = useCallback((modalId: string, animation: ModalTransition, component: any) => {
    modalsRef.current.set(modalId, component);
    if (!orderRef.current.has(modalId)) {
      orderCounterRef.current += 1;
      orderRef.current.set(modalId, orderCounterRef.current);
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
    orderRef.current.delete(modalId);

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
    getModalOrder,
  };

  return <ModalContext.Provider value={value}>{children}</ModalContext.Provider>;
};
