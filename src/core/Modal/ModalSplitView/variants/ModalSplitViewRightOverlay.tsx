import { useWindowResize } from '@custom-hooks/use-window.resize';
import { classNames } from '@helpers/classNames';
import React, { useEffect, useRef, useState } from 'react';
import { a, useSpring } from 'react-spring';

import type { ModalSplitViewCollapseToggle, ModalSplitViewResize, SplitViewElement } from '../ModalSplitView';
import { SplitViewCollapseFab } from '../SplitViewCollapseFab';
import { SplitViewResizeHandle } from '../SplitViewResizeHandle';
import { useSplitViewResize } from '../use-split-view-resize';

interface ModalSplitViewRightOverlayProps {
  elements: [SplitViewElement, SplitViewElement];
  autoCloseWidth: number;
  isContracted: boolean;
  bottomMargin?: string;
  collapseToggle?: ModalSplitViewCollapseToggle;
  /**
   * Opt-in (default off → behaviour unchanged). When true on desktop the right panel slides in
   * as an overlay (GPU `translateX`) on top of the left panel, and the left panel keeps its full
   * width during the slide, resizing to its contracted width a single time once the slide ends
   * (react-spring `onRest`). Off, the left panel animates its `width` every frame — which reflows
   * heavy left-panel content (e.g. a chat with markdown) on every frame and is the source of jank.
   * Trades a per-frame reflow for one reflow at slide end.
   */
  animateOnSlideEnd?: boolean;
  /**
   * Opt-in (default off → behaviour unchanged), only with `animateOnSlideEnd` on desktop. A drag handle on the right
   * panel's left edge, carried with the FAB by an edge rail. See {@link ModalSplitViewResize}.
   */
  resize?: ModalSplitViewResize;
}

export const ModalSplitViewRightOverlay = (props: ModalSplitViewRightOverlayProps) => {
  const { elements, isContracted, autoCloseWidth, bottomMargin, animateOnSlideEnd, collapseToggle, resize } = props;

  const [firstElement, secondElement] = elements;
  const width = useWindowResize();

  const isMobile = autoCloseWidth > 0 && width < autoCloseWidth;
  const isOpen = autoCloseWidth < width && isContracted;

  const slideEnabled = animateOnSlideEnd === true && !isMobile;

  // Honoured only where the right panel slides in as an overlay on desktop; everywhere else the split is as it always was.
  // The hook gets `resize` as given all the same, so the dragged width and `resetKey` outlast a trip to mobile and back.
  const activeResize = slideEnabled ? resize : undefined;
  const rightPanelRef = useRef<HTMLDivElement>(null);
  const splitResize = useSplitViewResize({ resize, honoured: slideEnabled, isOpen, panelRef: rightPanelRef });
  // The dragged width, px (null: the consumer's default). The CSS clamp keeps it valid while the window shrinks,
  // without a render.
  const draggedWidth = activeResize ? splitResize.width : null;
  const rightWidth =
    activeResize && draggedWidth !== null
      ? `clamp(${activeResize.minWidth}px, ${draggedWidth}px, calc(100% - ${activeResize.minOtherWidth}px))`
      : secondElement?.fullWidth;
  const leftContractedWidth =
    activeResize && draggedWidth !== null ? `calc(100% - ${rightWidth})` : firstElement?.contractedWidth;

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

  // The divider FAB's `left` is part of THIS spring (not a second one), so it animates on the exact same clock as
  // the panel's slide/fade — it can never get ahead of the drawer. On the divider when open, right screen edge when
  // collapsed.
  const openLeft = firstElement?.contractedWidth ?? '100%';

  const secondElementSpring = useSpring({
    opacity: isContracted ? 1 : 0,
    transform:
      (isMobile && !isContracted) || (slideEnabled && !isOpen) ? 'translateX(100%)' : 'translateX(0%)',
    fabLeft: isOpen ? openLeft : '100%',
    onRest: () => {
      if (slideEnabled && isOpen) {
        setIsLeftResized(true);
      }
    },
  });

  // While the edge is dragged the consumer's own transitions (a width morph in the panel) can stand aside from this class.
  const rightClassName = classNames(
    'SplitView-right-component',
    isMobile ? 'SplitView-right-component--overlay' : undefined,
    isMobile && bottomMargin ? 'SplitView-right-component--with-bottom-margin' : undefined,
    splitResize.resizing ? 'SplitView-right-component--resizing' : undefined,
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
          left: leftContractedWidth,
          width: rightWidth,
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

  // The left panel's width spring keeps the consumer's widths: react-spring reads a string number by number and throws
  // ('The arity of each "output" value must be equal') when the next one has fewer, which a calc() back to '100%'
  // does, `immediate` or not. The dragged split goes over it as a plain style, in step with the right panel.
  const leftDragged = activeResize !== undefined && draggedWidth !== null && isLeftResized;

  return (
    <>
      <a.div
        className={classNames('SplitView-left-component')}
        style={{
          ...firstElementSlidingProps,
          ...(leftDragged ? { width: leftContractedWidth } : undefined),
        }}
        {...(activeResize ? splitResize.panelProps : undefined)}
      >
        {firstElement?.component}
      </a.div>

      <a.div
        ref={rightPanelRef}
        className={rightClassName}
        style={rightStyle}
        {...(activeResize ? splitResize.panelProps : undefined)}
      >
        {secondElement?.component}
      </a.div>

      {activeResize && (
        // The edge rail: the right panel's left, width and slide (the same spring), so the tab and the FAB ride the slide
        // and, off the panel that scrolls and clips, aren't clipped. With resize on, the FAB is only the way back while
        // closed: open, the tab and the consumer's own close do it.
        <a.div
          className="SplitView-edge-rail"
          style={{ left: leftContractedWidth, width: rightWidth, transform: secondElementSpring.transform }}
        >
          <SplitViewResizeHandle
            tab={splitResize.tab}
            tabX={splitResize.tabX}
            edgeOffset={activeResize.edgeOffset ?? 0}
            inert={!isOpen}
            handleProps={splitResize.handleProps}
          />
          {collapseToggle && !isOpen && <SplitViewCollapseFab collapseToggle={collapseToggle} isOpen={isOpen} />}
        </a.div>
      )}

      {collapseToggle && !isMobile && !activeResize && (
        <SplitViewCollapseFab collapseToggle={collapseToggle} isOpen={isOpen} animatedLeft={secondElementSpring.fabLeft} />
      )}
    </>
  );
};
