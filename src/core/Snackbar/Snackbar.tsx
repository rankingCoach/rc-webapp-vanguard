import './Snackbar.scss';

import { Grow, Snackbar as SnackbarBase } from '@mui/material';
import { useThemeProps } from '@mui/material/styles';
import React from 'react';
import { Snackbar as OwnSnackbar } from '../../primitives/react/Snackbar/Snackbar';
import type { VanguardSnackbarProps as SnackbarProps } from '../_internal/mui-legacy-props';
import { ComponentContainer } from '../ComponentContainer/ComponentContainer';
import { snackbarSlotProps } from './snackbar-slot-compat';

type Props = {} & SnackbarProps;

const MODELLED_PROPS = new Set([
  'open',
  'autoHideDuration',
  'resumeHideDuration',
  'disableWindowBlurListener',
  'anchorOrigin',
  'onClose',
  'children',
  'message',
  'action',
  'className',
  'style',
  'TransitionComponent',
  'transitionDuration',
  'key',
  'ref',
  'onMouseEnter',
  'onMouseLeave',
  'onFocus',
  'onBlur',
]);

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

export const Snackbar = (inProps: Props) => {
  const props = useThemeProps({ props: inProps, name: 'MuiSnackbar' });

  return (
    <ComponentContainer className={'Snackbar-container'}>
      {Object.keys(props).every((name) => MODELLED_PROPS.has(name) || name.startsWith('data-')) ? (
        // Like the MUI route, always hand an onClose (the auto-hide timer is only scheduled with one, MUI useSnackbar).
        <OwnSnackbar
          {...props}
          onClose={(event, reason) => props.onClose?.(event as never, reason)}
          ref={props.ref as React.Ref<HTMLDivElement>}
        />
      ) : (
        <TransitionContext.Provider value={props.TransitionComponent}>
          <SnackbarBase
            {...snackbarSlotProps(props)}
            slots={{ transition: LegacyTransition, ...props.slots }}
            onClose={(event, reason) => {
              if (
                reason === 'clickaway' &&
                props.ClickAwayListenerProps?.onClickAway &&
                !props.slotProps?.clickAwayListener
              )
                return;
              props.onClose?.(event, reason);
            }}
          />
        </TransitionContext.Provider>
      )}
    </ComponentContainer>
  );
};
