import { PUB_SUB_EVENTS, pubSubService } from '@helpers/pub-sub';
import { ModalResponse } from '@vanguard/Modal/ModalResponse';
import { OverlayStackingService } from '@vanguard/OverlayStacking/OverlayStackingService';
import React, { useEffect, useRef, useState } from 'react';

import { AllowedDrawerProps, Drawer, DrawerProps } from '../Drawer';
import { DrawerCloseResponse } from '../Drawer.types';
import { DrawerService } from '../DrawerService';
import styles from './DrawerRoot.module.scss';

export interface DrawerRootProps {
  padding?: string | number;
}

export const DrawerRoot = (props: DrawerRootProps) => {
  const { padding = '40px 48px' } = props;

  const defaultDrawerProps: AllowedDrawerProps = {
    variant: 'temporary',
  };

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [children, setChildren] = useState(null);
  const [drawerProps, setDrawerProps] = useState(defaultDrawerProps);
  // Z-index pulled from the shared stacking ledger so the drawer interleaves
  // correctly with modals/popovers. `undefined` keeps Drawer's static fallback
  // when no drawer is currently registered.
  const [zIndex, setZIndex] = useState<number | undefined>(undefined);
  const activeDrawerId = useRef<string | null>(null);

  const handleDrawerClose = (e?: ModalResponse<DrawerCloseResponse>) => {
    activeDrawerId.current && DrawerService.close(activeDrawerId.current);
  };

  useEffect(() => {
    /**
     * Open Drawer
     */
    pubSubService.$sub(
      PUB_SUB_EVENTS.reactDrawerOpen,
      ({ component, options, id }: { component: any; options?: DrawerProps; id: string }) => {
        // If a previous drawer is still registered (e.g. open→open without close),
        // free its slot before claiming a new one so the ledger doesn't leak.
        if (activeDrawerId.current && activeDrawerId.current !== id) {
          OverlayStackingService.unregister(activeDrawerId.current);
        }
        setZIndex(OverlayStackingService.register(id, 'drawer', options?.baseZIndex));
        setChildren(component);
        setDrawerProps({
          ...defaultDrawerProps,
          ...options,
        });
        activeDrawerId.current = id;
        setIsDrawerOpen(true);
      },
    );

    /**
     * Close Drawer
     */
    pubSubService.$sub(PUB_SUB_EVENTS.reactDrawerClose, ({ id }) => {
      if (id !== activeDrawerId.current) return;
      OverlayStackingService.unregister(id);
      activeDrawerId.current = null;
      setIsDrawerOpen(false);
    });
  }, []);

  // Caller-supplied zIndex in drawerProps still wins — only inject ours when
  // the consumer hasn't explicitly pinned the drawer to a layer.
  const resolvedZIndex = (drawerProps as { zIndex?: number }).zIndex ?? zIndex;

  return (
    <div data-testid="drawer-root" id="drawer-root">
      <Drawer open={isDrawerOpen} {...drawerProps} zIndex={resolvedZIndex} onClose={handleDrawerClose}>
        <div className={styles.drawerRootContentWrapper} style={{ padding }}>
          {children}
        </div>
      </Drawer>
    </div>
  );
};
