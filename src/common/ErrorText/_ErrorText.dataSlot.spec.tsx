import { render } from '@test-utils/test-utils';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { ErrorText } from './ErrorText';

describe('ErrorText data-slot contract', () => {
  it('renders the story content with valid required props without annotating owned components', () => {
    const { container } = render(<ErrorText text={'ImplementME'} className={'mine'} />);
    expect(container.querySelector('.mine')?.textContent).toContain('ImplementME');
    expect(container.querySelector('[data-slot="error-text"]')).toBeNull();
  });
});
