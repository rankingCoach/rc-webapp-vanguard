import { render } from '@test-utils/test-utils';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { PageContainer } from './PageContainer';

describe('PageContainer data-slot contract', () => {
  it('slots owned elements and renders with valid props', () => {
    const { container } = render(<PageContainer className={'mine'}><div>Content</div></PageContainer>);
    expect(container.querySelector('[data-slot="page-container"]')?.tagName).toBe('DIV');
    expect(container.querySelector('[data-slot="page-container"]')?.classList.contains('mine')).toBe(true);
  });

  it('lets caller data attributes override the default slot', () => {
    const { container } = render(<PageContainer className={'mine'} data-slot={'custom-page'}>Content</PageContainer>);
    expect(container.querySelector('.mine')?.getAttribute('data-slot')).toBe('custom-page');
  });
});
