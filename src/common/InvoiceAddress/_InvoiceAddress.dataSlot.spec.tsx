import { render } from '@test-utils/test-utils';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { InvoiceAddress } from './InvoiceAddress';

describe('InvoiceAddress data-slot contract', () => {
  it('slots owned elements and renders with story props', () => {
    const { container } = render(<InvoiceAddress invoiceCompanyName={'Daniel Wette'} formattedAddress={'Hohe Str. 73-75, 50667 Köln, Germany'} className={'mine'} />);
    expect(container.querySelector('[data-slot="invoice-address"]')?.tagName).toBe('DIV');
    expect(container.querySelector('[data-slot="invoice-address"]')?.classList.contains('mine')).toBe(true);
  });
});
