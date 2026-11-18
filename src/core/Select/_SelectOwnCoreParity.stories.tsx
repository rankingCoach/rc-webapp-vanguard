import { baseStore } from '@stores/redux-base.store';
import { StoryObj } from '@storybook/react';
import { SbDecorator } from '@test-utils/get-storybook-decorator';
import React from 'react';
import { expect, screen, userEvent, within } from 'storybook/test';
import { Select } from './Select';

/**
 * Own-core Select: the menu paper keeps MUI's white in light mode and uses the --fn-bg-surface token in dark mode (the
 * old white-panel-with-light-text bug is not reproduced); the paper text colour is unchanged.
 */
export default {
  ...SbDecorator({ title: 'Vanguard/Select/Own Core Parity', component: Select, opts: { customStore: baseStore } }),
};

type Story = StoryObj<typeof Select>;

const options = [
  { key: 'a', value: 'a', title: 'Alpha' },
  { key: 'b', value: 'b', title: 'Beta' },
];

const paperColours = async (canvasElement: HTMLElement, scheme: 'light' | 'dark') => {
  document.documentElement.style.colorScheme = scheme;
  await userEvent.click(within(canvasElement).getByRole('combobox'));
  const paper = (await screen.findByRole('listbox')).closest('.MuiMenu-paper') as HTMLElement;
  const result = { bg: getComputedStyle(paper).backgroundColor, fg: getComputedStyle(paper).color };
  await userEvent.keyboard('{Escape}');
  return result;
};

export const MenuPaperFollowsColourScheme: Story = {
  render: () => <Select options={options} value="a" translateOptions={false} />,
  play: async ({ canvasElement }) => {
    const before = document.documentElement.style.colorScheme;
    try {
      const light = await paperColours(canvasElement, 'light');
      await expect(light.bg).toBe('rgb(255, 255, 255)');
      await expect(light.fg).toBe('rgba(0, 0, 0, 0.87)');
      const dark = await paperColours(canvasElement, 'dark');
      await expect(dark.bg).not.toBe('rgb(255, 255, 255)');
      // Paper colour stays MUI's (rc-webapp's root-components.scss only overrides the background).
      await expect(dark.fg).toBe('rgba(0, 0, 0, 0.87)');
    } finally {
      document.documentElement.style.colorScheme = before;
    }
  },
};

/**
 * D13 tie-break (verifier Tier A, rc-webapp EntityListPage): a consumer rule of the SAME specificity as MUI's
 * (`.compactSelect .MuiSelect-select { min-height: 0 }`, loaded after Vanguard's CSS) used to lose to emotion's
 * runtime-injected `min-height: 1.4375em`. An empty select must keep its full height.
 */
export const ConsumerEqualSpecificityRuleDoesNotCollapseEmptySelect: Story = {
  render: () => (
    <div className="compactSelect" style={{ width: 240 }}>
      <style>{'.compactSelect .MuiSelect-select { min-height: 0; font-size: 12px; line-height: 1.2; }'}</style>
      <Select options={options} value="" translateOptions={false} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole('combobox');
    const s = getComputedStyle(trigger);
    await expect(s.minHeight).toBe(`${(12 * 1.4375).toFixed(2).replace(/0$/, '')}px`);
  },
};
