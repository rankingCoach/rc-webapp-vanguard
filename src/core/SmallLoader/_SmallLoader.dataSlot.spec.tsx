import { render } from '@test-utils/test-utils';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { SmallLoader } from './SmallLoader';

describe('SmallLoader data-slot contract', () => {
  it('slots the existing wrapper and image', () => {
    const { container } = render(<SmallLoader />);
    expect(container.querySelector('[data-slot="small-loader"]')?.tagName).toBe('DIV');
    expect(container.querySelector('[data-slot="small-loader-image"]')?.tagName).toBe('IMG');
  });
});
