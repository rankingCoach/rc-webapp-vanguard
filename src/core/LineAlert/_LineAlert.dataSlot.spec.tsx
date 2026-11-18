import { render } from '@test-utils/test-utils';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { LineAlert } from './LineAlert';

describe('LineAlert data-slot contract', () => {
  it('slots the root and tracks every type', () => {
    const { container, rerender } = render(<LineAlert>Message</LineAlert>);
    const root = container.querySelector('[data-slot="line-alert"]')!;
    expect(root.tagName).toBe('DIV');
    expect(root.getAttribute('data-type')).toBe('info');
    for (const type of ['danger', 'warning', 'success', 'info'] as const) {
      rerender(<LineAlert type={type}>Message</LineAlert>);
      expect(root.getAttribute('data-type')).toBe(type);
    }
  });
});
