import React from 'react';
import { FocusTrap as OwnFocusTrap } from '../../primitives/react/FocusTrap/FocusTrap';

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

/** Keeps keyboard focus inside its child while open (own-core port of MUI's Unstable_TrapFocus). */
export const FocusTrap = (props: FocusTrapProps) => {
  const { open, isEnabled, disableAutoFocus, disableEnforceFocus, disableRestoreFocus, children } = props;
  return (
    <OwnFocusTrap
      open={open}
      isEnabled={isEnabled}
      disableAutoFocus={disableAutoFocus}
      disableEnforceFocus={disableEnforceFocus}
      disableRestoreFocus={disableRestoreFocus}
    >
      {children}
    </OwnFocusTrap>
  );
};
