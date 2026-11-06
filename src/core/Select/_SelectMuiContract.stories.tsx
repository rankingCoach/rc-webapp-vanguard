/**
 * MUI upgrade contract (S0), real browser: Select.module.scss targets
 * `.MuiPaper-root .MuiList-root .MuiMenuItem-root.Mui-selected` (background + `span.paragraph` color) and
 * InputBase.scss targets `.MuiSelect-select`. Each story asserts a computed value only our SCSS produces,
 * plus the menu portal / stacking / focus contract in a real layout engine.
 */
import { StoryObj } from '@storybook/react';
import { SbDecorator } from '@test-utils/get-storybook-decorator';
import { OverlayStackingService } from '@vanguard/OverlayStacking/OverlayStackingService';
import React from 'react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { Select, SelectOptionProp } from './Select';

/** Settle wait for transitions/poppers/async assets: 1s is not enough under a loaded full-suite run. */
const SETTLE = { timeout: 5000 };

export default {
  ...SbDecorator({
    title: 'Vanguard/Select/MUI Contract',
    component: Select,
    opts: { withRedux: true, maxWidth: '300px' },
  }),
};

type Story = StoryObj<typeof Select>;

const options: SelectOptionProp[] = [
  { key: 0, value: 'apple', title: 'Apple', description: 'Red' },
  { key: 1, value: 'banana', title: 'Banana', disabled: true },
  { key: 2, value: 'cherry', title: 'Cherry' },
];

const cs = (el: Element | null) => {
  if (!el) throw new Error('element not found');
  return getComputedStyle(el);
};

const resolveCss = (host: HTMLElement, prop: 'color' | 'backgroundColor', value: string) => {
  const probe = document.createElement('div');
  probe.style[prop] = value;
  host.appendChild(probe);
  const resolved = getComputedStyle(probe)[prop];
  probe.remove();
  return resolved;
};

const body = () => within(document.body);

export const SelectedOptionStyling: Story = {
  args: { id: 'mc-sel', label: 'Fruit', options, value: 'cherry' },
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('combobox'));
    const listbox = await body().findByRole('listbox', {}, SETTLE);
    const selected = within(listbox).getByRole('option', { name: /Cherry/ });
    await expect(selected.getAttribute('aria-selected')).toBe('true');
    // `.MuiMenuItem-root.Mui-selected { background-color: var(--fn-bg) !important }` (MUI default: primary alpha)
    // resolved outside waitFor: the probe mutates the DOM and would re-trigger waitFor's MutationObserver
    const fnBg = resolveCss(document.body, 'backgroundColor', 'var(--fn-bg)');
    await waitFor(() => expect(cs(selected).backgroundColor).toBe(fnBg), SETTLE);
    // `.Mui-selected span.paragraph { color: var(--fn-fg-cta) }`
    const title = within(selected).getByText('Cherry');
    await expect(title.tagName).toBe('SPAN');
    await expect(cs(title).color).toBe(resolveCss(document.body, 'color', 'var(--fn-fg-cta)'));
    // non-selected options keep the default text colour
    const apple = within(listbox).getByRole('option', { name: /Apple/ });
    await expect(cs(within(apple).getByText('Apple')).color).not.toBe(cs(title).color);
    // selected option is focused on open
    await waitFor(() => expect(document.activeElement).toBe(selected), SETTLE);
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(body().queryByRole('listbox')).toBeNull(), SETTLE);
  },
};

export const MenuPortalStackingAndGeometry: Story = {
  args: { id: 'mc-geo', label: 'Fruit', options },
  play: async ({ canvasElement }) => {
    OverlayStackingService.__resetForTests();
    const combo = within(canvasElement).getByRole('combobox');
    // `.MuiSelect-select { padding: 12px 18px }`; MUI keeps padding-right 32px for the icon
    await expect(cs(combo).paddingTop).toBe('12px');
    await expect(cs(combo).paddingLeft).toBe('18px');
    await expect(cs(combo).paddingRight).toBe('32px');

    await userEvent.click(combo);
    const listbox = await body().findByRole('listbox', {}, SETTLE);
    const menuRoot = listbox.closest('.MuiMenu-root') as HTMLElement;
    await expect(menuRoot.parentElement).toBe(document.body);
    // first popover slot of an empty ledger = 1100 + 1 (not MUI's static modal 1300)
    await expect(cs(menuRoot).zIndex).toBe('1101');
    const paper = listbox.closest('.MuiPaper-root') as HTMLElement;
    await expect(cs(paper).maxHeight).toBe('252px');
    // MUI Select pins the paper min-width to the field width via PaperProps.style (merged with our maxHeight)
    const field = combo.closest('.MuiOutlinedInput-root') as HTMLElement;
    await expect(paper.style.minWidth).toBe(`${field.clientWidth}px`);
    await expect(paper.style.maxHeight).toBe('252px');

    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(body().queryByRole('listbox')).toBeNull(), SETTLE);
    await waitFor(() => expect(document.activeElement).toBe(combo), SETTLE);
    // slot released
    await expect(OverlayStackingService.register('probe', 'modal')).toBe(1101);
    OverlayStackingService.__resetForTests();
  },
};

export const KeyboardSelection: Story = {
  args: { id: 'mc-kbd', label: 'Fruit', options, onChange: fn() },
  play: async ({ canvasElement, args }) => {
    const combo = within(canvasElement).getByRole('combobox');
    combo.focus();
    await userEvent.keyboard('{ArrowDown}');
    const listbox = await body().findByRole('listbox', {}, SETTLE);
    const items = within(listbox).getAllByRole('option');
    await waitFor(() => expect(document.activeElement).toBe(items[0]), SETTLE);
    // disabled "Banana" is skipped
    await userEvent.keyboard('{ArrowDown}');
    await expect(document.activeElement).toBe(items[2]);
    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(body().queryByRole('listbox')).toBeNull(), SETTLE);
    await expect(args.onChange).toHaveBeenCalledTimes(1);
    await expect((args.onChange as any).mock.calls[0][1]).toEqual(options[2]);
    await expect(combo.textContent).toBe('Cherry');
  },
};
