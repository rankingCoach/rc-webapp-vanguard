import { render } from '@test-utils/test-utils';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { RcNavLink } from './RcNavLink';

describe('RcNavLink data-slot contract', () => {
  it('slots the anchor and lets the caller override the slot through the existing spread', () => {
    const { container, rerender } = render(<RcNavLink to={'/locations/$locationId'} params={{ locationId: '42' }}>Location</RcNavLink>);
    const root = container.querySelector('[data-slot="rc-nav-link"]');
    expect(root?.tagName).toBe('A');
    expect(root?.getAttribute('href')).toBe('/locations/42');
    rerender(<RcNavLink params={{ locationId: '42' }} data-slot={'custom-link'} />);
    expect(container.querySelector('[data-slot="custom-link"]')?.tagName).toBe('A');
    expect(container.querySelector('[data-slot="rc-nav-link"]')).toBeNull();
  });
});
