import { Grow, Snackbar as SnackbarBase } from '@mui/material';
import React from 'react';
import type { VanguardSnackbarProps as SnackbarProps } from '../_internal/mui-legacy-props';
import { snackbarSlotProps } from './snackbar-slot-compat';

// Keep a single slot component across renders; a closure component would reset
// the transition's state. Context carries the resolved public legacy component.
const TransitionContext = React.createContext<SnackbarProps['TransitionComponent']>(undefined);

// MUI 7 extracts slot event props but only composes onEnter/onExited.
// Restore the remaining callbacks from the same effective slot props MUI uses.
const LegacyTransition = React.forwardRef(
  ({ ownerState, ...transitionProps }: any, ref: React.ForwardedRef<unknown>) => {
    const Transition = React.useContext(TransitionContext) ?? Grow;
    const slotProps = ownerState.slotProps?.transition;
    const effectiveProps =
      (typeof slotProps === 'function' ? slotProps(ownerState) : slotProps) ?? ownerState.TransitionProps;
    const callbacks = Object.fromEntries(
      Object.entries(effectiveProps ?? {}).filter(
        ([name, value]) =>
          /^on[A-Z]/.test(name) && typeof value === 'function' && name !== 'onEnter' && name !== 'onExited',
      ),
    );
    // Keep MUI's merged values and composed enter/exited handlers intact.
    return <Transition {...transitionProps} {...callbacks} ref={ref} />;
  },
);

/**
 * The MUI Snackbar route of Vanguard's Snackbar (slots, slotProps, ContentProps, ClickAwayListenerProps,
 * TransitionProps, componentsProps, sx, classes). Loaded lazily (plan §36.2 B.3) so Snackbar's eager graph stays free
 * of @mui/*. Receives the theme-resolved props.
 */
const SnackbarMuiFallback = (props: SnackbarProps) => (
  <TransitionContext.Provider value={props.TransitionComponent}>
    <SnackbarBase
      {...snackbarSlotProps(props)}
      slots={{ transition: LegacyTransition, ...props.slots }}
      onClose={(event, reason) => {
        if (reason === 'clickaway' && props.ClickAwayListenerProps?.onClickAway && !props.slotProps?.clickAwayListener)
          return;
        props.onClose?.(event, reason);
      }}
    />
  </TransitionContext.Provider>
);

export default SnackbarMuiFallback;
