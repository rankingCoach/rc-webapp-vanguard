import React, { useState } from 'react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { SlideCarousel } from '../SlideCarousel';
import { CarouselWrapper, SLIDES, SlideCarouselStory } from './_SlideCarousel.default';

export const SlideCarouselControlled: SlideCarouselStory = {
  args: {
    hasArrows: true,
    hasBullets: true,
    onSlideChange: fn(),
  },
  render: function Render(args) {
    const [activeIndex, setActiveIndex] = useState(0);

    return (
      <div>
        <CarouselWrapper>
          <SlideCarousel
            {...args}
            activeIndex={activeIndex}
            onSlideChange={(i) => {
              setActiveIndex(i);
              args.onSlideChange?.(i);
            }}
          >
            {SLIDES}
          </SlideCarousel>
        </CarouselWrapper>
        <div style={{ display: 'flex', gap: '8px', marginTop: '16px', justifyContent: 'center' }}>
          {SLIDES.map((_, i) => (
            <button key={i} data-testid={`go-to-${i}`} onClick={() => setActiveIndex(i)}>
              Slide {i + 1}
            </button>
          ))}
        </div>
      </div>
    );
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const bullets = canvasElement.querySelectorAll('li');

    await expect((bullets[0] as HTMLElement).style.opacity).toBe('1');

    await userEvent.click(await canvas.findByTestId('go-to-2'));

    await expect((bullets[2] as HTMLElement).style.opacity).toBe('1');
    await expect((bullets[0] as HTMLElement).style.opacity).toBe('0.5');
    await waitFor(() => expect(args.onSlideChange).toHaveBeenLastCalledWith(2));

    await userEvent.click(await canvas.findByTestId('go-to-0'));

    await expect((bullets[0] as HTMLElement).style.opacity).toBe('1');
  },
};
