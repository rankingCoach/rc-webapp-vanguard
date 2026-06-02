import React from 'react';
import { expect, fn, userEvent } from 'storybook/test';

import { BulletProps } from '../Bullet/Bullet';
import { SlideCarousel } from '../SlideCarousel';
import { CarouselWrapper, SLIDES, SlideCarouselStory } from './_SlideCarousel.default';

const CustomBullet = ({ isActive, onClick }: BulletProps) => (
  <button
    data-testid="custom-bullet"
    data-active={isActive}
    onClick={onClick}
    style={{
      width: isActive ? '24px' : '12px',
      height: '6px',
      margin: '0 4px',
      padding: 0,
      border: 'none',
      borderRadius: '3px',
      background: isActive ? '#222' : '#bbb',
      cursor: 'pointer',
      transition: 'width 0.2s ease, background 0.2s ease',
    }}
  />
);

export const SlideCarouselCustomBullets: SlideCarouselStory = {
  args: {
    hasBullets: true,
    BulletComponent: CustomBullet,
    onSlideChange: fn(),
  },
  render: (args) => (
    <CarouselWrapper>
      <SlideCarousel {...args}>{SLIDES}</SlideCarousel>
    </CarouselWrapper>
  ),
  play: async ({ canvasElement, args }) => {
    const bullets = canvasElement.querySelectorAll('[data-testid="custom-bullet"]');

    await expect(bullets).toHaveLength(3);
    await expect(canvasElement.querySelectorAll('li').length).toBe(0);
    await expect((bullets[0] as HTMLElement).getAttribute('data-active')).toBe('true');
    await expect((bullets[1] as HTMLElement).getAttribute('data-active')).toBe('false');

    await userEvent.click(bullets[2] as HTMLElement);

    await expect(args.onSlideChange).toHaveBeenLastCalledWith(2);
    const bulletsAfter = canvasElement.querySelectorAll('[data-testid="custom-bullet"]');
    await expect((bulletsAfter[2] as HTMLElement).getAttribute('data-active')).toBe('true');
    await expect((bulletsAfter[0] as HTMLElement).getAttribute('data-active')).toBe('false');
  },
};