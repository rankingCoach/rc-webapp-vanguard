import { render } from '@test-utils/test-utils';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { InfoBox } from './InfoBox';

describe('InfoBox data-slot contract', () => {
  it('slots the root (consumer className) and its parts, type as data-type', async () => {
    const { findByTestId, rerender } = render(
      <InfoBox testId={'ib'} className={'mine'} title={'T'} description={'D'} type={'warn'} />,
    );
    const root = await findByTestId('ib');
    expect(root.classList.contains('mine')).toBe(true);
    expect(root.getAttribute('data-slot')).toBe('info-box');
    expect(root.getAttribute('data-type')).toBe('warn');
    expect(root.querySelector('[data-slot="info-box-content"]')).not.toBeNull();
    expect(root.querySelector('[data-slot="info-box-body"]')).not.toBeNull();
    rerender(<InfoBox testId={'ib'} description={'D'} />);
    expect((await findByTestId('ib')).getAttribute('data-type')).toBe('info');
  });
});
