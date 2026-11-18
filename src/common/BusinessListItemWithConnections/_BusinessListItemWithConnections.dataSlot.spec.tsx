import { render } from '@test-utils/test-utils';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { BusinessListItemWithConnections } from './BusinessListItemWithConnections';

describe('BusinessListItemWithConnections data-slot contract', () => {
  it('slots owned elements and renders with valid props', () => {
    const { container } = render(<BusinessListItemWithConnections title={'Business'} category={'Services'} address={'Main Street'} website={'example.com'} connectCallbackClick={() => {}} />);
    expect(container.querySelector('[data-slot="business-list-item-with-connections-container"]')?.tagName).toBe('DIV');
    expect(container.querySelector('[data-slot="business-list-item-with-connections"]')?.tagName).toBe('DIV');
    expect(container.querySelector('[data-slot="business-list-item-with-connections-details"]')?.tagName).toBe('DIV');
  });
});
