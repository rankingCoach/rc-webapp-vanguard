import React from 'react';
import { expect } from 'storybook/test';

import { SlideCarousel } from '../SlideCarousel';
import { CarouselWrapper, Slide, SlideCarouselStory } from './_SlideCarousel.default';

export const SlideCarouselMultipleSlidesAtOnce: SlideCarouselStory = {
  render: () => (
    <CarouselWrapper>
      <SlideCarousel hasArrows hasBullets slidesAtOnce={2}>
        {[
          <Slide key="1" n={1} bg="#e8f4fd" />,
          <Slide key="2" n={2} bg="#fde8e8" />,
          <Slide key="3" n={3} bg="#e8fde8" />,
          <Slide key="4" n={4} bg="#fdf5e8" />,
        ]}
      </SlideCarousel>
    </CarouselWrapper>
  ),
  play: async ({ canvasElement }) => {
    // 4 slides shown 2 at a time → 4 - 2 + 1 = 3 bullets
    await expect(canvasElement.querySelectorAll('li')).toHaveLength(3);
    await expect(canvasElement.querySelectorAll('.slider__slide')).toHaveLength(4);
  },
};
