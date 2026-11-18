import { render } from '@test-utils/test-utils';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { RelativeTime } from './RelativeTime';

describe('RelativeTime data-slot contract', () => {
  it('preserves Text ownership on the normal and error paths', () => {
    const { container, rerender } = render(<RelativeTime className={'mine'}>{new Date()}</RelativeTime>);
    expect(container.querySelector('.mine')?.getAttribute('data-slot')).toBe('text');
    expect(container.querySelector('[data-slot="relative-time"]')).toBeNull();
    rerender(<RelativeTime className={'mine'}>{'invalid'}</RelativeTime>);
    expect(container.querySelector('.mine')?.getAttribute('data-slot')).toBe('text');
  });
});
