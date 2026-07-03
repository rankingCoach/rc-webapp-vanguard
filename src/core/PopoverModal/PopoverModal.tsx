import { Popper } from '@mui/material';
import Backdrop from '@mui/material/Backdrop';
import React, { useEffect, useRef, useState } from 'react';

import { uuidv4 } from '@helpers/generate-uid';
import { OverlayStackingService } from '@vanguard/OverlayStacking/OverlayStackingService';

import styles from './PopoverModal.module.scss';

/**
 * Top navigation has 1030 so we need at least that
 * This can be modified if we fin any other exceptions
 * */
const Z_INDEX_TO_APPEAR_ABOVE_ALL_ELEMENTS = 1030;

export interface PopoverModalProps {
  content: React.ReactNode;
  placement?: 'top' | 'auto' | 'bottom';
  isOpen: boolean;
  centerPopover?: boolean;
  openOnHover?: boolean;
  dimRestOfPage?: boolean;
  anchorEl?: HTMLDivElement | HTMLElement | null;
  onClose?: () => void;
  disableBackdropClick?: boolean;
  zIndex?: number;
  renderInPortal?: boolean;
}

export const PopoverModal = (props: PopoverModalProps) => {
  const {
    content,
    isOpen,
    openOnHover,
    dimRestOfPage = false,
    onClose,
    disableBackdropClick = false,
    zIndex = 0, // default zIndex value
    centerPopover,
    placement = 'top',
    renderInPortal = false,
  } = props;

  const [anchorEl, setAnchorEl] = useState<null | HTMLDivElement | HTMLElement>(props.anchorEl ?? null);
  const [offset, setOffset] = useState<[number, number]>([0, 0]);
  const containerRef = useRef<HTMLElement | null>(null);

  /**
   * Popper stacking (same pattern as Popover / the Select dropdown in InputBase): the popper portals to
   * <body> with only a static z-index, so inside a stacked modal/drawer (e.g. a widget opened with a raised
   * baseZIndex) it paints *behind* the surface that opened it. Register a 'popover' slot while open and
   * release it on close/unmount; the resolved slot z participates in the OverlayStackingService ledger and
   * therefore stacks above whatever modal/drawer is currently topmost.
   */
  const popperIdRef = useRef<string>(`popover-modal-${uuidv4()}`);
  const [stackZIndex, setStackZIndex] = useState<number | null>(null);

  useEffect(() => {
    setAnchorEl(props.anchorEl ?? null);
  }, [props.anchorEl]);

  useEffect(() => {
    if (anchorEl && containerRef.current) {
      const anchorHeight = anchorEl.getBoundingClientRect().height;
      const containerHeight = containerRef.current.getBoundingClientRect().height;
      setOffset([0, -anchorHeight / 2 - containerHeight / 2]);
    }
  }, [anchorEl, content]);

  const handleMouseEnter = (event: React.MouseEvent<HTMLElement>) => {
    if (openOnHover && !isOpen) {
      setAnchorEl(event.currentTarget);
    }
  };

  const handleMouseLeave = () => {
    if (openOnHover && !isOpen) {
      setAnchorEl(null);
    }
  };

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    if (!openOnHover && !isOpen) {
      setAnchorEl(anchorEl ? null : event.currentTarget);
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
    if (onClose) {
      onClose();
    }
  };

  const handleBackdropMouseDown = (event: React.MouseEvent) => {
    if (!disableBackdropClick) {
      handleClose();
    }
    event.stopPropagation();
  };

  const centerPopoverModifiers = centerPopover
    ? [
        {
          name: 'flip',
          options: {
            altBoundary: true,
            rootBoundary: 'viewport',
            padding: 8,
          },
        },
        {
          name: 'preventOverflow',
          options: {
            altAxis: true,
            tether: true,
          },
        },
        {
          name: 'offset',
          options: {
            offset: offset,
          },
        },
        {
          name: 'computeStyles',
          options: {
            gpuAcceleration: false,
          },
        },
      ]
    : [];

  const open = isOpen || Boolean(anchorEl);

  useEffect(() => {
    if (open) {
      setStackZIndex(OverlayStackingService.register(popperIdRef.current, 'popover'));
    } else {
      OverlayStackingService.unregister(popperIdRef.current);
      setStackZIndex(null);
    }
  }, [open]);
  // Release the slot if the popover unmounts while still open.
  useEffect(() => () => OverlayStackingService.unregister(popperIdRef.current), []);

  // The ledger slot wins when something below raised the stacking floor (e.g. a widget modal with a huge
  // baseZIndex); the legacy `zIndex + 1030` floor is kept so existing callers keep their guaranteed minimum.
  const popperZIndex = Math.max(zIndex + Z_INDEX_TO_APPEAR_ABOVE_ALL_ELEMENTS + 1, stackZIndex ?? 0);

  if (!anchorEl) {
    return null;
  }
  return (
    <>
      {dimRestOfPage && (
        <Backdrop
          open={open}
          className={styles.backdrop}
          onMouseDown={handleBackdropMouseDown}
          sx={{ zIndex: popperZIndex - 1 }}
        />
      )}
      <Popper
        open={open}
        anchorEl={anchorEl}
        placement={placement}
        disablePortal={!renderInPortal}
        style={{ zIndex: popperZIndex }} // Set z-index higher than backdrop
        modifiers={[...centerPopoverModifiers]}
      >
        <span ref={containerRef} style={{ position: 'relative', zIndex: zIndex + 1 }}>
          {content}
        </span>
      </Popper>
    </>
  );
};
