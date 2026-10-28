import React from 'react';
import { expect, within } from 'storybook/test';

import { barRootOf, makeTabs, Story, VisualHarness } from './_TabsVisual.default';

const tabs = makeTabs(['First', 'Second', 'Third']);

/** `TabConfig` keys passed as flat props behave like `tabConfig`; `tabConfig` wins when both set the same key. */
export const FlatConfigProps: Story = {
  render: () => (
    <div>
      <div data-testid="flat-theme">
        <VisualHarness width={600} tabs={tabs} theme="underline" />
      </div>
      <div data-testid="flat-sizes">
        <VisualHarness width={600} tabs={tabs} theme="underline" tabHeight="small" padding="small" tabNoMinWidth alignCenter />
      </div>
      <div data-testid="precedence">
        <VisualHarness width={600} tabs={tabs} theme="underline" tabConfig={{ theme: 'floating' }} />
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const flatTheme = within(canvas.getByTestId('flat-theme')).getByRole('tab', { name: 'First' });
    await expect(getComputedStyle(flatTheme).borderBottomWidth).toBe('2px');
    await expect(getComputedStyle(flatTheme).paddingTop).toBe('0px');

    const sizesScope = within(canvas.getByTestId('flat-sizes'));
    sizesScope.getAllByRole('tab').forEach((tab) => {
      const style = getComputedStyle(tab);
      expect(style.height).toBe('36px');
      expect(style.paddingTop).toBe('8px');
      expect(style.minWidth).toBe('0px');
    });
    await expect(getComputedStyle(barRootOf(sizesScope.getByRole('tablist'))).alignItems).toBe('center');

    const precedence = within(canvas.getByTestId('precedence')).getByRole('tab', { name: 'First' });
    await expect(getComputedStyle(precedence).borderTopLeftRadius).toBe('24px');
    await expect(getComputedStyle(precedence).borderBottomWidth).toBe('0px');
  },
};
