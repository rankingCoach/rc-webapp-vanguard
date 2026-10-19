import React from 'react';
import { expect, within } from 'storybook/test';

import { TabProps } from '../Tab/Tab';
import { Tabs } from '../Tabs';
import { Story } from './_Tabs.default';

// Tab objects built from domain data: unknown fields must not reach the DOM.
const domainTab = {
  label: 'Domain',
  value: 'domain',
  route: '/a',
  count: 3,
  isNew: true,
  hidden: true,
  icon: <span />,
  sx: { p: 1 },
  disableRipple: true,
  wrapped: true,
  className: 'consumer-tab',
  title: 'Domain tab',
  'data-qa': 'domain-tab',
  'aria-describedby': 'domain-hint',
} as unknown as TabProps;

/** Flat config keys and unknown tab fields never leak to the DOM; allowed attributes are forwarded. */
export const DomHygiene: Story = {
  render: () => (
    <div data-testid="hygiene">
      <span id="domain-hint">hint</span>
      <Tabs
        value="domain"
        tabs={[domainTab, { label: 'Plain', value: 'plain' }]}
        theme="underline"
        padding="small"
        tabHeight="small"
        tabConfig={{ tabGrow: false }}
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const tablist = canvas.getByRole('tablist');
    const bar = tablist.parentElement?.parentElement as HTMLElement;
    await expect(Array.from(bar.attributes).map((attribute) => attribute.name)).toEqual(['class']);

    const tab = canvas.getByRole('tab', { name: 'Domain' });
    for (const leaked of ['route', 'count', 'isnew', 'hidden', 'icon', 'sx', 'disableripple', 'wrapped']) {
      await expect(tab.hasAttribute(leaked)).toBe(false);
    }
    await expect(tab).toHaveClass('consumer-tab');
    await expect(tab).toHaveAttribute('title', 'Domain tab');
    await expect(tab).toHaveAttribute('data-qa', 'domain-tab');
    await expect(tab).toHaveAttribute('aria-describedby', 'domain-hint');

    const classTokens = Array.from(canvas.getByTestId('hygiene').querySelectorAll('[class]')).flatMap((element) =>
      Array.from(element.classList),
    );
    await expect(classTokens).not.toContain('false');
    await expect(classTokens).not.toContain('undefined');
  },
};

/** aria-controls / aria-labelledby link tabs and mounted panels; no dangling aria-controls. */
export const AriaWiring: Story = {
  render: () => (
    <Tabs
      value="a"
      tabs={[
        { label: 'A', value: 'a', component: <p>Panel A</p> },
        { label: 'B', value: 'b', component: <p>Panel B</p> },
        { label: 'C', value: 'c' },
      ]}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const tabA = canvas.getByRole('tab', { name: 'A' });
    const panel = canvas.getByRole('tabpanel');
    await expect(tabA.getAttribute('aria-controls')).toBe(panel.id);
    await expect(panel.getAttribute('aria-labelledby')).toBe(tabA.id);
    await expect(canvas.getByRole('tab', { name: 'B' })).not.toHaveAttribute('aria-controls');
    await expect(canvas.getByRole('tab', { name: 'C' })).not.toHaveAttribute('aria-controls');
    canvas.getAllByRole('tab').forEach((tab) => {
      const controls = tab.getAttribute('aria-controls');
      if (controls) {
        expect(document.getElementById(controls)).not.toBeNull();
      }
    });
  },
};
