import { render } from '@test-utils/test-utils';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { SvgImage } from './SvgImage';

describe('SvgImage data-slot contract', () => {
  it('slots the existing image', () => {
    // SvgImage resolves `path` with a runtime require relative to its own file; any resolvable module will do here.
    const { container } = render(<SvgImage path={'../../../package.json'} />);
    const image = container.querySelector('[data-slot="svg-image"]');
    expect(image?.tagName).toBe('IMG');
  });
});
