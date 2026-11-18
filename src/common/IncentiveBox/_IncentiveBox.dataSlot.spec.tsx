import { render } from '@test-utils/test-utils';
import { IconNames } from '@vanguard/Icon/IconNames';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { IncentiveBox } from './IncentiveBox';

describe('IncentiveBox data-slot contract', () => {
  it('slots owned elements and renders with story props', () => {
    const { container } = render(<IncentiveBox icon={IconNames.help} text={'Get a complete overview and remove the hassle of checking multiple sources by connecting your Google Analytics account.'} hasButton={true} buttonText={'Connect now'} />);
    expect(container.querySelector('[data-slot="incentive-box-container"]')?.tagName).toBe('DIV');
    expect(container.querySelector('[data-slot="incentive-box"]')?.tagName).toBe('DIV');
    expect(container.querySelector('[data-slot="incentive-box-content"]')?.tagName).toBe('DIV');
  });
});
