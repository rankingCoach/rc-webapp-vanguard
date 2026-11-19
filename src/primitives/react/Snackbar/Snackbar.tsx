// Ported from @mui/material@9.5.0 Snackbar/Snackbar.js and SnackbarContent/SnackbarContent.js (MIT)
import React, { useState } from 'react';
import { ClickAway } from '../ClickAway/ClickAway';
import { Grow } from '../Transitions/Grow';
import type { TransitionTimeout } from '../Transitions/Transition';
import { useVanguardTypography } from '../typography-context';
import { type UseSnackbarParameters, useSnackbar } from './useSnackbar';

interface SnackbarTransitionProps {
  appear?: boolean;
  in?: boolean;
  timeout?: TransitionTimeout;
  direction?: 'up' | 'down';
  onEnter?: (node: HTMLElement, isAppearing: boolean) => void;
  onExited?: (node: HTMLElement) => void;
  children: React.ReactElement<{ style?: React.CSSProperties; ref?: React.Ref<HTMLElement> }>;
}

export interface SnackbarProps extends UseSnackbarParameters {
  anchorOrigin?: { vertical: 'top' | 'bottom'; horizontal: 'left' | 'center' | 'right' };
  children?: React.ReactElement<unknown>;
  message?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  TransitionComponent?: React.JSXElementConstructor<SnackbarTransitionProps>;
  transitionDuration?: TransitionTimeout;
  key?: React.Key;
  ref?: React.Ref<HTMLDivElement>;
  [dataAttribute: `data-${string}`]: unknown;
}

const DEFAULT_TRANSITION_DURATION = { enter: 225, exit: 195 };
const PAPER_SHADOW_6 =
  '0px 3px 5px -1px rgba(0,0,0,0.2),0px 6px 10px 0px rgba(0,0,0,0.14),0px 1px 18px 0px rgba(0,0,0,0.12)';
const capitalize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

const SnackbarContent = ({
  message,
  action,
  style,
  ref,
  ...other
}: React.HTMLAttributes<HTMLDivElement> & {
  message?: React.ReactNode;
  action?: React.ReactNode;
  ref?: React.Ref<HTMLDivElement>;
}) => {
  const typography = useVanguardTypography();
  return (
    <div
      role="alert"
      className={[
        'MuiPaper-root MuiPaper-elevation MuiPaper-rounded MuiPaper-elevation6 MuiSnackbarContent-root',
        typography === 'vanguard' && 'vg-typography-vanguard',
      ]
        .filter(Boolean)
        .join(' ')}
      data-vg-core=""
      ref={ref}
      {...other}
      style={{ ['--Paper-shadow' as string]: PAPER_SHADOW_6, ...style }}
    >
      <div className="MuiSnackbarContent-message" data-vg-core="">
        {message}
      </div>
      {action ? (
        <div className="MuiSnackbarContent-action" data-vg-core="">
          {action}
        </div>
      ) : null}
    </div>
  );
};

export const Snackbar = (props: SnackbarProps) => {
  const {
    action,
    anchorOrigin: { vertical, horizontal } = { vertical: 'bottom', horizontal: 'left' },
    autoHideDuration: _autoHideDuration,
    children,
    className,
    disableWindowBlurListener: _disableWindowBlurListener,
    message,
    onBlur: _onBlur,
    onClose: _onClose,
    onFocus: _onFocus,
    onMouseEnter: _onMouseEnter,
    onMouseLeave: _onMouseLeave,
    open,
    resumeHideDuration: _resumeHideDuration,
    TransitionComponent = Grow,
    transitionDuration = DEFAULT_TRANSITION_DURATION,
    ...other
  } = props;
  const { getRootProps, onClickAway } = useSnackbar(props);
  const [exited, setExited] = useState(true);

  if (!open && exited) return null;

  return (
    <ClickAway
      // MUI's plain ClickAwayListener: a click inside a modal opened from the snackbar still closes it.
      ignoreHigherLayers={false}
      onClickAway={(event) => {
        if (!(event as (MouseEvent | TouchEvent) & { defaultMuiPrevented?: boolean }).defaultMuiPrevented) {
          onClickAway(event);
        }
      }}
    >
      <div
        // Own markers first: an explicit consumer data-slot wins, as on MUI (Codex review, handoff 17).
        data-slot="snackbar"
        data-vg-core=""
        {...getRootProps({
          ...other,
          className: [
            'MuiSnackbar-root',
            `MuiSnackbar-anchorOrigin${capitalize(vertical)}${capitalize(horizontal)}`,
            className,
          ]
            .filter(Boolean)
            .join(' '),
        })}
      >
        <TransitionComponent
          appear
          in={open}
          timeout={transitionDuration}
          direction={vertical === 'top' ? 'down' : 'up'}
          onEnter={() => setExited(false)}
          onExited={() => setExited(true)}
        >
          {children ?? <SnackbarContent message={message} action={action} />}
        </TransitionComponent>
      </div>
    </ClickAway>
  );
};
