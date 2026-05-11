import React from 'react';
import { expect, fn, userEvent } from 'storybook/test';

import { SlideCarousel } from '../SlideCarousel';
import { CarouselWrapper, SLIDES, SlideCarouselStory } from './_SlideCarousel.default';

export const SlideCarouselWithArrowsAndBullets: SlideCarouselStory = {
  args: {
    hasArrows: true,
    hasBullets: true,
    onSlideChange: fn(),
  },
  render: (args) => (
    <CarouselWrapper>
      <SlideCarousel {...args}>{SLIDES}</SlideCarousel>
    </CarouselWrapper>
  ),
  play: async ({ canvasElement, args }) => {
    const arrows = canvasElement.querySelectorAll('a');
    const bullets = canvasElement.querySelectorAll('li');

    await expect(arrows).toHaveLength(2);
    await expect(bullets).toHaveLength(3);
    await expect((bullets[0] as HTMLElement).style.opacity).toBe('1');

    await userEvent.click(arrows[1]);

    await expect((bullets[1] as HTMLElement).style.opacity).toBe('1');
    await expect((bullets[0] as HTMLElement).style.opacity).toBe('0.5');
    await expect(args.onSlideChange).toHaveBeenLastCalledWith(1);

    await userEvent.click(arrows[0]);

    await expect((bullets[0] as HTMLElement).style.opacity).toBe('1');
    await expect(args.onSlideChange).toHaveBeenLastCalledWith(0);
  },
};
