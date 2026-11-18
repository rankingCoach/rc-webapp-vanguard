import { render } from '@test-utils/test-utils';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { AgeSlider } from './AgeSlider';

describe('AgeSlider data-slot contract', () => {
  it('slots owned elements and renders with valid props', () => {
    const { container } = render(<AgeSlider minAge={18} maxAge={65} ageRange={[25, 55]} />);
    expect(container.querySelector('[data-slot="age-slider"]')?.tagName).toBe('DIV');
  });
});
