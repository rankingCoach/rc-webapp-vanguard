import { render } from '@test-utils/test-utils';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { DashboardCard } from './DashboardCard';

describe('DashboardCard data-slot contract', () => {
  it('slots owned elements and renders with story props', () => {
    const { container } = render(<DashboardCard title={'Title'} infoIconProps={{ message: 'InfoBox Description' }} noPadding={false} className={'mine'}><div>Content</div></DashboardCard>);
    expect(container.querySelector('[data-slot="dashboard-card"]')?.tagName).toBe('DIV');
    expect(container.querySelector('[data-slot="dashboard-card-title"]')?.tagName).toBe('DIV');
    expect(container.querySelector('[data-slot="dashboard-card-info"]')?.tagName).toBe('DIV');
    expect(container.querySelector('[data-slot="dashboard-card-content"]')?.tagName).toBe('DIV');
    expect(container.querySelector('[data-slot="dashboard-card"]')?.classList.contains('mine')).toBe(true);
  });
});
