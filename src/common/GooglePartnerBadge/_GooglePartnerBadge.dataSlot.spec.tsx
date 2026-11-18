import { render } from '@test-utils/test-utils';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { GooglePartnerBadge } from './GooglePartnerBadge';

describe('GooglePartnerBadge data-slot contract', () => {
  it('slots owned elements and renders with story props', () => {
    const { container } = render(<GooglePartnerBadge />);
    expect(container.querySelector('[data-slot="google-partner-badge"]')?.tagName).toBe('DIV');
    expect(container.querySelector('[data-slot="google-partner-badge-link"]')?.tagName).toBe('A');
    expect(container.querySelector('[data-slot="google-partner-badge-image"]')?.tagName).toBe('IMG');
  });
});
