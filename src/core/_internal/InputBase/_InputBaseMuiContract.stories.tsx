/**
 * MUI upgrade contract (S0), real browser: InputBase.scss targets MUI class names
 * (`.MuiOutlinedInput-root/-input`, `.MuiInputLabel-root/-shrink/-asterisk`, `.MuiInputAdornment-*`,
 * `.MuiFormHelperText-root`, `.MuiSelect-select`, `legend`). A renamed/removed MUI class makes the rule
 * silently dead, so each story asserts a computed value that only OUR SCSS produces.
 * Values come from src/core/_internal/InputBase/InputBase.scss.
 */
import { InputAdornment, MenuItem } from '@mui/material';
import { StoryObj } from '@storybook/react';
import { SbDecorator } from '@test-utils/get-storybook-decorator';
import { FlagAdornment } from '@vanguard/FlagAdornment/FlagAdornment';
import React from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { InputBase } from './InputBase';

/** Settle wait for transitions/poppers/async assets: 1s is not enough under a loaded full-suite run. */
const SETTLE = { timeout: 5000 };

export default {
  ...SbDecorator({
    title: 'Vanguard/InputBase/MUI Contract',
    component: InputBase,
    opts: { withRedux: true, maxWidth: '400px' },
  }),
};

type Story = StoryObj<typeof InputBase>;

const cs = (el: Element | null) => {
  if (!el) throw new Error('element not found');
  return getComputedStyle(el);
};

/**
 * Resolve a CSS value (e.g. `var(--fn-bg)`) in the same theme scope as `host`.
 * Never call inside `waitFor`: the probe element mutates the DOM and re-triggers waitFor's observer forever.
 */
const resolveCss = (host: HTMLElement, prop: 'color' | 'backgroundColor', value: string) => {
  const probe = document.createElement('div');
  probe.style[prop] = value;
  host.appendChild(probe);
  const resolved = getComputedStyle(probe)[prop];
  probe.remove();
  return resolved;
};

export const OutlinedInputStyles: Story = {
  render: () => <InputBase id="mc-outlined" label="Name" infoText="Info" />,
  play: async ({ canvasElement }) => {
    const input = canvasElement.querySelector('#mc-outlined') as HTMLInputElement;
    // `.MuiOutlinedInput-root .MuiOutlinedInput-input { padding: 12px 18px }` (MUI default 16.5px 14px)
    const inputStyle = cs(input);
    await expect(inputStyle.paddingTop).toBe('12px');
    await expect(inputStyle.paddingBottom).toBe('12px');
    await expect(inputStyle.paddingLeft).toBe('18px');
    await expect(inputStyle.paddingRight).toBe('18px');
    await expect(inputStyle.zIndex).toBe('1');
    // `.MuiOutlinedInput-root { font-size: 16px; line-height: 24px; padding: unset }`
    const root = input.closest('.MuiOutlinedInput-root') as HTMLElement;
    await expect(cs(root).fontSize).toBe('16px');
    await expect(cs(root).lineHeight).toBe('24px');
    await expect(cs(root).paddingLeft).toBe('0px');
    await expect(cs(root).backgroundColor).toBe(resolveCss(canvasElement, 'backgroundColor', 'var(--fn-bg)'));
    // `fieldset { top: 0; border-width: 1px; border-color: var(--fn-brd-gl) }` (MUI default top: -5px)
    const fieldset = root.querySelector('fieldset') as HTMLElement;
    await expect(cs(fieldset).top).toBe('0px');
    await expect(cs(fieldset).borderTopWidth).toBe('1px');
    await expect(cs(fieldset).borderTopColor).toBe(resolveCss(canvasElement, 'color', 'var(--fn-brd-gl)'));
    // `legend { display: none }`
    await expect(cs(fieldset.querySelector('legend')).display).toBe('none');
    // rendered height 47px = 12 + MUI input content height 1.4375em (23px) + 12 -- field height consumers rely on
    await expect(Math.round(input.getBoundingClientRect().height)).toBe(47);
  },
};

export const FocusedBorderUsesCtaColor: Story = {
  render: () => <InputBase id="mc-focus" label="Name" />,
  play: async ({ canvasElement }) => {
    const input = canvasElement.querySelector('#mc-focus') as HTMLInputElement;
    await userEvent.click(input);
    const root = input.closest('.MuiOutlinedInput-root') as HTMLElement;
    await waitFor(() => expect(root.classList.contains('Mui-focused')).toBe(true), SETTLE);
    // `.MuiOutlinedInput-root.Mui-focused fieldset { border-width: 1px; border-color: var(--fn-bg-cta) }`
    const fieldset = root.querySelector('fieldset') as HTMLElement;
    await expect(cs(fieldset).borderTopWidth).toBe('1px');
    // resolve outside waitFor: the probe mutates the DOM and would re-trigger waitFor's MutationObserver
    const ctaBg = resolveCss(canvasElement, 'color', 'var(--fn-bg-cta)');
    await waitFor(() => expect(cs(fieldset).borderTopColor).toBe(ctaBg), SETTLE);
    // `.MuiInputLabel-root.Mui-focused { color: var(--fn-fg-cta) }`
    const label = canvasElement.querySelector('#mc-focus-label') as HTMLElement;
    // MUI animates the label color (200ms transition), so wait for the end state
    const ctaFg = resolveCss(canvasElement, 'color', 'var(--fn-fg-cta)');
    await waitFor(() => expect(cs(label).color).toBe(ctaFg), SETTLE);
  },
};

