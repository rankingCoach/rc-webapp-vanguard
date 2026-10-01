import React, { useMemo } from 'react';
import { ModalOwnerPresentationContext, ModalPresentationContext } from '../../ModalPresentationContext';
import { ModalLifecycleContext } from '../../ModalLifecycleContext';
import { ModalService } from '../../ModalService';

const lifecycle = {
  registerFullscreen: (id: string, fullscreen: boolean) => ModalService.registerFullscreen(id, fullscreen),
  isManagedEscape: () => ModalService.isStackingEnabled() || ModalService.isCompactWindowControlsEnabled(),
};

// Geometry updates must not invalidate every modal consumer's context on each pointer frame.
export const ModalPresentation = ({ children, allowCompact, isCompact, modalId, stacked, active }:
  React.ContextType<typeof ModalPresentationContext> & { children: React.ReactNode }) => {
  const value = useMemo(() => ({ allowCompact, isCompact, modalId, stacked, active }),
    [allowCompact, isCompact, modalId, stacked, active]);
  return <ModalLifecycleContext.Provider value={lifecycle}>
    <ModalOwnerPresentationContext.Provider value={value}>
      <ModalPresentationContext.Provider value={value}>{children}</ModalPresentationContext.Provider>
    </ModalOwnerPresentationContext.Provider>
  </ModalLifecycleContext.Provider>;
};
