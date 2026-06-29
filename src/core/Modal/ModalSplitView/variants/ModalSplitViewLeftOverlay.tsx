import { useWindowResize } from '@custom-hooks/use-window.resize';
import { classNames } from '@helpers/classNames';
import React from 'react';
import { a, useSpring } from 'react-spring';

import type { ModalSplitViewCollapseToggle, SplitViewElement } from '../ModalSplitView';
import { SplitViewCollapseFab } from '../SplitViewCollapseFab';

interface ModalSplitViewLeftOverlayProps {
  elements: [SplitViewElement, SplitViewElement];
  autoCloseWidth: number;
  isContracted: boolean;
  collapseToggle?: ModalSplitViewCollapseToggle;
}

export const ModalSplitViewLeftOverlay = (props: ModalSplitViewLeftOverlayProps) => {
  const { elements, isContracted, autoCloseWidth, collapseToggle } = props;

  const [firstElement, secondElement] = elements;
  const width = useWindowResize();

  const isMobile = autoCloseWidth > 0 && width < autoCloseWidth;
  const isOpen = autoCloseWidth < width && isContracted;
  const firstElementSlidingProps = useSpring({
    width: isOpen ? firstElement?.contractedWidth : firstElement?.fullWidth,
    backgroundColor: firstElement?.backgroundColor ? firstElement?.backgroundColor : 'var(--n000)',
  });

  // The divider FAB's `left` rides THIS spring (same clock as the panel's opacity fade) — never a second spring,
  // so it can't desync. On the divider when open, right screen edge when collapsed.
  const openLeft = firstElement?.contractedWidth ?? '100%';

  const secondElementSpring = useSpring({
    opacity: isContracted ? 1 : 0,
    fabLeft: isOpen ? openLeft : '100%',
  });

  return (
    <>
      <a.div
        className={classNames('SplitView-left-component')}
        style={{
          ...firstElementSlidingProps,
        }}
      >
        {firstElement?.component}
      </a.div>

      <a.div
        className={classNames('SplitView-right-component')}
        style={{
          left: firstElement?.contractedWidth,
          width: secondElement?.fullWidth,
          opacity: secondElementSpring.opacity,
        }}
      >
        {secondElement?.component}
      </a.div>

      {collapseToggle && !isMobile && (
        <SplitViewCollapseFab collapseToggle={collapseToggle} isOpen={isOpen} animatedLeft={secondElementSpring.fabLeft} />
      )}
    </>
  );
};
