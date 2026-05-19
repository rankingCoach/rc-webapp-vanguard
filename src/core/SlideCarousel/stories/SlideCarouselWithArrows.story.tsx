import React from 'react';
import { expect, fn, userEvent } from 'storybook/test';

import { SlideCarousel } from '../SlideCarousel';
import { CarouselWrapper, SLIDES, SlideCarouselStory } from './_SlideCarousel.default';

export const SlideCarouselWithArrows: SlideCarouselStory = {
  args: {
    hasArrows: true,
    onSlideChange: fn(),
  },
  render: (args) => (
    <CarouselWrapper>
      <SlideCarousel {...args}>{SLIDES}</SlideCarousel>
    </CarouselWrapper>
  ),
  play: async ({ canvasElement, args }) => {
    const arrows = canvasElement.querySelectorAll('a');

    await expect(arrows).toHaveLength(2);
    await expect(canvasElement.querySelectorAll('li').length).toBe(0);

    await userEvent.click(arrows[1]);
    await expect(args.onSlideChange).toHaveBeenLastCalledWith(1);

    await userEvent.click(arrows[0]);
    await expect(args.onSlideChange).toHaveBeenLastCalledWith(0);
  },
};
