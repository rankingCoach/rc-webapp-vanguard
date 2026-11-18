import { render } from '@test-utils/test-utils';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { StarRating } from './StarRating';
import { Star } from './Star/Star';

describe('StarRating data-slot contract', () => {
  it('slots rating, stars and each star layer', () => {
    const { container, rerender } = render(<StarRating value={2} size={16} readonly={false} />);
    const root = () => container.querySelector('[data-slot="star-rating"]')!;
    expect(root().tagName).toBe('DIV');
    expect(root().hasAttribute('data-readonly')).toBe(false);
    expect(container.querySelectorAll('div[data-slot="star"]')).toHaveLength(5);
    for (const slot of ['star-result', 'star-hover', 'star-background']) {
      expect(container.querySelectorAll(`span[data-slot="${slot}"]`)).toHaveLength(5);
    }
    rerender(<StarRating value={2} size={16} readonly />);
    expect(root().getAttribute('data-readonly')).toBe('');
    rerender(<Star value={1} />);
    expect(container.querySelector('[data-slot="star"]')?.classList.contains('rating')).toBe(true);
  });
});
