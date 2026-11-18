import { render } from '@test-utils/test-utils';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { AssetPreloader } from './AssetPreloader';

describe('AssetPreloader data-slot contract', () => {
  it('slots its own off-screen span', () => {
    const { container } = render(<AssetPreloader />);
    expect(container.querySelector('[data-slot="asset-preloader"]')?.tagName).toBe('SPAN');
  });
});
