import { render } from '@test-utils/test-utils';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { Tabs } from './Tabs';
import { Tab } from './Tab/Tab';
import { TabPanel } from './TabPanel/TabPanel';

describe('Tabs data-slot contract', () => {
  it('slots the wrapper, consumer root, scroller, list, tab and panel', () => {
    const { container } = render(
      <Tabs className={'mine'} wrapperClassName={'outer'} tabs={[{ label: 'One', component: 'Panel' }]} />,
    );
    for (const slot of ['tabs', 'tabs-scroller', 'tabs-list', 'tab-panel']) {
      expect(container.querySelector(`[data-slot="${slot}"]`)?.tagName).toBe('DIV');
    }
    // The bar (consumer className) stays attribute-free: the DomHygiene story pins its attributes to ['class'].
    expect(container.querySelector('[data-slot="tabs"]')?.classList.contains('outer')).toBe(true);
    expect(container.querySelector('.mine')?.hasAttribute('data-slot')).toBe(false);
    expect(container.querySelector('[data-slot="tabs-list"]')?.getAttribute('role')).toBe('tablist');
    expect(container.querySelector('[data-slot="tab"]')?.tagName).toBe('BUTTON');
  });

  it('tracks theme, tab height and selection', () => {
    const { container, rerender } = render(<Tab label={'One'} className={'mine'} />);
    const root = () => container.querySelector('[data-slot="tab"]')!;
    expect(root().classList.contains('mine')).toBe(true);
    expect(root().hasAttribute('data-selected')).toBe(false);
    expect(root().getAttribute('data-variant')).toBe('highlight');
    expect(root().hasAttribute('data-size')).toBe(false);
    rerender(<Tab label={'One'} selected tabConfig={{ theme: 'floating', tabHeight: 'small' }} />);
    expect(root().getAttribute('data-selected')).toBe('');
    expect(root().getAttribute('data-variant')).toBe('floating');
    expect(root().getAttribute('data-size')).toBe('small');
    rerender(<Tabs tabs={[]} />);
    expect(container.querySelector('[data-slot="tabs"]')?.getAttribute('data-variant')).toBe('highlight');
    rerender(<Tabs tabs={[]} theme={'floating'} />);
    expect(container.querySelector('[data-slot="tabs"]')?.getAttribute('data-variant')).toBe('floating');
  });

  it('keeps caller slots and the panel consumer class', () => {
    const { container, rerender } = render(<Tabs tabs={[]} data-slot={'custom'} />);
    expect(container.querySelector('[data-slot="custom"]')?.tagName).toBe('DIV');
    rerender(<Tab label={'One'} data-slot={'custom'} />);
    expect(container.querySelector('[data-slot="custom"]')?.tagName).toBe('BUTTON');
    rerender(<TabPanel currentTab={0} value={0} className={'mine'} />);
    expect(container.querySelector('[data-slot="tab-panel"]')?.classList.contains('mine')).toBe(true);
  });
});
