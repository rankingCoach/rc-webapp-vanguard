import { breakpoints } from '@config/breakpoints';
import { useWindowResize } from '@custom-hooks/use-window.resize';
import { classNames } from '@helpers/classNames';
import { ComponentContainer } from '@vanguard/ComponentContainer/ComponentContainer';
import { Icon, IconSize } from '@vanguard/Icon/Icon';
import { IconNames } from '@vanguard/Icon/IconNames';
import { Render } from '@vanguard/Render/Render';
import React, { useEffect, useRef, useState } from 'react';

import { ElementsBeforeAfter } from './ElementsBeforeAfter/ElementsBeforeAfter';
import styles from './FadedCarousel.module.scss';

type FadeOptions = {
  enabled?: boolean;
  hideAtEdges?: boolean;
};

type ArrowOptions = {
  color?: string;
  hideOnMobile?: boolean;
  circleSize?: number;
  hoverColor?: string;
  showBorder?: boolean;
};
type Mode = 'start' | 'center' | 'centerWithElementsBeforeAfter';

export interface FadedCarouselProps {
  items: React.JSX.Element[];
  maxVisibleItems?: number;
  scrollOffset?: number;
  mode?: Mode;
  fade?: FadeOptions;
  arrows?: ArrowOptions;
  className?: string;
}

