import { render } from '@test-utils/test-utils';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { StatusBadge } from './StatusBadge';

const root = (c: HTMLElement) => c.querySelector('[data-slot="status-badge"]') as HTMLElement;

describe('StatusBadge data-slot contract', () => {
  it('small (default): slot on the element with the consumer className, variant/size/status attributes', () => {
    const { container, rerender } = render(<StatusBadge status={'success'} text={'ok'} className={'mine'} />);
    expect(root(container).classList.contains('mine')).toBe(true);
    expect(root(container).getAttribute('data-variant')).toBe('small');
    expect(root(container).getAttribute('data-size')).toBe('default');
    expect(root(container).getAttribute('data-status')).toBe('success');
    rerender(<StatusBadge status={'danger'} text={'no'} size={'compact'} numberValue={3} />);
    expect(root(container).getAttribute('data-size')).toBe('compact');
    expect(root(container).getAttribute('data-status')).toBe('danger');
    expect(root(container).querySelector('[data-slot="status-badge-value"]')).not.toBeNull();
  });

  it('big and glass variants', () => {
    const { container, rerender } = render(<StatusBadge status={'info'} text={'i'} variant={'big'} className={'b'} />);
    expect(root(container).classList.contains('b')).toBe(true);
    expect(root(container).getAttribute('data-variant')).toBe('big');
    expect(root(container).getAttribute('data-status')).toBe('info');
    rerender(<StatusBadge status={'info'} text={'g'} variant={'glass'} className={'g'} />);
    expect(root(container).classList.contains('g')).toBe(true);
    expect(root(container).getAttribute('data-variant')).toBe('glass');
  });
});
