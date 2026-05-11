import { classNames } from '@helpers/classNames';
import { ComponentContainer } from '@vanguard/ComponentContainer';
import React, { useRef } from 'react';
import { animated } from 'react-spring';

import { Arrow, ArrowComponentType, ArrowStyle } from './Arrow/Arrow';
import { Bullet, BulletComponentType, BulletStyle } from './Bullet/Bullet';
import { Bullets, BulletsComponentType } from './Bullets/Bullets';
import { useCarouselMovement } from './hooks/use-carousel-movement.ts';
import styles from './SlideCarousel.module.scss';

export type SlideCarouselArrowPlacement = 'overlay' | 'outside';
export type SlideCarouselBulletPlacement = 'overlayBottom' | 'below';

const SLIDE_GAP_PX = 16;

export interface SliderProps {
  activeIndex?: number;
  initialIndex?: number; // @todo when this is set, skip the entry animation when opening at the N-th slide
  ArrowComponent?: ArrowComponentType;
  arrowStyle?: ArrowStyle;
  auto?: number;
  BulletComponent?: BulletComponentType;
  BulletsComponent?: BulletsComponentType;
  bulletStyle?: BulletStyle;
  children?: React.ReactNode[];
  hasArrows?: boolean;
  hasBullets?: boolean;
  onSlideChange?: (slide: number) => void;
  setSlideCustom?: (slide: number) => number;
  slidesAtOnce?: number;
  slidesToSlide?: number;
  /** Merged onto outer container; consumer-owned sizing escape hatch. */
  className?: string;
  arrowPlacement?: SlideCarouselArrowPlacement;
  bulletPlacement?: SlideCarouselBulletPlacement;
}

export const SlideCarousel: React.FunctionComponent<SliderProps> = ({
  activeIndex = 0,
  initialIndex = activeIndex,
  ArrowComponent = Arrow,
  arrowStyle = {},
  auto = 0,
  BulletComponent = Bullet,
  BulletsComponent = Bullets,
  bulletStyle = {},
  children = [],
  hasArrows = false,
  hasBullets = false,
  onSlideChange = () => undefined,
  setSlideCustom = undefined,
  slidesAtOnce = 1,
  slidesToSlide = 1,
  className,
  arrowPlacement = 'overlay',
  bulletPlacement = 'overlayBottom',
}) => {
  const sliderRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);

  const slides = children || [];
  const length = slides.length;
  const slideGap = length > 1 ? SLIDE_GAP_PX : 0;
  const slideWidth = `calc((100% - ${slideGap * Math.max(slidesAtOnce - 1, 0)}px) / ${slidesAtOnce})`;

  const { gestureBinds, maxSlide, nextSlide, previousSlide, slide, trackStyle, updateSlide } = useCarouselMovement({
    activeIndex,
    auto,
    initialIndex,
    length,
    onSlideChange,
    setSlideCustom,
    slideGap,
    slidesAtOnce,
    slidesToSlide,
    viewportRef,
  });

  const renderBullets = () => {
    const bullets = [];

    for (let index = 0; index <= maxSlide; index++) {
      bullets.push(
        <BulletComponent
          key={index}
          isActive={index === slide}
          onClick={() => updateSlide(index)}
          style={bulletStyle}
        />,
      );
    }

    return bullets;
  };

  const renderOverlayArrows = () => {
    if (!hasArrows || arrowPlacement !== 'overlay') {
      return null;
    }

    return (
      <React.Fragment>
        <ArrowComponent
          className={classNames(styles.slideCarouselArrow, styles.arrowLeft)}
          style={arrowStyle}
          direction="left"
          onClick={previousSlide}
        />
        <ArrowComponent
          className={classNames(styles.slideCarouselArrow, styles.arrowRight)}
          style={arrowStyle}
          direction="right"
          onClick={nextSlide}
        />
      </React.Fragment>
    );
  };

  const renderOutsideLeftArrow = () => {
    if (!hasArrows || arrowPlacement !== 'outside') {
      return null;
    }

    return <ArrowComponent style={arrowStyle} direction="left" onClick={previousSlide} />;
  };

  const renderOutsideRightArrow = () => {
    if (!hasArrows || arrowPlacement !== 'outside') {
      return null;
    }

    return <ArrowComponent style={arrowStyle} direction="right" onClick={nextSlide} />;
  };

  const renderOverlayBullets = () => {
    if (!hasBullets || bulletPlacement !== 'overlayBottom') {
      return null;
    }

    return (
      <BulletsComponent placement="overlayBottom">
        <ul className={styles.slideCarouselBullets}>{renderBullets()}</ul>
      </BulletsComponent>
    );
  };

  const renderBelowBullets = () => {
    if (!hasBullets || bulletPlacement !== 'below') {
      return null;
    }

    return (
      <BulletsComponent placement="below">
        <ul className={styles.slideCarouselBullets}>{renderBullets()}</ul>
      </BulletsComponent>
    );
  };

  return (
    <ComponentContainer className={classNames(styles.SlideCarouselContainer, className)} innerRef={sliderRef}>
      <div
        className={classNames(
          styles.carouselMain,
          arrowPlacement === 'outside' ? styles.carouselMainOutsideArrows : undefined,
        )}
      >
        {renderOutsideLeftArrow()}

        <div className={styles.slideCarousel}>
          {renderOverlayArrows()}
          {renderOverlayBullets()}

          <div className={styles.slideCarouselViewport} ref={viewportRef}>
            <animated.div
              {...gestureBinds()}
              className={styles.slideCarouselTrack}
              style={{ ...trackStyle, gap: `${slideGap}px` }}
            >
              {slides.map((child, index) => (
                <div
                  key={index}
                  className={classNames(styles.slideCarouselSlide, 'slider__slide')}
                  style={{ flex: `0 0 ${slideWidth}` }}
                >
                  {child}
                </div>
              ))}
            </animated.div>
          </div>
        </div>

        {renderOutsideRightArrow()}
      </div>

      {renderBelowBullets()}
    </ComponentContainer>
  );
};
