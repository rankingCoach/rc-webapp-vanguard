import './ModalSplitView.scss';

import React from 'react';

import { ModalSplitViewLeftOverlay } from './variants/ModalSplitViewLeftOverlay';
import { ModalSplitViewRightOverlay } from './variants/ModalSplitViewRightOverlay';

export type SplitViewElement =
  | {
      component: React.ReactNode;
      fullWidth: string;
      contractedWidth?: string;
      backgroundColor?: string;
    }
  | null
  | undefined;

export type ModalSplitViewCollapseMode = 'left-overlay' | 'right-overlay';

interface ModalSplitViewProps {
  elements: [SplitViewElement, SplitViewElement];
  autoCloseWidth?: number;
  isContracted: boolean;
  collapseMode?: ModalSplitViewCollapseMode;
  bottomMargin?: string;
  /**
   * Opt-in, `right-overlay` desktop only (default off → behaviour unchanged). Slide the right panel
   * in as a `translateX` overlay and resize the left panel a single time once the slide ends, instead
   * of animating the left panel's width every frame. Avoids per-frame reflow of heavy left-panel
   * content (e.g. a chat). See ModalSplitViewRightOverlay.
   */
  animateOnSlideEnd?: boolean;
}

export const ModalSplitView = (props: ModalSplitViewProps) => {
  const {
    elements,
    isContracted,
    autoCloseWidth = -1,
    collapseMode = 'left-overlay',
    bottomMargin,
    animateOnSlideEnd,
  } = props;

  if (collapseMode === 'right-overlay') {
    return (
      <ModalSplitViewRightOverlay
        elements={elements}
        isContracted={isContracted}
        autoCloseWidth={autoCloseWidth}
        bottomMargin={bottomMargin}
        animateOnSlideEnd={animateOnSlideEnd}
      />
    );
  }

  return <ModalSplitViewLeftOverlay elements={elements} isContracted={isContracted} autoCloseWidth={autoCloseWidth} />;
};
