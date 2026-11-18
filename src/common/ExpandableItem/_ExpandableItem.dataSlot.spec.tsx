import { render } from '@test-utils/test-utils';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { ExpandableItem } from './ExpandableItem';

describe('ExpandableItem data-slot contract', () => {
  it('slots owned elements and renders with story props', () => {
    const { container } = render(<ExpandableItem />);
    expect(container.querySelector('[data-slot="expandable-item"]')?.tagName).toBe('DIV');
  });
});
