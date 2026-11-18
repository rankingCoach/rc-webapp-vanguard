import { render } from '@test-utils/test-utils';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { ListingServiceConnectionStatus } from './ListingServiceConnectionStatus';

describe('ListingServiceConnectionStatus data-slot contract', () => {
  it('slots owned elements and renders with valid props', () => {
    const { container } = render(<ListingServiceConnectionStatus fullName={'Daniel Wette'} picture={'avatar.png'} text={'Connected'} />);
    expect(container.querySelector('[data-slot="listing-service-connection-status-container"]')?.tagName).toBe('DIV');
    expect(container.querySelector('[data-slot="listing-service-connection-status"]')?.tagName).toBe('DIV');
    expect(container.querySelector('[data-slot="listing-service-connection-status-account"]')?.tagName).toBe('DIV');
    expect(container.querySelector('[data-slot="listing-service-connection-status-avatar"]')?.tagName).toBe('IMG');
    expect(container.querySelector('[data-slot="listing-service-connection-status-details"]')?.tagName).toBe('DIV');
  });
});
