import { render, waitFor } from '@test-utils/test-utils';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { TrendIndicator, TrendDelta } from './TrendIndicator';

describe('TrendIndicator data-slot contract', () => {
  it('preserves Icon ownership for arrow-only and stable renders', async () => {
    const { container, rerender } = render(<TrendIndicator current={2} previous={1} className={'mine'} />);
    await waitFor(() => expect(container.querySelector('.mine')?.getAttribute('data-slot')).toBe('icon'));
    expect(container.querySelector('[data-slot="trend-indicator"]')).toBeNull();
    rerender(<TrendDelta current={1} previous={1} className={'mine'} />);
    await waitFor(() => expect(container.querySelector('.mine')?.getAttribute('data-slot')).toBe('icon'));
  });

  it('slots the delta consumer span and magnitude when present', () => {
    const { container, rerender } = render(<TrendDelta current={2} previous={1} className={'mine'} />);
    const root = container.querySelector('[data-slot="trend-delta"]')!;
    expect(root.tagName).toBe('SPAN');
    expect(root.classList.contains('mine')).toBe(true);
    expect(root.querySelector('[data-slot="trend-delta-value"]')?.tagName).toBe('SPAN');
    rerender(<TrendDelta current={2} previous={1} showValue={false} />);
    expect(container.querySelector('[data-slot="trend-delta-value"]')).toBeNull();
  });
});
