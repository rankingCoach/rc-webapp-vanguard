import { render } from '@test-utils/test-utils';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { GlobalStateComponent } from './GlobalStateComponent';

describe('GlobalStateComponent data-slot contract', () => {
  it('slots the root and tracks hoverable / blurred / shimmering', () => {
    const { getByTestId, rerender } = render(
      <GlobalStateComponent testId={'g'} className={'mine'}>
        x
      </GlobalStateComponent>,
    );
    const root = getByTestId('g');
    expect(root.getAttribute('data-slot')).toBe('global-state');
    for (const a of ['data-hoverable', 'data-blurred', 'data-shimmering']) expect(root.hasAttribute(a)).toBe(false);
    rerender(
      <GlobalStateComponent testId={'g'} hoverable blurred shimmering>
        x
      </GlobalStateComponent>,
    );
    const on = getByTestId('g');
    for (const a of ['data-hoverable', 'data-blurred', 'data-shimmering']) expect(on.getAttribute(a)).toBe('');
    expect(on.querySelector('[data-slot="global-state-blur"]')).not.toBeNull();
    expect(on.querySelector('[data-slot="global-state-shimmer"]')).not.toBeNull();
  });

  it('a caller-supplied data-slot wins', () => {
    const { getByTestId } = render(
      <GlobalStateComponent testId={'g'} data-slot={'card'}>
        x
      </GlobalStateComponent>,
    );
    expect(getByTestId('g').getAttribute('data-slot')).toBe('card');
  });
});
