import { render } from '@test-utils/test-utils';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { AIOrb } from './AIOrb';

const slot = (container: HTMLElement, name: string) => container.querySelector(`[data-slot="${name}"]`) as HTMLElement;

describe('AIOrb data-slot contract', () => {
  it('slots the existing elements', () => {
    const { container } = render(<AIOrb className={'mine'} />);
    expect(slot(container, 'ai-orb').tagName).toBe('DIV');
    expect(slot(container, 'ai-orb').classList.contains('mine')).toBe(true);
  });
});
