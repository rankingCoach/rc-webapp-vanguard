import { render } from '@test-utils/test-utils';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { Alert } from './Alert';

describe('Alert data-slot contract', () => {
  it('slots the container and the styled root, with the type as data-type', () => {
    const { container } = render(<Alert type={'danger'}>Boom</Alert>);
    const wrapper = container.querySelector('.Alert-container') as HTMLElement;
    expect(wrapper.getAttribute('data-slot')).toBe('alert-container');
    const root = wrapper.querySelector('.rc-alert') as HTMLElement;
    expect(root.getAttribute('data-slot')).toBe('alert');
    expect(root.getAttribute('data-type')).toBe('danger');
  });

  it('data-type tracks the type prop', () => {
    const { container, rerender } = render(<Alert type={'info'}>x</Alert>);
    expect(container.querySelector('[data-slot="alert"]')?.getAttribute('data-type')).toBe('info');
    rerender(<Alert type={'success'}>x</Alert>);
    expect(container.querySelector('[data-slot="alert"]')?.getAttribute('data-type')).toBe('success');
  });
});
