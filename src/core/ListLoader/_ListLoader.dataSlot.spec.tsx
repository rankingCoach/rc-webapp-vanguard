import { render } from '@test-utils/test-utils';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { ListLoader } from './ListLoader';

describe('ListLoader data-slot contract', () => {
  it('slots each loader, animation, avatar and line', () => {
    const { container } = render(<ListLoader loadersCount={2} />);
    for (const [slot, tag] of [['list-loader', 'DIV'], ['list-loader-animation', 'DIV'], ['list-loader-avatar', 'DIV'], ['list-loader-line', 'DIV']] ) {
      expect(container.querySelector(`[data-slot="${slot}"]`)?.tagName).toBe(tag);
    }
    expect(container.querySelectorAll('[data-slot="list-loader"]')).toHaveLength(2);
    expect(container.querySelector('[data-slot="list-loader"]')?.classList.contains('list-loader')).toBe(true);
  });
});