export const LabelFloatingAndShrink: Story = {
  render: () => (
    <div>
      <InputBase id="mc-float" label="Floating" />
      <InputBase id="mc-static" label="Static" labelType="static" required />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const floating = canvasElement.querySelector('#mc-float-label') as HTMLElement;
    // `.MuiInputLabel-root { transform: translate(12px, 12px) scale(1); font-size: 16px; z-index: 2 }`
    await expect(cs(floating).transform).toBe('matrix(1, 0, 0, 1, 12, 12)');
    await expect(cs(floating).fontSize).toBe('16px');
    await expect(cs(floating).zIndex).toBe('2');

    const shrunk = canvasElement.querySelector('#mc-static-label') as HTMLElement;
    // `.MuiInputLabel-shrink { transform: translate(12px, -10px) scale(0.875); font-weight: 500 }`
    await waitFor(() => expect(cs(shrunk).transform).toBe('matrix(0.875, 0, 0, 0.875, 12, -10)'), SETTLE);
    await expect(cs(shrunk).fontWeight).toBe('500');
    await expect(cs(shrunk).lineHeight).toBe('18px');
    await expect(cs(shrunk).paddingTop).toBe('2px');
    // `.MuiInputLabel-asterisk { display: none }`
    await expect(cs(shrunk.querySelector('.MuiInputLabel-asterisk')).display).toBe('none');

    // floating label shrinks on focus with the same transform
    await userEvent.click(canvasElement.querySelector('#mc-float') as HTMLElement);
    await waitFor(() => expect(cs(floating).transform).toBe('matrix(0.875, 0, 0, 0.875, 12, -10)'), SETTLE);
  },
};

export const OuterLabelIsInFlow: Story = {
  render: () => <InputBase id="mc-outer" label="Outer" labelType="outer" />,
  play: async ({ canvasElement }) => {
    const label = canvasElement.querySelector('#mc-outer-label') as HTMLElement;
    // `.vanguard-label-outer .MuiInputLabel-root { position: relative; transform: none; margin-bottom: 5px }`
    await expect(cs(label).position).toBe('relative');
    await expect(cs(label).transform).toBe('none');
    await expect(cs(label).marginBottom).toBe('5px');
    // label sits above the input box, not over it
    const input = canvasElement.querySelector('#mc-outer') as HTMLElement;
    await expect(label.getBoundingClientRect().bottom).toBeLessThanOrEqual(input.getBoundingClientRect().top);
  },
};

export const AdornmentMargins: Story = {
  render: () => (
    <InputBase
      id="mc-adorn"
      label="Phone"
      adornment={<FlagAdornment countryCode="de" />}
      endAdornment={
        <InputAdornment position="end" data-testid="end-adornment">
          €
        </InputAdornment>
      }
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const end = canvas.getByTestId('end-adornment');
    // `.MuiInputAdornment-root.MuiInputAdornment-positionEnd { margin-right: 8px }` (MUI default 0)
    await expect(cs(end).marginRight).toBe('8px');
    await expect(cs(end).zIndex).toBe('1');
    // `.MuiInputAdornment-root.MuiInputAdornment-positionStart { margin-left: 14px }` (MUI default 0)
    const start = canvasElement.querySelector('.MuiInputAdornment-positionStart') as HTMLElement;
    await expect(cs(start).marginLeft).toBe('14px');
    // MUI default start adornment margin-right: 8px stays
    await expect(cs(start).marginRight).toBe('8px');
    const input = canvasElement.querySelector('#mc-adorn') as HTMLElement;
    await expect(start.getBoundingClientRect().right).toBeLessThanOrEqual(input.getBoundingClientRect().left);
    await expect(end.getBoundingClientRect().left).toBeGreaterThanOrEqual(input.getBoundingClientRect().right);
  },
};

export const HelperTextReset: Story = {
  render: () => <InputBase id="mc-helper" label="Name" infoText="Helpful" counter maxLength={10} />,
  play: async ({ canvasElement }) => {
    const helper = canvasElement.querySelector('#mc-helper-helper-text') as HTMLElement;
    // `.MuiFormHelperText-root { margin: 0; padding: 0 }` (MUI contained default margin 3px 14px 0)
    await expect(cs(helper).marginTop).toBe('0px');
    await expect(cs(helper).marginLeft).toBe('0px');
    await expect(cs(helper).paddingLeft).toBe('0px');
    const container = helper.querySelector('.vanguard-input-bottom-container') as HTMLElement;
    await expect(cs(container).display).toBe('flex');
    await expect(cs(container).paddingTop).toBe('8px');
    await expect(cs(container).paddingLeft).toBe('14px');
  },
};

