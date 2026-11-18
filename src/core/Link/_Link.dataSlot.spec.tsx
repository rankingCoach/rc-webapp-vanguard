import { render } from '@test-utils/test-utils';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { Link } from './Link';

describe('Link data-slot contract', () => {
  it('slots the anchor and tracks disabled', () => {
    const { container, rerender } = render(<Link href={'#'}>Go</Link>);
    const a = container.querySelector('a') as HTMLAnchorElement;
    expect(a.getAttribute('data-slot')).toBe('link');
    expect(a.hasAttribute('data-disabled')).toBe(false);
    rerender(
      <Link href={'#'} disabled>
        Go
      </Link>,
    );
    expect(container.querySelector('a')?.getAttribute('data-disabled')).toBe('');
  });
});
