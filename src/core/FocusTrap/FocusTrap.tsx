import { Unstable_TrapFocus as MuiTrapFocus } from '@mui/material';
import React from 'react';

export interface FocusTrapProps {
  /** Trap is mounted and active while true. */
  open: boolean;
  /** Return false to pause the trap (e.g. while another dialog is on top). Default: always enabled. */
  isEnabled?: () => boolean;
  /** Do not move focus into the trap when it opens. */
  disableAutoFocus?: boolean;
  /** Allow focus to leave the trap. */
  disableEnforceFocus?: boolean;
  /** Do not restore focus to the previously focused element when the trap closes. */
  disableRestoreFocus?: boolean;
  /** Single element that can hold a ref; give it tabIndex={-1} so it can receive focus. */
  children: React.ReactElement;
}

/** Keeps keyboard focus inside its child while open (wrapper of MUI's Unstable_TrapFocus). */
export const FocusTrap = (props: FocusTrapProps) => {
  const { open, isEnabled, disableAutoFocus, disableEnforceFocus, disableRestoreFocus, children } = props;
  return (
    <MuiTrapFocus
      open={open}
      isEnabled={isEnabled}
      disableAutoFocus={disableAutoFocus}
      disableEnforceFocus={disableEnforceFocus}
      disableRestoreFocus={disableRestoreFocus}
    >
      {children}
    </MuiTrapFocus>
  );
};
