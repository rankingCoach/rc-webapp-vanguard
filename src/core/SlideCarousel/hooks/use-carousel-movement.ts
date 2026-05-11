import { useGesture } from '@use-gesture/react';
import { RefObject, useEffect, useMemo, useRef, useState } from 'react';
import { useSpring } from 'react-spring';

interface UseCarouselMovementArgs {
  activeIndex: number;
  auto: number;
  initialIndex: number;
  length: number;
  onSlideChange: (slide: number) => void;
  setSlideCustom?: (slide: number) => number;
  slideGap: number;
  slidesAtOnce: number;
  slidesToSlide: number;
  viewportRef: RefObject<HTMLDivElement>;
}

const clamp = (input: number, lower: number, upper: number) => Math.min(Math.max(input, lower), upper);

const getMaxSlide = (length: number, slidesAtOnce: number) => Math.max(0, length - slidesAtOnce);

const useLatestRef = <T>(value: T) => {
  const ref = useRef(value);
  ref.current = value;
  return ref;
};

export const useCarouselMovement = ({
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
}: UseCarouselMovementArgs) => {
  const maxSlide = getMaxSlide(length, slidesAtOnce);
  const getSlideWidth = () => {
    const viewportWidth = viewportRef.current?.getBoundingClientRect().width ?? 0;
    const totalGapWidth = slideGap * Math.max(slidesAtOnce - 1, 0);
    return (viewportWidth - totalGapWidth) / slidesAtOnce;
  };

  const resolveSlideIndex = (index: number) => {
    const customIndex = setSlideCustom ? setSlideCustom(index) : index;

    return clamp(customIndex, 0, maxSlide);
  };

  const [slide, setSlideState] = useState(() => resolveSlideIndex(initialIndex));

  const slideRef = useLatestRef(slide);
  const onSlideChangeRef = useLatestRef(onSlideChange);

  const [trackSpring, trackApi] = useSpring(() => ({
    x: 0,
    config: {
      tension: 280,
      friction: 30,
      mass: 1,
    },
  }));

  const updateSlide = (index: number) => {
    setSlideState(resolveSlideIndex(index));
  };

  const moveTrackToSlide = (targetSlide: number, immediate = false) => {
    const slideWidth = getSlideWidth();
    const slideOffset = slideWidth + slideGap;

    if (slideWidth <= 0) return;

    trackApi.start({
      x: -targetSlide * slideOffset,
      immediate,
    });
  };

  const moveTrackWhileDragging = (x: number) => {
    trackApi.start({
      x,
      immediate: true,
    });
  };

  const getDraggedSlide = (currentSlide: number, xDirection: number) =>
    clamp(currentSlide + (xDirection > 0 ? -1 : 1), 0, maxSlide);

  const gestureBinds = useGesture(
    {
      onDrag: ({ down, movement: [xDelta], direction: [xDirection], cancel, active, last }) => {
        const slideWidth = getSlideWidth();
        const slideOffset = slideWidth + slideGap;

        if (slideWidth <= 0) return;

        const currentSlide = slideRef.current;
        const currentTrackX = -currentSlide * slideOffset;
        const passedDragThreshold = down && Math.abs(xDelta) > slideOffset / 2;

        if (passedDragThreshold) {
          const targetSlide = getDraggedSlide(currentSlide, xDirection);
          cancel?.();

          if (active) {
            if (targetSlide === currentSlide) {
              moveTrackToSlide(currentSlide);
            } else {
              updateSlide(targetSlide);
            }
          }

          return;
        }

        if (active && down) {
          moveTrackWhileDragging(currentTrackX + xDelta);
          return;
        }

        if (last || !down) {
          moveTrackToSlide(currentSlide);
        }
      },
    },
    {
      drag: {
        delay: 200,
        filterTaps: true,
      },
    },
  );

  useEffect(() => {
    moveTrackToSlide(slide);
    onSlideChangeRef.current(slide);
  }, [slide, slidesAtOnce]);

  useEffect(() => {
    let interval: number;

    if (auto > 0 && length > 0) {
      interval = window.setInterval(() => {
        const nextSlide = slideRef.current >= maxSlide ? 0 : slideRef.current + 1;
        updateSlide(nextSlide);
      }, auto);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [auto, length, maxSlide]);

  useEffect(() => {
    const targetSlide = length > 0 ? resolveSlideIndex(activeIndex % length) : 0;

    if (targetSlide !== slideRef.current) {
      updateSlide(targetSlide);
    }
  }, [activeIndex, length, maxSlide]);

  useEffect(() => {
    if (!viewportRef.current) return;
    if (typeof ResizeObserver === 'undefined') return;

    const resizeObserver = new ResizeObserver(() => {
      moveTrackToSlide(slideRef.current, true);
    });

    resizeObserver.observe(viewportRef.current);

    return () => resizeObserver.disconnect();
  }, [slidesAtOnce]);

  const goToFirstSlide = () => {
    updateSlide(0);
  };

  const goToLastSlide = () => {
    updateSlide(maxSlide);
  };

  const nextSlide = () => {
    const reachedLastSlide = slide >= maxSlide;
    const nextSlideExists = slide + slidesAtOnce - 1 + slidesToSlide < length - 1;

    if (reachedLastSlide) {
      goToFirstSlide();
      return;
    }

    if (!nextSlideExists) {
      goToLastSlide();
      return;
    }

    updateSlide(slide + slidesToSlide);
  };

  const previousSlide = () => {
    if (slide === 0) {
      goToLastSlide();
      return;
    }

    if (slide - slidesToSlide <= 0) {
      goToFirstSlide();
      return;
    }

    updateSlide(slide - slidesToSlide);
  };

  const trackStyle = useMemo(
    () => ({
      transform: trackSpring.x.to((x) => `translate3d(${x}px, 0, 0)`),
      willChange: 'transform',
      touchAction: 'pan-y',
    }),
    [trackSpring.x],
  );

  return {
    gestureBinds,
    maxSlide,
    nextSlide,
    previousSlide,
    slide,
    trackStyle,
    updateSlide,
  };
};
