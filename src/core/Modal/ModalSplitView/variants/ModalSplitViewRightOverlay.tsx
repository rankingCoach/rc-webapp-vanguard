import { useWindowResize } from '@custom-hooks/use-window.resize';
import { classNames } from '@helpers/classNames';
import React, { useEffect, useState } from 'react';
import { a, useSpring } from 'react-spring';

import type { SplitViewElement } from '../ModalSplitView';

interface ModalSplitViewRightOverlayProps {
  elements: [SplitViewElement, SplitViewElement];
  autoCloseWidth: number;
  isContracted: boolean;
  bottomMargin?: string;
  /**
   * Opt-in (default off → behaviour unchanged). When true on desktop the right panel slides in
   * as an overlay (GPU `translateX`) on top of the left panel, and the left panel keeps its full
   * width during the slide, resizing to its contracted width a single time once the slide ends
   * (react-spring `onRest`). Off, the left panel animates its `width` every frame — which reflows
   * heavy left-panel content (e.g. a chat with markdown) on every frame and is the source of jank.
   * Trades a per-frame reflow for one reflow at slide end.
   */
  animateOnSlideEnd?: boolean;
}

export const ModalSplitViewRightOverlay = (props: ModalSplitViewRightOverlayProps) => {
  const { elements, isContracted, autoCloseWidth, bottomMargin, animateOnSlideEnd } = props;

  const [firstElement, secondElement] = elements;
  const width = useWindowResize();

  const isMobile = autoCloseWidth > 0 && width < autoCloseWidth;
  const isOpen = autoCloseWidth < width && isContracted;

  const slideEnabled = animateOnSlideEnd === true && !isMobile;

  // When sliding the right panel as an overlay, the left panel resizes only once the slide ends.
  // `isLeftResized` flips to true on the open slide's onRest, and back to false the instant a close
  // begins (so the left panel expands in one step before the right panel slides out).
  const [isLeftResized, setIsLeftResized] = useState(isOpen);

  useEffect(() => {
    if (slideEnabled && !isOpen) {
      setIsLeftResized(false);
    }
  }, [slideEnabled, isOpen]);

  const leftWidth = isMobile
    ? firstElement?.fullWidth
    : slideEnabled
      ? isLeftResized
        ? firstElement?.contractedWidth
        : firstElement?.fullWidth
      : isOpen
        ? firstElement?.contractedWidth
        : firstElement?.fullWidth;

  const firstElementSlidingProps = useSpring({
    width: leftWidth,
    backgroundColor: firstElement?.backgroundColor ? firstElement?.backgroundColor : 'var(--n000)',
    // No per-frame width animation when the overlay slides — the left panel jumps to its target once.
    immediate: slideEnabled,
  });

  const secondElementSpring = useSpring({
    opacity: isContracted ? 1 : 0,
    transform:
      (isMobile && !isContracted) || (slideEnabled && !isOpen) ? 'translateX(100%)' : 'translateX(0%)',
    onRest: () => {
      if (slideEnabled && isOpen) {
        setIsLeftResized(true);
      }
    },
  });

  const rightClassName = classNames(
    'SplitView-right-component',
    isMobile ? 'SplitView-right-component--overlay' : undefined,
    isMobile && bottomMargin ? 'SplitView-right-component--with-bottom-margin' : undefined,
  );

  const rightStyle = isMobile
    ? {
        right: 0,
        width: '100%',
        bottom: bottomMargin ?? '0',
        height: bottomMargin ? `calc(100vh - ${bottomMargin})` : '100vh',
        ...secondElementSpring,
      }
    : slideEnabled
      ? {
          left: firstElement?.contractedWidth,
          width: secondElement?.fullWidth,
          opacity: secondElementSpring.opacity,
          // Slide the right panel on top of the static-width left panel, so the left panel does not
          // reflow during the slide — it resizes once on onRest.
          transform: secondElementSpring.transform,
          zIndex: 4,
        }
      : {
          left: firstElement?.contractedWidth,
          width: secondElement?.fullWidth,
          opacity: secondElementSpring.opacity,
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
