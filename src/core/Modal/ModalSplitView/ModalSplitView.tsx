import './ModalSplitView.scss';

import React from 'react';

import { IconNames } from '@vanguard/Icon/IconNames';

import { ModalSplitViewLeftOverlay } from './variants/ModalSplitViewLeftOverlay';
import { ModalSplitViewRightOverlay } from './variants/ModalSplitViewRightOverlay';

/**
 * Optional round FAB on the divider (`right-overlay`, desktop). When provided, the split view renders a circular
 * button that rides the right panel's left edge: it sits ON the divider while the panel is open and peeks half-off
 * the right screen edge while it's collapsed. The view owns positioning + which chevron to show (derived from
 * `isContracted`); the consumer owns the action via `onToggle`.
 */
export interface ModalSplitViewCollapseToggle {
  onToggle: () => void;
  /** Icon while the right panel is OPEN (click → collapse). Default `caretLeft`. */
  collapseIcon?: IconNames;
  /** Icon while the right panel is COLLAPSED (click → expand). Default `caretRight`. */
  expandIcon?: IconNames;
  ariaLabel?: string;
  /** Vertical position of the FAB as a percentage of the split-view height (0 = top, 100 = bottom). Default 50 (centered). */
  verticalPositionPercent?: number;
}

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
  /** Optional round divider FAB (right-overlay desktop only). See {@link ModalSplitViewCollapseToggle}. */
  collapseToggle?: ModalSplitViewCollapseToggle;
}

export const ModalSplitView = (props: ModalSplitViewProps) => {
  const {
    elements,
    isContracted,
    autoCloseWidth = -1,
    collapseMode = 'left-overlay',
    bottomMargin,
    animateOnSlideEnd,
    collapseToggle,
  } = props;

  if (collapseMode === 'right-overlay') {
    return (
      <ModalSplitViewRightOverlay
        elements={elements}
        isContracted={isContracted}
        autoCloseWidth={autoCloseWidth}
        bottomMargin={bottomMargin}
        animateOnSlideEnd={animateOnSlideEnd}
        collapseToggle={collapseToggle}
      />
    );
  }

  return (
    <ModalSplitViewLeftOverlay
      elements={elements}
      isContracted={isContracted}
      autoCloseWidth={autoCloseWidth}
      collapseToggle={collapseToggle}
    />
  );
};
