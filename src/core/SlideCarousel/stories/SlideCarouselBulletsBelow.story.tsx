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
];

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <div style={{ width: '600px' }}>{children}</div>
);

export const SlideCarouselBulletsBelow: SlideCarouselStory = {
  args: {
    bulletPlacement: 'below',
    hasBullets: true,
  },
  render: (args) => (
    <Wrapper>
      <SlideCarousel {...args}>{CARDS}</SlideCarousel>
    </Wrapper>
  ),
  play: async ({ canvasElement }) => {
    const root = canvasElement.querySelector('[class*="SlideCarouselContainer"]') as HTMLElement;
    const main = root.querySelector('[class*="carousel-main"]') as HTMLElement;
    const bullets = root.querySelector('[class*="BulletsContainer"]') as HTMLElement;

    await expect(window.getComputedStyle(root).display).toBe('block');
    await expect(bullets.parentElement).toBe(root);
    await expect(!!(main.compareDocumentPosition(bullets) & Node.DOCUMENT_POSITION_FOLLOWING)).toBe(true);
    await expect(window.getComputedStyle(bullets).position).toBe('static');
    await expect(parseFloat(window.getComputedStyle(bullets).marginTop)).toBeGreaterThan(0);
  },
};
