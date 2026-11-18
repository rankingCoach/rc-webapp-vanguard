import { render } from '@test-utils/test-utils';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { UpsellingTrigger } from './UpsellingTrigger';

describe('UpsellingTrigger data-slot contract', () => {
  it('slots owned elements and renders with story props', () => {
    const { container } = render(<UpsellingTrigger productName={'rankingcoach'} onclick={() => {}} />);
    expect(container.querySelector('[data-slot="upselling-trigger-container"]')?.tagName).toBe('DIV');
    expect(container.querySelector('[data-slot="upselling-trigger"]')?.tagName).toBe('DIV');
    expect(container.querySelector('[data-slot="upselling-trigger-content"]')?.tagName).toBe('DIV');
    expect(container.querySelector('[data-slot="upselling-trigger-illustration"]')?.tagName).toBe('DIV');
  });
});
