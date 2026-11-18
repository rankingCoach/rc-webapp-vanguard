import { render } from '@test-utils/test-utils';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { FadeCarouselAuto } from './FadeCarouselAuto';

const slot = (container: HTMLElement, name: string) => container.querySelector(`[data-slot="${name}"]`) as HTMLElement;

describe('FadeCarouselAuto data-slot contract', () => {
  it('slots the existing elements', () => {
    const { container } = render(<FadeCarouselAuto items={[{ title: 'Item' }]} ItemType={({ title }) => <span>{title}</span>} />);
    expect(slot(container, 'fade-carousel-auto').tagName).toBe('DIV');
    expect(slot(container, 'fade-carousel-auto-scroll').tagName).toBe('DIV');
    expect(slot(container, 'fade-carousel-auto-item').tagName).toBe('DIV');
    expect(container.querySelectorAll('[data-slot="fade-carousel-auto-item"]')).toHaveLength(2);
  });
});
