import { render } from '@test-utils/test-utils';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { Label } from './Label';

describe('Label data-slot contract', () => {
  it('preserves the Text-owned slot without adding a label wrapper', () => {
    const { container } = render(<Label value={'Label'} />);
    expect(container.querySelector('[data-slot="text"]')?.tagName).toBe('SPAN');
    expect(container.querySelector('[data-slot="label"]')).toBeNull();
  });
});
