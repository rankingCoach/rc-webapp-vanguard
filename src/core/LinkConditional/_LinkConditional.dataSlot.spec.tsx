import { render } from '@test-utils/test-utils';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { LinkConditional } from './LinkConditional';

describe('LinkConditional data-slot contract', () => {
  it('slots the visible child wrapper and preserves the Link-owned branch', () => {
    const { container, rerender } = render(<LinkConditional childVisible linkText={'Add'}><input /></LinkConditional>);
    expect(container.querySelector('[data-slot="link-conditional"]')?.tagName).toBe('SPAN');
    rerender(<LinkConditional childVisible={false} linkText={'Add'}><input /></LinkConditional>);
    expect(container.querySelector('[data-slot="link-conditional"]')).toBeNull();
    expect(container.querySelector('[data-slot="link"]')?.tagName).toBe('A');
  });
});
