import { render } from '@test-utils/test-utils';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { DiscountBadge } from './DiscountBadge';

describe('DiscountBadge data-slot contract', () => {
  it('slots the consumer root and border with the story props', () => {
    const { container } = render(<DiscountBadge percentValue={37} resellerName={'direct-channel'} className={'mine'} />);
    const root = container.querySelector('[data-slot="discount-badge"]');
    expect(root?.tagName).toBe('DIV');
    expect(root?.classList.contains('mine')).toBe(true);
    expect(root?.querySelector('[data-slot="discount-badge-border"]')?.tagName).toBe('DIV');
    expect(root?.textContent).toContain('37%');
    expect(root?.textContent).toContain('Special offer for direct-channel clients');
  });
});
