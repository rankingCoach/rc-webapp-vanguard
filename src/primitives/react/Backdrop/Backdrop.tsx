// Ported from @mui/material@9.5.0 Backdrop/Backdrop.js (MIT)
import React from 'react';
import { Fade } from '../Transitions/Fade';
import { TransitionTimeout } from '../Transitions/Transition';

export interface BackdropProps {
  open: boolean;
  invisible?: boolean;
  className?: string;
  transitionDuration?: TransitionTimeout;
  /**
   * MUI `sx={{ zIndex }}`. Inline here (MUI: an emotion class): nothing in Vanguard or rc-webapp targets the
   * backdrop's z-index, and jsdom resolves inline z-index for the stacking specs (it does not resolve var()).
   */
  zIndex?: number;
  children?: React.ReactNode;
  /** Anything else lands on the backdrop element through Fade, like MUI (`...other` on the transition). */
  [extra: string]: unknown;
}

const cx = (...parts: unknown[]) => parts.filter((p) => typeof p === 'string' && p !== '').join(' ');

/**
 * MUI 9.5 Backdrop on the own core: Fade (MUI's default 225/195 ms unless `transitionDuration`) around
 * `div.MuiBackdrop-root` (+ `MuiBackdrop-invisible`), styles from mui-compat.scss (TextField.scss backdrop rule).
 */
export const Backdrop = (props: BackdropProps) => {
  const { open, invisible = false, className, transitionDuration, zIndex, children, ...other } = props;
  return (
    <Fade in={open} timeout={transitionDuration} {...other}>
      <div
        className={cx('MuiBackdrop-root', invisible ? 'MuiBackdrop-invisible' : '', className)}
        data-slot="backdrop"
        data-vg-core=""
        style={zIndex !== undefined ? { zIndex } : undefined}
      >
        {children}
      </div>
    </Fade>
  );
};
