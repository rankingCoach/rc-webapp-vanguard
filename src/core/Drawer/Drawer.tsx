import React, { PropsWithChildren, useEffect, useLayoutEffect, useRef, useState } from 'react';
import styles from './Drawer.module.scss';
import DrawerBase, { DrawerProps as DrawerBaseProps } from '@mui/material/Drawer';
import { ModalResponse } from '@vanguard/Modal/ModalResponse';
import { DrawerCloseResponse } from './Drawer.types';
import { Button, ButtonSizes, ButtonTypes } from '@vanguard/Button/Button';
import { IconNames } from '@vanguard/Icon/IconNames';
import classNames from 'classnames';
import { Header, HeaderTypes } from '@vanguard/Header/Header';

export type AllowedDrawerProps = Pick<DrawerBaseProps, 'hideBackdrop' | 'variant' | 'anchor'> & {
  showCloseButton?: boolean;
};

export enum AnchorTypes {
  left = 'left',
  top = 'top',
  right = 'right',
  bottom = 'bottom',
}

export interface DrawerProps extends AllowedDrawerProps {
  open?: boolean;
  title?: string;
  description?: string;
  isHeaderCompact?: boolean;
  isHeaderSticky?: boolean;
  //TODO Implement me
  outOfTheWay?: number | false; // Accepts percentage (0-100) or false
  onClose?: (e?: ModalResponse<DrawerCloseResponse>) => void;
  /**
   * @deprecated Layering is managed by OverlayStackingService — drawers
   * auto-stack against modals and popovers through a shared ledger. Passing
   * a fixed value here forces the drawer onto a static layer and breaks the
   * stacking guarantees. Leave it unset.
   */
  zIndex?: number;
  /**
   * Floor to stack this drawer from. Defaults to the shared stacking floor.
   * Pass a higher value to force the drawer above content outside the overlay
   * ledger (e.g. injected 3rd-party widgets) while still interleaving with
   * other overlays. Prefer this over `zIndex`, which pins a static layer.
   */
  baseZIndex?: number;
}

export const Drawer = (props: PropsWithChildren<DrawerProps>) => {
  const {
    open = false,
    anchor = AnchorTypes.right,
    title,
    description,
    isHeaderCompact = false,
    isHeaderSticky = false,
    onClose,
    children,
    hideBackdrop,
    variant = 'persistent',
    zIndex,
    showCloseButton = false,
  } = props;
  const transitionDuration = 400;

  return (
    <DrawerBase
      anchor={anchor}
      transitionDuration={transitionDuration}
      hideBackdrop={hideBackdrop}
      open={open}
      variant={variant}
      sx={zIndex !== undefined ? { zIndex } : { zIndex: 1099 }}
      ModalProps={{
        hideBackdrop: hideBackdrop,
        BackdropProps: {
          invisible: !!hideBackdrop,
        },
        style: zIndex !== undefined ? { zIndex } : undefined,
        // The drawer is a side panel, not a blocking dialog — we layer modals
        // and popovers on top of it. MUI's default FocusTrap yanks focus back
        // into the drawer whenever an input on a higher overlay receives it,
        // which makes those inputs untypable. Turn enforcement off so focus
        // can rest where the user puts it.
        disableEnforceFocus: true,
      }}
      onClose={(event, reason) =>
        onClose &&
        onClose({
          isOk: false,
          data: {
            reason: reason,
          },
        })
      }
    >
      <div className={classNames(styles.drawer, anchor === AnchorTypes.right ? styles.right : styles.left)}>
        <div className={classNames(isHeaderSticky ? styles.headerSticky : undefined, styles.headerContainer)}>
          <div className={styles.closeButton}>
            {showCloseButton ? (
              <Button type={ButtonTypes.muted} size={ButtonSizes.medium} icon={IconNames.close} onClick={onClose} />
            ) : null}
          </div>
          {title ? (
            <div className={classNames(styles.header, isHeaderCompact ? styles.compact : undefined)}>
              <Header
                title={title}
                description={description}
                type={isHeaderCompact ? HeaderTypes.compactDrawerHeader : HeaderTypes.drawerHeader}
              />
            </div>
          ) : null}
        </div>
        <div className={styles.drawerContent}>{children}</div>
      </div>
    </DrawerBase>
  );
};
