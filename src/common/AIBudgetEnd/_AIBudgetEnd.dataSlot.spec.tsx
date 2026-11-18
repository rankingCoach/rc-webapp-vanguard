import { render } from '@test-utils/test-utils';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { AIBudgetEnd } from './AIBudgetEnd';

describe('AIBudgetEnd data-slot contract', () => {
  it('slots owned elements and renders with valid props', () => {
    const { container } = render(<AIBudgetEnd close={() => {}} />);
    expect(container.querySelector('[data-slot="ai-budget-end-first-paragraph"]')?.tagName).toBe('DIV');
    expect(container.querySelector('[data-slot="ai-budget-end-second-paragraph"]')?.tagName).toBe('DIV');
  });
});
