import { render } from '@test-utils/test-utils';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { Divider } from './Divider';

describe('Divider data-slot contract', () => {
  it('slots the consumer div and lets caller attributes win', () => {
    const { container, rerender } = render(<Divider className={'mine'} />);
    const root = container.querySelector('[data-slot="divider"]')!;
    expect(root.tagName).toBe('DIV');
    expect(root.classList.contains('mine')).toBe(true);
    rerender(<Divider data-slot={'custom'} />);
    expect(container.querySelector('[data-slot="custom"]')?.tagName).toBe('DIV');
  });
});
