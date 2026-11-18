import { render } from '@test-utils/test-utils';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

// jsdom has no canvas; same lottie mock as src/core/RcErrorBoundry/_error-logging.spec.tsx.
vi.mock('lottie-web', () => ({ default: { loadAnimation: () => ({ destroy: () => {} }) } }));
vi.mock('lottie-web/build/player/lottie_light', () => ({ default: { loadAnimation: () => ({ destroy: () => {} }) } }));

import { PageSectionRecommended } from './PageSectionRecommended';

describe('PageSectionRecommended data-slot contract', () => {
  it('slots owned elements and renders with story props', () => {
    const { container } = render(
      <PageSectionRecommended
        hasBadge={true}
        buttonText={'Find out how you can get listed'}
        title={["You're not listed in 19 directories.", 'Publish your business now in all directories with one click.']}
        description={
          'Upgrade to rankingCoach 360, and with just a few clicks, you can now automatically add your business to up to 25 top directories or take over existing entries.'
        }
        imageUrl={'recommendation.svg'}
      >
        <span>Content</span>
      </PageSectionRecommended>,
    );
    expect(container.querySelector('[data-slot="page-section-recommended"]')?.tagName).toBe('DIV');
    expect(container.querySelector('[data-slot="page-section-recommended-image"]')?.tagName).toBe('DIV');
    expect(container.querySelector('[data-slot="page-section-recommended-content"]')?.tagName).toBe('DIV');
    expect(container.querySelector('[data-slot="page-section-recommended-title"]')?.tagName).toBe('DIV');
    expect(container.querySelector('[data-slot="page-section-recommended-children"]')?.tagName).toBe('DIV');
  });
});
