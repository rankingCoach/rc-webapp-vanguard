import React from 'react';
import { expect, within } from 'storybook/test';

import { SlideCarousel } from '../SlideCarousel';
import { CarouselWrapper, SLIDES, SlideCarouselStory } from './_SlideCarousel.default';

export const SlideCarouselBasic: SlideCarouselStory = {
  render: () => (
    <CarouselWrapper>
      <SlideCarousel>{SLIDES}</SlideCarousel>
    </CarouselWrapper>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(await canvas.findByTestId('slide-1')).toBeInTheDocument();
    await expect(await canvas.findByTestId('slide-2')).toBeInTheDocument();
    await expect(await canvas.findByTestId('slide-3')).toBeInTheDocument();
    await expect(canvasElement.querySelectorAll('a').length).toBe(0);
    await expect(canvasElement.querySelectorAll('li').length).toBe(0);
  },
};
