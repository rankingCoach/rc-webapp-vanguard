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

/**
 * Opt-in (right-overlay with animateOnSlideEnd, desktop only): the right panel's left edge drags to resize it, and
 * pulled past `minWidth`, held and let go, closes it through `onCloseByDrag`.
 *
 * The panels' own widths (`elements`) are the default split: they should add up to 100%. Once dragged, the right panel
 * keeps its width in px (clamped between `minWidth` and the split's width less `minOtherWidth`) until `resetKey`
 * changes, a double click, or a close by drag; then it opens at the default again.
 *
 * With `collapseToggle`, the divider FAB then shows only while the panel is closed (the way back): open, it would sit on
 * the edge with the drag handle. Give the right panel a close control of its own; the close by drag isn't one anyone
 * can find or reach from the keyboard.
 */
export interface ModalSplitViewResize {
  /** Narrowest right panel, px. */
  minWidth: number;
  /** What the left panel keeps beside the widest right panel, px. */
  minOtherWidth: number;
  /** Where the visible edge sits inside the right panel, px (a boxed panel's inset). Default 0. */
  edgeOffset?: number;
  /** A new value drops the dragged width, so the panel opens at its default again. */
  resetKey?: string | number;
  /** The panel was pulled past `minWidth`, held and let go: close it (the consumer owns `isContracted`). */
  onCloseByDrag: () => void;
  /** Accessible label of the drag handle. */
  ariaLabel: string;
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
  /**
   * Opt-in, `right-overlay` + `animateOnSlideEnd` desktop only (default off → behaviour unchanged). A drag handle on
   * the right panel's left edge. See {@link ModalSplitViewResize}.
   */
  resize?: ModalSplitViewResize;
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
    resize,
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
        resize={resize}
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
