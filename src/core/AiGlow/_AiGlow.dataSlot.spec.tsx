import { render } from '@test-utils/test-utils';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { AiGlow } from './AiGlow';

describe('AiGlow data-slot contract', () => {
  it('slots the element receiving the consumer className', () => {
    const { container } = render(<AiGlow className={'mine'}>Content</AiGlow>);
    const root = container.querySelector('[data-slot="ai-glow"]')!;
    expect(root.tagName).toBe('DIV');
    expect(root.classList.contains('mine')).toBe(true);
  });
});
