import React from 'react';
import { expect, waitFor } from 'storybook/test';

import { SlideCarousel } from '../SlideCarousel';
import { CarouselWrapper, SLIDES, SlideCarouselStory } from './_SlideCarousel.default';

export const SlideCarouselAutoPlay: SlideCarouselStory = {
  args: {
    hasBullets: true,
    auto: 1000,
  },
  render: (args) => (
    <CarouselWrapper>
      <SlideCarousel {...args}>{SLIDES}</SlideCarousel>
    </CarouselWrapper>
  ),
  play: async ({ canvasElement }) => {
    const bullets = canvasElement.querySelectorAll('li');

    expect((bullets[0] as HTMLElement).style.opacity).toBe('1');

    // Wait for auto-play to advance to the next slide
    await waitFor(
      () => {
        expect((bullets[1] as HTMLElement).style.opacity).toBe('1');
      },
      { timeout: 2000 },
    );

    expect((bullets[0] as HTMLElement).style.opacity).toBe('0.5');
  },
};
