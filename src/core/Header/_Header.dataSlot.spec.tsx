import { render } from '@test-utils/test-utils';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { Header, HeaderTypes } from './Header';

describe('Header data-slot contract', () => {
  it('slots the styled root and tracks every header type', () => {
    const { container, rerender } = render(<Header title={'Title'} type={HeaderTypes.pageHeader} />);
    const root = container.querySelector('[data-slot="header"]')!;
    expect(root.tagName).toBe('DIV');
    expect(root.getAttribute('data-type')).toBe(HeaderTypes.pageHeader);
    for (const type of Object.values(HeaderTypes)) {
      rerender(<Header title={'Title'} type={type} />);
      expect(root.getAttribute('data-type')).toBe(type);
    }
  });
});
