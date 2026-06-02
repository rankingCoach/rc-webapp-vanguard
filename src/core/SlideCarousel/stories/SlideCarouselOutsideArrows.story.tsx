import React from 'react';
import { expect } from 'storybook/test';

import { SlideCarousel } from '../SlideCarousel';
import { SlideCarouselStory } from './_SlideCarousel.default';

const Card = ({ n, bg }: { n: number; bg: string }) => (
  <div
    data-testid={`card-${n}`}
    style={{
      background: bg,
      height: '180px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '20px',
      fontWeight: 600,
      borderRadius: '8px',
    }}
  >
    Card {n}
  </div>
);

const CARDS = [
  <Card key="1" n={1} bg="#e8f4fd" />,
  <Card key="2" n={2} bg="#fde8e8" />,
  <Card key="3" n={3} bg="#e8fde8" />,
  <Card key="4" n={4} bg="#fdf6e8" />,
];

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <div style={{ width: '700px' }}>{children}</div>
);

export const SlideCarouselOutsideArrows: SlideCarouselStory = {
  args: {
    arrowPlacement: 'outside',
    hasArrows: true,
    slidesAtOnce: 2,
  },
  render: (args) => (
    <Wrapper>
      <SlideCarousel {...args}>{CARDS}</SlideCarousel>
    </Wrapper>
  ),
  play: async ({ canvasElement }) => {
    const root = canvasElement.querySelector('[class*="SlideCarouselContainer"]') as HTMLElement;
    const main = root.querySelector('[class*="carousel-main"]') as HTMLElement;
    const carousel = root.querySelector('[class*="slide-carousel"]:not([class*="carousel-main"])') as HTMLElement;
    const arrows = main.querySelectorAll(':scope > a');

    await expect(window.getComputedStyle(root).display).toBe('block');
    await expect(window.getComputedStyle(main).display).toBe('flex');
    await expect(arrows.length).toBe(2);
    await expect(carousel.contains(arrows[0])).toBe(false);
    await expect(carousel.contains(arrows[1])).toBe(false);
  },
};
