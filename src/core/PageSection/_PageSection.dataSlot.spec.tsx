import { render } from '@test-utils/test-utils';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { PageSection, PageSectionBackground } from './PageSection';

describe('PageSection data-slot contract', () => {
  it('slots root, header and content; background as data-background', () => {
    const { getByTestId, rerender } = render(
      <PageSection testId={'ps'} title={'T'} className={'mine'}>
        body
      </PageSection>,
    );
    const root = getByTestId('ps_Children').closest('[data-slot="page-section"]') as HTMLElement;
    expect(root.classList.contains('mine')).toBe(true);
    expect(root.getAttribute('data-background')).toBe(PageSectionBackground.functionalBg);
    expect(root.querySelector('[data-slot="page-section-header"]')).not.toBeNull();
    expect(getByTestId('ps_Children').getAttribute('data-slot')).toBe('page-section-content');
    rerender(
      <PageSection testId={'ps'} background={PageSectionBackground.frostedGlass}>
        body
      </PageSection>,
    );
    const glass = getByTestId('ps_Children').closest('[data-slot="page-section"]') as HTMLElement;
    expect(glass.getAttribute('data-background')).toBe(PageSectionBackground.frostedGlass);
  });
});
