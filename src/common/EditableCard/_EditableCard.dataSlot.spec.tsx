import { render } from '@test-utils/test-utils';
import { Text } from '@vanguard/Text/Text';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { EditableCard } from './EditableCard';

describe('EditableCard data-slot contract', () => {
  it('slots owned elements and renders with story props', () => {
    const { container } = render(<EditableCard title={'Business Details'} editCallback={() => {}} className={'mine'}><Text>This is a text children</Text></EditableCard>);
    expect(container.querySelector('[data-slot="editable-card"]')?.tagName).toBe('DIV');
    expect(container.querySelector('[data-slot="editable-card-header"]')?.tagName).toBe('DIV');
    expect(container.querySelector('[data-slot="editable-card-actions"]')?.tagName).toBe('DIV');
    expect(container.querySelector('[data-slot="editable-card-content"]')?.tagName).toBe('DIV');
    expect(container.querySelector('[data-slot="editable-card"]')?.classList.contains('mine')).toBe(true);
  });
});
