import { render } from '@test-utils/test-utils';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { SocialMediaLink } from './SocialMediaLink';

describe('SocialMediaLink data-slot contract', () => {
  it('slots both the link and the grayscale placeholder', () => {
    const { container, rerender } = render(<SocialMediaLink network={'facebook'} url={'https://facebook.com/example'} />);
    expect(container.querySelector('[data-slot="social-media-link"]')?.tagName).toBe('A');
    rerender(<SocialMediaLink network={'facebook'} greyScale />);
    expect(container.querySelector('[data-slot="social-media-link"]')?.tagName).toBe('DIV');
  });
});
