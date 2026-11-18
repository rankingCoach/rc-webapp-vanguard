import { render } from '@test-utils/test-utils';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { RecommendationCard } from './RecommendationCard';

describe('RecommendationCard data-slot contract', () => {
  it('slots owned elements and renders with story props', () => {
    const { container } = render(<RecommendationCard title={'Title'} description={'Description'} details={<div>Details</div>} />);
    expect(container.querySelector('[data-slot="recommendation-card"]')?.tagName).toBe('DIV');
    expect(container.querySelector('[data-slot="recommendation-card-content"]')?.tagName).toBe('DIV');
    expect(container.querySelector('[data-slot="recommendation-card-badge"]')?.tagName).toBe('DIV');
    expect(container.querySelector('[data-slot="recommendation-card-image"]')?.tagName).toBe('IMG');
    expect(container.querySelector('[data-slot="recommendation-card-toggle"]')?.tagName).toBe('DIV');
  });
});
