import { StoryObj } from '@storybook/react';
import React from 'react';

import { SlideCarousel } from '../SlideCarousel';

export type SlideCarouselStory = StoryObj<typeof SlideCarousel>;

export const EXCLUDED_CONTROLS = [
  'ArrowComponent',
  'BulletComponent',
  'BulletsComponent',
  'setSlideCustom',
  'children',
];

export function Slide({ n, bg }: { n: number; bg: string }) {
  return (
    <div
      data-testid={`slide-${n}`}
      style={{
        background: bg,
        height: '200px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '24px',
        fontWeight: 600,
        borderRadius: '8px',
      }}
    >
      Slide {n}
    </div>
  );
}

export const SLIDES = [
  <Slide key="1" n={1} bg="#e8f4fd" />,
  <Slide key="2" n={2} bg="#fde8e8" />,
  <Slide key="3" n={3} bg="#e8fde8" />,
];

export function CarouselWrapper({ children }: { children: React.ReactNode }) {
  return <div style={{ width: '600px', height: '250px', position: 'relative' }}>{children}</div>;
}
