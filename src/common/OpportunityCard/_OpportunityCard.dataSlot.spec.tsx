import { render } from '@test-utils/test-utils';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

import { OpportunityCard } from './OpportunityCard';

vi.mock('@custom-hooks/use-dynamic-import/use-dynamic-import', () => ({
  useDynamicImport: () => ({ SvgIcon: 'directories.svg', loading: false, error: null }),
}));

describe('OpportunityCard data-slot contract', () => {
  it('slots owned elements and renders with valid props', () => {
    const { container } = render(<OpportunityCard svg={'directories'} title={'Title'} subtitle={['First', 'Second']} onClick={() => {}} />);
    expect(container.querySelector('[data-slot="opportunity-card"]')?.tagName).toBe('DIV');
    expect(container.querySelector('[data-slot="opportunity-card-image"]')?.tagName).toBe('IMG');
    expect(container.querySelector('[data-slot="opportunity-card-content"]')?.tagName).toBe('DIV');
    expect(container.querySelector('[data-slot="opportunity-card-header"]')?.tagName).toBe('DIV');
    expect(container.querySelector('[data-slot="opportunity-card-subtitle"]')?.tagName).toBe('DIV');
    expect(container.querySelectorAll('[data-slot="opportunity-card-subtitle"]')).toHaveLength(2);
  });
});