export const DisabledDimsTheField: Story = {
  render: () => <InputBase id="mc-disabled" label="Name" disabled />,
  play: async ({ canvasElement }) => {
    const root = (canvasElement.querySelector('#mc-disabled') as HTMLElement).closest(
      '.MuiOutlinedInput-root',
    ) as HTMLElement;
    // `.MuiOutlinedInput-root.Mui-disabled { opacity: 40% }`
    await expect(cs(root).opacity).toBe('0.4');
  },
};

export const ErrorBorder: Story = {
  render: () => (
    <InputBase
      id="mc-error"
      label="Name"
      formconfig={{ _inputRef: { current: null }, hasError: true, errors: ['Error!'] as any }}
    />
  ),
  play: async ({ canvasElement }) => {
    const root = (canvasElement.querySelector('#mc-error') as HTMLElement).closest(
      '.MuiOutlinedInput-root',
    ) as HTMLElement;
    // `.MuiOutlinedInput-root.Mui-error fieldset { border-color: var(--e500) }`
    await expect(cs(root.querySelector('fieldset')).borderTopColor).toBe(
      resolveCss(canvasElement, 'color', 'var(--e500)'),
    );
    // `.MuiInputLabel-root.Mui-error { color: var(--fn-fg-light) }` (not MUI's error red)
    await expect(cs(canvasElement.querySelector('#mc-error-label')).color).toBe(
      resolveCss(canvasElement, 'color', 'var(--fn-fg-light)'),
    );
  },
};

export const GreyThemeRemovesBorder: Story = {
  render: () => <InputBase id="mc-grey" theme="grey" />,
  play: async ({ canvasElement }) => {
    const root = (canvasElement.querySelector('#mc-grey') as HTMLElement).closest(
      '.MuiOutlinedInput-root',
    ) as HTMLElement;
    // `.vanguard-input-grey .MuiOutlinedInput-root { height: 32px } fieldset { border: unset }`
    await expect(cs(root).height).toBe('32px');
    await expect(cs(root.querySelector('fieldset')).borderTopStyle).toBe('none');
  },
};

export const SelectDisplayAndMenu: Story = {
  render: () => (
    <InputBase id="mc-select" label="Pick" select formFieldType="Select" value="" valueAsDefaultValue>
      {['a', 'b', 'c'].map((v) => (
        <MenuItem key={v} value={v}>
          {v.toUpperCase()}
        </MenuItem>
      ))}
    </InputBase>
  ),
  play: async ({ canvasElement }) => {
    const combo = within(canvasElement).getByRole('combobox');
    // `.MuiSelect-select { padding: 12px 18px; font-size: 16px; line-height: 24px }`
    await expect(cs(combo).paddingTop).toBe('12px');
    await expect(cs(combo).paddingLeft).toBe('18px');
    await expect(cs(combo).lineHeight).toBe('24px');
    // MUI keeps its own (higher specificity) padding-right for the arrow icon
    await expect(cs(combo).paddingRight).toBe('32px');

    await userEvent.click(combo);
    const listbox = await within(document.body).findByRole('listbox', {}, SETTLE);
    const menuRoot = listbox.closest('.MuiMenu-root') as HTMLElement;
    // dropdown stacks from the OverlayStackingService ledger, not MUI's static 1300
    await expect(Number(cs(menuRoot).zIndex)).toBeGreaterThan(1100);
    await expect(Number(cs(menuRoot).zIndex)).toBeLessThan(1300);
    const paper = listbox.closest('.MuiPaper-root') as HTMLElement;
    await expect(cs(paper).maxHeight).toBe('252px');
    // the paper is anchored under/over the field, inside the viewport
    const rect = paper.getBoundingClientRect();
    await expect(rect.top).toBeGreaterThanOrEqual(0);
    await expect(rect.bottom).toBeLessThanOrEqual(window.innerHeight);

    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(within(document.body).queryByRole('listbox')).toBeNull(), SETTLE);
    await waitFor(() => expect(document.activeElement).toBe(combo), SETTLE);
  },
};

export const TextFieldSizeSmall: Story = {
  render: () => (
    <div>
      <InputBase id="mc-size-medium" label="Medium" />
      <InputBase id="mc-size-small" label="Small" textFieldProps={{ size: 'small' }} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const medium = canvasElement.querySelector('#mc-size-medium') as HTMLInputElement;
    const small = canvasElement.querySelector('#mc-size-small') as HTMLInputElement;
    // `.MuiOutlinedInput-root .MuiOutlinedInput-input { padding: 12px 18px }` (InputBase.scss:118) also wins over
    // MUI's small padding (8.5px 14px), so textFieldProps.size=small renders the same field geometry
    await expect(cs(small).paddingTop).toBe('12px');
    await expect(cs(small).paddingLeft).toBe('18px');
    await expect(Math.round(small.getBoundingClientRect().height)).toBe(
      Math.round(medium.getBoundingClientRect().height),
    );
    // the label keeps the Vanguard (not MUI small) floating transform
    await expect(cs(canvasElement.querySelector('#mc-size-small-label')).transform).toBe('matrix(1, 0, 0, 1, 12, 12)');
  },
};
