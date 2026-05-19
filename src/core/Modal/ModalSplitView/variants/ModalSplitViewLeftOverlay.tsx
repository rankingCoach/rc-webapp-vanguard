import { useWindowResize } from '@custom-hooks/use-window.resize';
import { classNames } from '@helpers/classNames';
import React from 'react';
import { a, useSpring } from 'react-spring';

import type { SplitViewElement } from '../ModalSplitView';

interface ModalSplitViewLeftOverlayProps {
  elements: [SplitViewElement, SplitViewElement];
  autoCloseWidth: number;
  isContracted: boolean;
}

export const ModalSplitViewLeftOverlay = (props: ModalSplitViewLeftOverlayProps) => {
  const { elements, isContracted, autoCloseWidth } = props;

  const [firstElement, secondElement] = elements;
  const width = useWindowResize();

  const isOpen = autoCloseWidth < width && isContracted;
  const firstElementSlidingProps: any = useSpring({
    width: isOpen ? firstElement?.contractedWidth : firstElement?.fullWidth,
    backgroundColor: firstElement?.backgroundColor ? firstElement?.backgroundColor : 'var(--n000)',
  });

  const secondElementOpacityProps: any = useSpring({
    opacity: isContracted ? 1 : 0,
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
          ...secondElementOpacityProps,
        }}
      >
        {secondElement?.component}
      </a.div>
    </>
  );
};
