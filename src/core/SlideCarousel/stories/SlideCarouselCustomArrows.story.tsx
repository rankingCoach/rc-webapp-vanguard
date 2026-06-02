import React from 'react';
import { expect, fn, userEvent } from 'storybook/test';

import { ArrowProps } from '../Arrow/Arrow';
import { SlideCarousel } from '../SlideCarousel';
import { CarouselWrapper, SLIDES, SlideCarouselStory } from './_SlideCarousel.default';

const CustomArrow = ({ direction, onClick }: ArrowProps) => (
  <button
    data-testid={`custom-arrow-${direction}`}
    onClick={onClick}
    style={{
      position: 'absolute',
      top: '50%',
      transform: 'translateY(-50%)',
      [direction]: '8px',
      zIndex: 1,
      padding: '8px 14px',
      background: '#222',
      color: '#fff',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontWeight: 600,
    }}
  >
    {direction === 'left' ? 'Prev' : 'Next'}
  </button>
);

export const SlideCarouselCustomArrows: SlideCarouselStory = {
  args: {
    hasArrows: true,
    ArrowComponent: CustomArrow,
    onSlideChange: fn(),
  },
  render: (args) => (
    <CarouselWrapper>
      <SlideCarousel {...args}>{SLIDES}</SlideCarousel>
    </CarouselWrapper>
  ),
  play: async ({ canvasElement, args }) => {
    const prev = canvasElement.querySelector('[data-testid="custom-arrow-left"]') as HTMLButtonElement;
    const next = canvasElement.querySelector('[data-testid="custom-arrow-right"]') as HTMLButtonElement;

    await expect(prev).toBeTruthy();
    await expect(next).toBeTruthy();
    await expect(canvasElement.querySelectorAll('a').length).toBe(0);

    await userEvent.click(next);
    await expect(args.onSlideChange).toHaveBeenLastCalledWith(1);

    await userEvent.click(prev);
    await expect(args.onSlideChange).toHaveBeenLastCalledWith(0);
  },
};