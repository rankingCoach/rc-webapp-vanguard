import { render } from '@test-utils/test-utils';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { Rating } from './Rating';
import { RatingDistribution } from './RatingDistribution/RatingDistribution';

describe('Rating data-slot contract', () => {
  it('slots the consumer root, layout and numeric value on either side', () => {
    const { container, rerender } = render(<Rating value={4} size={24} className={'mine'} />);
    expect(container.querySelector('[data-slot="rating-container"]')?.classList.contains('mine')).toBe(true);
    expect(container.querySelector('[data-slot="rating"]')?.tagName).toBe('DIV');
    expect(container.querySelector('[data-slot="rating-value"]')?.tagName).toBe('SPAN');
    rerender(<Rating value={4} size={24} valueAlign={'right'} />);
    expect(container.querySelector('[data-slot="rating-value"]')?.tagName).toBe('SPAN');
  });

  it('slots the distribution and progress row wrappers', () => {
    const { container } = render(<RatingDistribution ratingDistributionData={[{ ratingsNumber: 2, starsNumber: 4, color: '--n300' }]} />);
    for (const slot of ['rating-distribution', 'rating-distribution-title', 'rating-distribution-content', 'rating-distribution-bars', 'rating-stars-and-progress-bar', 'rating-stars-and-progress-bar-stars', 'rating-stars-and-progress-bar-progress']) {
      expect(container.querySelector(`[data-slot="${slot}"]`)?.tagName).toBe('DIV');
    }
  });
});
