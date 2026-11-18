import { render } from '@test-utils/test-utils';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { FrostedGlass } from './FrostedGlass';

describe('FrostedGlass data-slot contract', () => {
  it('slots the element receiving the consumer className', () => {
    const { container, rerender } = render(<FrostedGlass className={'mine'}>Content</FrostedGlass>);
    const root = container.querySelector('[data-slot="frosted-glass"]')!;
    expect(root.tagName).toBe('DIV');
    expect(root.classList.contains('mine')).toBe(true);
    rerender(<FrostedGlass data-slot={'custom'}>Content</FrostedGlass>);
    expect(container.querySelector('[data-slot="custom"]')?.tagName).toBe('DIV');
  });
});
