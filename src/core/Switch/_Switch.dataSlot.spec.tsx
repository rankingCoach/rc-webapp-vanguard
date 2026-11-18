import { render } from '@test-utils/test-utils';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { Switch } from './Switch';

const root = (c: HTMLElement) => c.querySelector('[data-slot="switch"]') as HTMLElement;

describe('Switch data-slot contract', () => {
  it('slots container, root (the label with the consumer className) and input', () => {
    const { container } = render(<Switch value={false} className={'mine'} testId={'sw'} />);
    expect(container.querySelector('[data-testid="sw"]')?.getAttribute('data-slot')).toBe('switch-container');
    expect(root(container).tagName).toBe('LABEL');
    expect(root(container).classList.contains('mine')).toBe(true);
    expect(root(container).getAttribute('data-size')).toBe('small');
    expect(root(container).querySelector('input')?.getAttribute('data-slot')).toBe('switch-input');
  });

  it('state attributes track checked / disabled / readOnly / loading / size', () => {
    const { container, rerender } = render(<Switch value={false} />);
    for (const a of ['data-checked', 'data-disabled', 'data-readonly', 'data-loading']) {
      expect(root(container).hasAttribute(a)).toBe(false);
    }
    rerender(<Switch value={true} disabled readOnly size={'big'} />);
    expect(root(container).getAttribute('data-checked')).toBe('');
    expect(root(container).getAttribute('data-disabled')).toBe('');
    expect(root(container).getAttribute('data-readonly')).toBe('');
    expect(root(container).getAttribute('data-size')).toBe('big');
    rerender(<Switch value={'loading'} loading />);
    expect(root(container).hasAttribute('data-checked')).toBe(false);
    expect(root(container).getAttribute('data-loading')).toBe('');
    expect(root(container).querySelector('[data-slot="switch-loader"]')).not.toBeNull();
    expect(root(container).querySelector('[data-slot="switch-input"]')).toBeNull();
  });
});
