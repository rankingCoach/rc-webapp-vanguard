import './Snackbar.scss';

import React from 'react';
import { Snackbar as OwnSnackbar } from '../../primitives/react/Snackbar/Snackbar';
import { lazyFallback } from '../_internal/lazy-fallback';
import type { VanguardSnackbarProps as SnackbarProps } from '../_internal/mui-legacy-props';
import { useThemeDefaultProps } from '../_internal/theme-default-props';
import { ComponentContainer } from '../ComponentContainer/ComponentContainer';

// MUI's Snackbar route behind a lazy boundary (plan §36.2 B.3).
const SnackbarMuiFallback = lazyFallback(() => import('./SnackbarMuiFallback') as never) as React.ComponentType<
  Record<string, unknown>
>;

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

export const Snackbar = (inProps: Props) => {
  // MUI's useThemeProps semantics without importing MUI (src/core/_internal/theme-default-props.ts, option 5.3).
  const props = useThemeDefaultProps(inProps as Record<string, unknown>, 'MuiSnackbar') as Props;

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
        <SnackbarMuiFallback {...(props as Record<string, unknown>)} />
      )}
    </ComponentContainer>
  );
};
