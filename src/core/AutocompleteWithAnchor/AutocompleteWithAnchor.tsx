import { p1 } from '@globalStyles';
import { classNames } from '@helpers/classNames';
import { uuidv4 } from '@helpers/generate-uid';
import { ClickAwayListener } from '@mui/material';
import { Autocomplete, AutocompleteProps } from '@vanguard/Autocomplete/Autocomplete';
import { OVERLAY_BASE_Z_INDEX, OverlayStackingService } from '@vanguard/OverlayStacking/OverlayStackingService';
import { PopoverPopper } from '@vanguard/Popover/PopoverPopper/PopoverPopper';
import React, { useEffect, useRef, useState } from 'react';

import styles from './AutocompleteWithAnchor.module.scss';

export interface AutocompleteWithAnchorProps {
  children: React.ReactNode;
  autocompleteProps: AutocompleteProps;
  onOpenChange?: (openStatus: boolean) => void;
  searchVisbile?: boolean;
}

export const AutocompleteWithAnchor = (props: AutocompleteWithAnchorProps) => {
  const { children, autocompleteProps, onOpenChange } = props;
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);

  /**
   * Popover stacking
   * -------
   * The PopoverPopper portals to <body>, so inside a stacked modal/drawer it
   * paints *behind* the surface that opened it. Register a 'popover' slot on
   * open and release it on close/unmount — same pattern as Popover and the
   * Autocomplete listbox (see OverlayStackingService).
   */
  const popperIdRef = useRef<string>(`autocomplete-anchor-popper-${uuidv4()}`);
  const [popperZIndex, setPopperZIndex] = useState(OVERLAY_BASE_Z_INDEX);

  useEffect(() => {
    setTimeout(() => {
      if (anchorEl && inputRef.current) {
        inputRef.current?.focus();
      }
    }, 0);
    onOpenChange && onOpenChange(Boolean(anchorEl));
  }, [anchorEl, inputRef]);

  // Release the slot if the component unmounts while the popover is still open.
  useEffect(() => () => OverlayStackingService.unregister(popperIdRef.current), []);

  const handleClose = () => {
    if (anchorEl) {
      anchorEl.focus();
    }

    OverlayStackingService.unregister(popperIdRef.current);
    setPopperZIndex(OVERLAY_BASE_Z_INDEX);
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setPopperZIndex(OverlayStackingService.register(popperIdRef.current, 'popover'));
    setAnchorEl(event.currentTarget);
  };
  if (!children) {
    return null;
  }
  return (
    <div style={{ cursor: 'pointer' }}>
      <div onClick={handleClick}>{children}</div>
      <PopoverPopper
        className={classNames(styles.autocompleteContent, p1)}
        // zIndex from OverlayStackingService so the popover stacks above any
        // modal/drawer it was opened from (overrides the static z-index in the
        // .autocomplete-content class).
        style={{ width: anchorEl ? anchorEl.clientWidth : '', zIndex: popperZIndex }}
        open={open}
        anchorEl={anchorEl}
      >
        <ClickAwayListener onClickAway={handleClose}>
          <div>
            <Autocomplete inputRef={inputRef} {...autocompleteProps} />
          </div>
        </ClickAwayListener>
      </PopoverPopper>
    </div>
  );
};
