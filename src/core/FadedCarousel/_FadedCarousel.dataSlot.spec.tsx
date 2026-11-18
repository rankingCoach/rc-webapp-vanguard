import { render } from '@test-utils/test-utils';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { FadedCarousel } from './FadedCarousel';
import { ElementsBeforeAfter } from './ElementsBeforeAfter/ElementsBeforeAfter';

describe('FadedCarousel data-slot contract', () => {
  it('slots the consumer root, items, container and fades across modes', () => {
    const items = ['a', 'b', 'c', 'd', 'e', 'f', 'g'].map((id) => <span key={id}>{id}</span>);
    const { container, rerender } = render(<FadedCarousel items={items} className={'mine'} fade={{ enabled: true }} />);
    for (const [slot, tag] of [['faded-carousel-container', 'DIV'], ['faded-carousel', 'DIV'], ['faded-carousel-item', 'DIV'], ['faded-carousel-fade-before', 'DIV'], ['faded-carousel-fade-after', 'DIV']] ) {
      expect(container.querySelector(`[data-slot="${slot}"]`)?.tagName).toBe(tag);
    }
    expect(container.querySelector('[data-slot="faded-carousel"]')?.classList.contains('mine')).toBe(true);
    rerender(<FadedCarousel items={items} className={'mine'} mode={'centerWithElementsBeforeAfter'} />);
    expect(container.querySelector('[data-slot="faded-carousel"]')?.classList.contains('mine')).toBe(true);
    expect(container.querySelector('[data-slot="faded-carousel-item"]')?.tagName).toBe('DIV');
    expect(container.querySelector('[data-slot="elements-before-after"]')?.tagName).toBe('DIV');
  });

  it('slots standalone before/after elements on the consumer class', () => {
    const { container } = render(<ElementsBeforeAfter className={'mine'}>{[<span key={1}>Item</span>]}</ElementsBeforeAfter>);
    expect(container.querySelector('[data-slot="elements-before-after"]')?.classList.contains('mine')).toBe(true);
  });
});
