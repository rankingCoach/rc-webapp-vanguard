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

export type ModalSplitViewCollapseMode = 'left-overlay' | 'right-overlay' | null;

interface ModalSplitViewProps {
  elements: [SplitViewElement, SplitViewElement];
  autoCloseWidth?: number;
  isContracted: boolean;
  collapseMode?: ModalSplitViewCollapseMode;
  bottomMargin?: string;
}

export const ModalSplitView = (props: ModalSplitViewProps) => {
  const { elements, isContracted, autoCloseWidth = -1, collapseMode = 'left-overlay', bottomMargin } = props;

  if (collapseMode === 'right-overlay') {
    return (
      <ModalSplitViewRightOverlay
        elements={elements}
        isContracted={isContracted}
        autoCloseWidth={autoCloseWidth}
        bottomMargin={bottomMargin}
      />
    );
  }

  return <ModalSplitViewLeftOverlay elements={elements} isContracted={isContracted} autoCloseWidth={autoCloseWidth} />;
};
