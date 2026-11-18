import { render } from '@test-utils/test-utils';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { InfoText } from './InfoText';

describe('InfoText data-slot contract', () => {
  it('slots the separate wrapper and styled root with the story title', () => {
    const { container } = render(<InfoText title={'Learn more about responsive ads'} />);
    const wrapper = container.querySelector('[data-slot="info-text-container"]');
    const root = wrapper?.querySelector('[data-slot="info-text"]');
    expect(wrapper?.tagName).toBe('DIV');
    expect(root?.tagName).toBe('DIV');
    expect(root?.textContent).toContain('Learn more about responsive ads');
  });
});
