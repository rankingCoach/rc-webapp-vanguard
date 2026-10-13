import React from 'react';
import { expect, within } from 'storybook/test';

import { Tabs } from '../Tabs';
import { Story } from './_Tabs.default';

// Type-compat proof (C17): MUI-era props must keep compiling on <Tabs>.
export const MuiCompatProps: Story = {
  render: () => (
    <div>
      <div data-testid="theme-prop">
        <Tabs
          value="a"
          tabs={[
            { label: 'A', value: 'a' },
            { label: 'B', value: 'b' },
          ]}
        >
          {undefined}
        </Tabs>
      </div>
      <div data-testid="variant-prop">
        <Tabs
          variant="scrollable"
          value="a"
          tabs={[
            { label: 'A', value: 'a' },
            { label: 'B', value: 'b' },
          ]}
        />
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // empty children are ignored: default theme is highlight (rounded, no bottom border)
    const scope = within(canvas.getByTestId('theme-prop'));
    await expect(scope.getAllByRole('tab')).toHaveLength(2);
    const selected = scope.getByRole('tab', { name: 'A' });
    await expect(selected).toHaveAttribute('aria-selected', 'true');
    const style = getComputedStyle(selected);
    await expect(style.borderRadius).toBe('8px');
    await expect(style.borderBottomWidth).toBe('0px');

    const variantScope = within(canvas.getByTestId('variant-prop'));
    await expect(variantScope.getAllByRole('tab')).toHaveLength(2);
  },
};
