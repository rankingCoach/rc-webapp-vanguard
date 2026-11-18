import { render } from '@test-utils/test-utils';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { AnimatedNumber } from './AnimatedNumber';

describe('AnimatedNumber data-slot contract', () => {
  it('slots the element receiving the consumer className', () => {
    const { container } = render(<AnimatedNumber value={12} animate={false} className={'mine'} />);
    const root = container.querySelector('[data-slot="animated-number"]')!;
    expect(root.tagName).toBe('SPAN');
    expect(root.classList.contains('mine')).toBe(true);
  });
});
