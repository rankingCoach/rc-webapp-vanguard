import { render } from '@test-utils/test-utils';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { Loader } from './Loader';

describe('Loader data-slot contract', () => {
  it('slots the container and the spinner root', () => {
    const { container } = render(<Loader loading={true} testId={'l'} />);
    const wrapper = container.querySelector('[data-testid="l"]') as HTMLElement;
    expect(wrapper.getAttribute('data-slot')).toBe('loader-container');
    expect(wrapper.querySelector('.loading')?.getAttribute('data-slot')).toBe('loader');
  });

  it('renders nothing when not loading', () => {
    const { container } = render(<Loader loading={false} />);
    expect(container.querySelector('[data-slot^="loader"]')).toBeNull();
  });
});
