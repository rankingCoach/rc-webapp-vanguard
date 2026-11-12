import { Fade as MuiFade } from '@mui/material';
import React from 'react';

export interface FadeProps {
  /** Fades the child in while true, out while false. */
  in: boolean;
  /** Single element that can hold a ref. It stays mounted (visibility: hidden) after fading out. */
  children: React.ReactElement;
  /** Duration in ms, or per phase. Default enter 225 / exit 195. */
  timeout?: number | { appear?: number; enter?: number; exit?: number };
  /** Run the enter transition on first mount when `in` is true. Default true. */
  appear?: boolean;
  /** Mount the child only on the first `in`. */
  mountOnEnter?: boolean;
  /** Unmount the child after it faded out. */
  unmountOnExit?: boolean;
  onEntered?: () => void;
  onExited?: () => void;
}

/**
 * Opacity transition that keeps its child mounted (unlike AnimatedConditional, which unmounts),
 * so refs and listeners on the child survive while it is hidden.
 */
export const Fade = (props: FadeProps) => {
  const { in: isIn, children, timeout, appear, mountOnEnter, unmountOnExit, onEntered, onExited } = props;
  return (
    <MuiFade
      in={isIn}
      timeout={timeout}
      appear={appear}
      mountOnEnter={mountOnEnter}
      unmountOnExit={unmountOnExit}
      onEntered={onEntered}
      onExited={onExited}
    >
      {children}
    </MuiFade>
  );
};
