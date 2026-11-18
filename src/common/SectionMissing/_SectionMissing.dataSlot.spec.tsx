import { render } from '@test-utils/test-utils';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { SectionMissing } from './SectionMissing';

describe('SectionMissing data-slot contract', () => {
  it('slots owned elements and renders with story props', () => {
    const { container } = render(<SectionMissing testId={'section-missing-default'} title={'No opening hours yet'} description={'Add your opening hours so customers know when to visit.'} buttonText={'Add opening hours'} buttonCallback={() => {}} className={'mine'} />);
    expect(container.querySelector('[data-slot="section-missing"]')?.tagName).toBe('DIV');
    expect(container.querySelector('[data-slot="section-missing"]')?.classList.contains('mine')).toBe(true);
  });
});
