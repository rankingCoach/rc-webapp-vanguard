import { baseStore } from '@stores/redux-base.store';
import { StoryObj } from '@storybook/react';
import { EntryCss, RouteCss } from '@test-utils/consumer-css';
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
 * Tie-break (verifier Tier A, rc-webapp EntityListPage story fixture `.compactSelect .MuiSelect-select
 * { min-height: 0 }`, same specificity as MUI's rule). Production order (D15): CSS loaded BEFORE vanguard.css (rc-webapp
 * entry chunk; also how the rc-webapp Storybook loads module CSS before emotion) loses the tie to emotion's
 * `min-height: 1.4375em`, so an empty select keeps its full height. Route-chunk CSS wins it: see the next story.
 */
const compactSelectCss = '.compactSelect .MuiSelect-select { min-height: 0; font-size: 12px; line-height: 1.2; }';

export const ConsumerEqualSpecificityRuleDoesNotCollapseEmptySelect: Story = {
  render: () => (
    <div className="compactSelect" style={{ width: 240 }}>
      <EntryCss css={compactSelectCss} />
      <Select options={options} value="" translateOptions={false} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole('combobox');
    const s = getComputedStyle(trigger);
    // MUI's 1.4375em of the select's own font size. From the entry position the consumer's font-size: 12px also
    // loses its (0,2,0) tie to the Vanguard skin `.vanguard-input .MuiSelect-select` (vanguard.css comes later).
    await expect(s.fontSize).toBe('16px');
    await expect(s.minHeight).toBe(`${16 * 1.4375}px`);
  },
};

/** Same rule from a route (lazy) chunk: loaded after emotion in production, so it won the tie there (D15). */
export const RouteChunkEqualSpecificityRuleWinsTheTie: Story = {
  render: () => (
    <div className="compactSelectRoute" style={{ width: 240 }}>
      <RouteCss css={compactSelectCss.replaceAll('compactSelect', 'compactSelectRoute')} />
      <Select options={options} value="" translateOptions={false} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    await expect(getComputedStyle(within(canvasElement).getByRole('combobox')).minHeight).toBe('0px');
  },
};
