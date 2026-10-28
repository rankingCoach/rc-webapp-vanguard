import React from 'react';
import { expect, fn, userEvent, within } from 'storybook/test';

import { TabProps } from '../Tab/Tab';
import { Story, TabsHarness } from './_Tabs.default';

type Key = 'a' | 'b' | 'c';

// Type-compat proof (C01/C02): generic TabProps<T> and a narrowly-typed onChange value
const typedTabs: TabProps<Key>[] = [
  { label: 'A', value: 'a', component: <p>Content A</p> },
  { label: 'B', value: 'b', component: <p>Content B</p> },
  { label: 'C', value: 'c', component: <p>Content C</p> },
];

export const StringValuesControlled: Story = {
  args: {
    onChange: fn(),
  },
  render: (args) => {
    const onChange = (e: React.SyntheticEvent, v: Key) => args.onChange?.(e, v);
    return <TabsHarness tabs={typedTabs} initialValue="b" onChange={onChange} />;
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByRole('tab', { name: 'B' })).toHaveAttribute('aria-selected', 'true');
    await expect(canvas.getAllByRole('tab').filter((t) => t.getAttribute('aria-selected') === 'true')).toHaveLength(1);
    await expect(canvas.getByText('Content B')).toBeVisible();
    await expect(canvas.queryByText('Content C')).not.toBeInTheDocument();

    await userEvent.click(canvas.getByRole('tab', { name: 'C' }));

    await expect(args.onChange).toHaveBeenCalledWith(expect.anything(), 'c');
    await expect(canvas.getByRole('tab', { name: 'C' })).toHaveAttribute('aria-selected', 'true');
    await expect(canvas.getByRole('tab', { name: 'B' })).toHaveAttribute('aria-selected', 'false');
    await expect(canvas.getAllByRole('tab').filter((t) => t.getAttribute('aria-selected') === 'true')).toHaveLength(1);
    await expect(canvas.getByText('Content C')).toBeVisible();
  },
};
