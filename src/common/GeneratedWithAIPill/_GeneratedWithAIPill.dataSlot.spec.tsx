import { render } from '@test-utils/test-utils';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { GeneratedWithAIPill } from './GeneratedWithAIPill';

describe('GeneratedWithAIPill data-slot contract', () => {
  it('slots the pill container', () => {
    const { container } = render(<GeneratedWithAIPill />);
    const root = container.querySelector('[data-slot="generated-with-ai-pill"]');
    expect(root?.tagName).toBe('DIV');
    expect(root?.textContent).toContain('Found by us');
  });
});
