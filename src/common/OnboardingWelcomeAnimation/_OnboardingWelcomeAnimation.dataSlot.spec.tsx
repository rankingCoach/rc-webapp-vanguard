import { render } from '@test-utils/test-utils';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { OnboardingWelcomeAnimation } from './OnboardingWelcomeAnimation';

describe('OnboardingWelcomeAnimation data-slot contract', () => {
  it('slots owned elements and renders with valid props', () => {
    const { container } = render(<OnboardingWelcomeAnimation texts={['Welcome']} />);
    expect(container.querySelector('[data-slot="onboarding-welcome-animation"]')?.tagName).toBe('DIV');
  });
});
