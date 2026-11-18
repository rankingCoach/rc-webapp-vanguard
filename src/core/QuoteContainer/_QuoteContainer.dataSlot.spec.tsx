import { render } from '@test-utils/test-utils';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

import { QuoteContainer } from './QuoteContainer';

vi.mock('@custom-hooks/use-dynamic-import/use-dynamic-import', () => ({
  useDynamicImport: () => ({ SvgIcon: 'quote.svg', loading: false, error: null }),
}));
vi.mock('@vanguard/StyledSVG/StyledSVG', () => ({ StyledSVG: () => null }));

describe('QuoteContainer data-slot contract', () => {
  it('slots the consumer root, body and loaded quote marks', () => {
    const { container } = render(<QuoteContainer className={'mine'}>Quote</QuoteContainer>);
    const root = container.querySelector('[data-slot="quote-container"]');
    expect(root?.tagName).toBe('DIV');
    expect(root?.classList.contains('mine')).toBe(true);
    expect(root?.querySelector('[data-slot="quote-container-body"]')?.tagName).toBe('DIV');
    expect(root?.querySelector('[data-slot="quote-container-body"]')?.textContent).toBe('Quote');
    expect(root?.querySelector('[data-slot="quote-container-marks"]')?.tagName).toBe('DIV');
  });
});
