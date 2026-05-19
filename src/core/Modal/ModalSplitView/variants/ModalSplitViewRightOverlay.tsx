import { useWindowResize } from '@custom-hooks/use-window.resize';
import { classNames } from '@helpers/classNames';
import React from 'react';
import { a, useSpring } from 'react-spring';

import type { SplitViewElement } from '../ModalSplitView';

interface ModalSplitViewRightOverlayProps {
  elements: [SplitViewElement, SplitViewElement];
  autoCloseWidth: number;
  isContracted: boolean;
  bottomMargin?: string;
}

export const ModalSplitViewRightOverlay = (props: ModalSplitViewRightOverlayProps) => {
  const { elements, isContracted, autoCloseWidth, bottomMargin } = props;

  const [firstElement, secondElement] = elements;
  const width = useWindowResize();

  const isMobile = autoCloseWidth > 0 && width < autoCloseWidth;
  const isOpen = autoCloseWidth < width && isContracted;

  const leftWidth = isMobile
    ? firstElement?.fullWidth
    : isOpen
      ? firstElement?.contractedWidth
      : firstElement?.fullWidth;

  const firstElementSlidingProps: any = useSpring({
    width: leftWidth,
    backgroundColor: firstElement?.backgroundColor ? firstElement?.backgroundColor : 'var(--n000)',
  });

  const secondElementLeftOverlayProps: any = useSpring({
    opacity: isContracted ? 1 : 0,
  });

  const secondElementOverlayProps: any = useSpring({
    transform: isContracted ? 'translateX(0%)' : 'translateX(100%)',
    opacity: isContracted ? 1 : 0,
  });

  const rightClassName = classNames(
    'SplitView-right-component',
    isMobile ? 'SplitView-right-component--overlay' : undefined,
    isMobile && bottomMargin ? 'SplitView-right-component--with-bottom-margin' : undefined,
  );

  const rightStyle: any = isMobile
    ? {
        right: 0,
        width: '100%',
        bottom: bottomMargin ?? 0,
        height: bottomMargin ? `calc(100vh - ${bottomMargin})` : '100vh',
        ...secondElementOverlayProps,
      }
    : {
        left: firstElement?.contractedWidth,
        width: secondElement?.fullWidth,
        ...secondElementLeftOverlayProps,
      };

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

      <a.div className={rightClassName} style={rightStyle}>
        {secondElement?.component}
      </a.div>
    </>
  );
};
