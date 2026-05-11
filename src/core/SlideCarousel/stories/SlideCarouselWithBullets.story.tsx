import React from 'react';
import { expect, fn, userEvent } from 'storybook/test';

import { SlideCarousel } from '../SlideCarousel';
import { CarouselWrapper, SLIDES, SlideCarouselStory } from './_SlideCarousel.default';

export const SlideCarouselWithBullets: SlideCarouselStory = {
  args: {
    hasBullets: true,
    onSlideChange: fn(),
  },
  render: (args) => (
    <CarouselWrapper>
      <SlideCarousel {...args}>{SLIDES}</SlideCarousel>
    </CarouselWrapper>
  ),
  play: async ({ canvasElement, args }) => {
    const bullets = canvasElement.querySelectorAll('li');

    await expect(bullets).toHaveLength(3);
    await expect((bullets[0] as HTMLElement).style.opacity).toBe('1');
    await expect((bullets[1] as HTMLElement).style.opacity).toBe('0.5');

    await userEvent.click(bullets[2]);

    await expect((bullets[2] as HTMLElement).style.opacity).toBe('1');
    await expect((bullets[0] as HTMLElement).style.opacity).toBe('0.5');
    await expect(args.onSlideChange).toHaveBeenLastCalledWith(2);
  },
};
