import { render } from '@test-utils/test-utils';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { ActionButton } from './ActionButton';

const slot = (container: HTMLElement, name: string) => container.querySelector(`[data-slot="${name}"]`) as HTMLElement;

describe('ActionButton data-slot contract', () => {
  it('preserves the Button-owned slot without adding an ActionButton slot', () => {
    const { container } = render(<ActionButton>Action</ActionButton>);
    expect(slot(container, 'action-button')).toBeNull();
    expect(container.querySelector('button')?.tagName).toBe('BUTTON');
  });
});