export const FadedCarousel = (props: FadedCarouselProps) => {
  const { items, maxVisibleItems, scrollOffset = 300, mode = 'start', fade, arrows, className } = props;

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const windowWidth = useWindowResize();

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  /**
   * mode: "centerWithElementsBeforeAfter"
   */
  const DEFAULT_NUMBER_OF_ELEMENTS_DISPLAYED = 3;
  const effectiveMaxItems =
    maxVisibleItems ?? (items.length > DEFAULT_NUMBER_OF_ELEMENTS_DISPLAYED ? DEFAULT_NUMBER_OF_ELEMENTS_DISPLAYED : 1);

  // On smaller screens, only show 1
  const visibleItemsCount = windowWidth <= breakpoints.tablet ? 1 : effectiveMaxItems;

  // For margin-based approach
  const widthPerItem =
    visibleItemsCount === 1 ? 80 : parseFloat((Math.round((100 / visibleItemsCount) * 100) / 100).toFixed(2));

  const centerStartIndex = Math.floor(items.length / 2) - Math.floor(visibleItemsCount / 2);
  const centerEndIndex = Math.floor(items.length / 2) + Math.ceil(visibleItemsCount / 2);

  const centerItems = items.slice(centerStartIndex, centerEndIndex);
  const itemsBefore = items.slice(0, centerStartIndex);
  const itemsAfter = items.slice(centerEndIndex);

  const [marginLeft, setMarginLeft] = useState(itemsBefore.length * -widthPerItem);
  const [marginRight, setMarginRight] = useState(itemsAfter.length * -widthPerItem);

  const maxRightMargin =
    windowWidth <= breakpoints.tablet ? (itemsAfter.length - 3) * widthPerItem : (itemsAfter.length - 1) * widthPerItem;
  const maxLeftMargin =
    windowWidth <= breakpoints.tablet
      ? (itemsBefore.length - 3) * widthPerItem
      : (itemsBefore.length - 1) * widthPerItem;

  const isAtLeftExtreme = marginLeft >= maxLeftMargin;
  const isAtRightExtreme = marginRight >= maxRightMargin;

  /**
   * Scrolling Logic & Handlers
   */
  const handleClickLeft = (): void => {
    if (mode === 'centerWithElementsBeforeAfter') {
      if (marginLeft < maxLeftMargin) {
        setMarginLeft((m) => m + widthPerItem);
        setMarginRight((m) => m - widthPerItem);
      }
    } else {
      scrollContainerRef.current?.scrollBy({
        left: -scrollOffset,
        behavior: 'smooth',
      });
    }
  };

  const handleClickRight = (): void => {
    if (mode === 'centerWithElementsBeforeAfter') {
      if (marginRight < maxRightMargin) {
        setMarginRight((m) => m + widthPerItem);
        setMarginLeft((m) => m - widthPerItem);
      }
    } else {
      scrollContainerRef.current?.scrollBy({
        left: scrollOffset,
        behavior: 'smooth',
      });
    }
  };

  const handleScroll = (): void => {
    const container = scrollContainerRef.current;
    if (!container) {
      return;
    }
    setCanScrollLeft(container.scrollLeft > 0);

    const atRightEdge = container.scrollLeft + container.clientWidth >= container.scrollWidth;
    setCanScrollRight(!atRightEdge);
  };

  useEffect(() => {
    // Attach scroll listener only if not "centerWithElementsBeforeAfter"
    // That mode doesn't rely on container scroll for arrow logic.
    if (mode === 'centerWithElementsBeforeAfter') {
      return;
    }

    const el = scrollContainerRef.current;
    if (!el) {
      return;
    }

    // Immediately update arrow visibility
    handleScroll();
    el.addEventListener('scroll', handleScroll);
    return () => el.removeEventListener('scroll', handleScroll);
  }, [items, mode]);

  /**
   * "center" Mode: Auto-scroll to center
   */
  useEffect(() => {
    if (mode !== 'center') {
      return;
    }
    const container = scrollContainerRef.current;
    if (!container) {
      return;
    }

    let prevWidth = -1;
    let stableChecks = 0;

    const check = () => {
      const w = container.scrollWidth;
      if (w === prevWidth) {
        stableChecks++;
      } else {
        stableChecks = 0;
      }
      prevWidth = w;

      // If stable for 2 frames
      if (stableChecks >= 2) {
        // do the center scroll
        container.scrollLeft = (w - container.clientWidth) / 2;
      } else {
        requestAnimationFrame(check);
      }
    };

    requestAnimationFrame(check);
  }, [mode, items]);

  /**
   * Arrow Visibility Logic
   */
  const shouldShowArrow = (leftOrRight: 'left' | 'right'): boolean => {
    if (arrows?.hideOnMobile && !(windowWidth > breakpoints.mobile)) {
      return false;
    }

    if (mode === 'centerWithElementsBeforeAfter') {
      if (leftOrRight === 'left') {
        return !isAtLeftExtreme;
      } else {
        return !isAtRightExtreme;
      }
    }

    if (leftOrRight === 'left') {
      return canScrollLeft;
    } else {
      return canScrollRight;
    }
  };

  /**
   * Fade Overlays
   */
  const showFade = (isAtExtreme: boolean, canScroll: boolean): boolean => {
    if (!fade?.enabled) {
      return false;
    }
    if (!fade?.hideAtEdges) {
      return true;
    }

    if (mode === 'centerWithElementsBeforeAfter') {
      return !isAtExtreme;
    }
    // "start"/"center"
    return canScroll;
  };

  /**
   * Return view
   */
  return (
    <ComponentContainer
      className={styles.carouselContainer}
      data-testId={'fadedCarousel'}
      style={mode !== 'centerWithElementsBeforeAfter' ? { overflow: 'hidden' } : {}}
    >
      {/* Left Fade Overlay */}
      <Render if={showFade(isAtLeftExtreme, canScrollLeft)}>
        <div className={styles.before} />
      </Render>

      {/* Left Arrow */}
      <Render if={shouldShowArrow('left')}>
        <Icon
          onClick={handleClickLeft}
          className={classNames(styles.arrowLeft, styles.carouselArrow, arrows?.showBorder ? styles.arrowBorder : '')}
          type={IconSize.small}
          color={'--n000'}
          hasCircle={true}
          fillColor={arrows?.color ?? 'rgba(var(--fn-fg-rgb), 0.7)'}
          circleSize={arrows?.circleSize ?? 48}
          style={{ '--arrow-hover-color': arrows?.hoverColor } as React.CSSProperties}
        >
          {IconNames.arrowLeft}
        </Icon>
      </Render>

      {/* MODE: centerWithElementsBeforeAfter */}
      <Render if={mode === 'centerWithElementsBeforeAfter'}>
        <div className={classNames(styles.carouselItemsContainer, className)}>
          <ElementsBeforeAfter
            widthElement={widthPerItem}
            margin={marginLeft}
            className={styles.carouselItem}
            isFirstElement={true}
          >
            {itemsBefore}
          </ElementsBeforeAfter>

          {centerItems.map((element, i) => (
            <div key={i} style={{ width: `${widthPerItem}%` }} className={classNames(styles.carouselItem)}>
              {element}
            </div>
          ))}

          <ElementsBeforeAfter widthElement={widthPerItem} margin={marginRight} className={styles.carouselItem}>
            {itemsAfter}
          </ElementsBeforeAfter>
        </div>
      </Render>

      {/* MODE: start or center => all items in a normal scroll container */}
      <Render if={mode === 'start' || mode === 'center'}>
        <div
          className={classNames(styles.carouselItemsContainer, styles.carouselScroll, className)}
          ref={scrollContainerRef}
        >
          {items.map((item, idx) => (
            <div className={styles.carouselItem} key={idx}>
              {item}
            </div>
          ))}
        </div>
      </Render>

      {/* Right Arrow */}
      <Render if={shouldShowArrow('right')}>
        <Icon
          onClick={handleClickRight}
          className={classNames(styles.arrowRight, styles.carouselArrow, arrows?.showBorder ? styles.arrowBorder : '')}
          type={IconSize.small}
          color={'--n000'}
          hasCircle={true}
          fillColor={arrows?.color ?? 'rgba(var(--fn-fg-rgb), 0.7)'}
          circleSize={arrows?.circleSize ?? 48}
          style={{ '--arrow-hover-color': arrows?.hoverColor } as React.CSSProperties}
        >
          {IconNames.arrowRight}
        </Icon>
      </Render>

      {/* Right Fade Overlay */}
      <Render if={showFade(isAtRightExtreme, canScrollRight)}>
        <div className={styles.after} />
      </Render>
    </ComponentContainer>
  );
};
