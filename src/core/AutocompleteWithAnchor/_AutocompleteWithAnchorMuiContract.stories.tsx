/**
 * MUI upgrade contract (v5 -> v9), real-browser part: AutocompleteWithAnchor positions a MUI Popper
 * (PopoverPopper) under the clicked anchor, sizes it to the anchor, focuses the inner Autocomplete input and
 * closes on click-away (MUI ClickAwayListener). The `.autocomplete-content` module class must apply to the
 * Popper root. No MUI class is used: the popper is `.vanguard-popover` (PopoverPopper.tsx:18) and the nested
 * listbox popper is located structurally (portal root).
 */
import { StoryObj } from '@storybook/react';
import { SbDecorator } from '@test-utils/get-storybook-decorator';
import React from 'react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { AutocompleteWithAnchor } from './AutocompleteWithAnchor';
import styles from './AutocompleteWithAnchor.module.scss';

type Story = StoryObj<typeof AutocompleteWithAnchor>;

const OPTIONS = ['Option 1', 'Option 2', 'Option 3'];

export default {
  ...SbDecorator({
    title: 'Vanguard/AutocompleteWithAnchor/MUI Contract',
    component: AutocompleteWithAnchor,
    opts: { withRedux: true },
  }),
};

const getPopper = () => document.querySelector('.vanguard-popover') as HTMLElement | null;
/** Popper / focus settle budget under a loaded full-suite run. */
const SETTLE = { timeout: 5000 };
/** Top-level body child (portal root) holding `el`; structural, no MUI class. */
const portalRoot = (el: Element): HTMLElement => {
  let node = el as HTMLElement;
  while (node.parentElement && node.parentElement !== document.body) node = node.parentElement;
  return node;
};

const args = {
  autocompleteProps: { options: OPTIONS, testId: 'anchored-ac', label: 'Pick', value: null },
};
const render = (storyArgs: Story['args']) => (
  <div style={{ padding: 16 }}>
    <button type={'button'} data-testid={'outside'}>
      {'outside'}
    </button>
    <div style={{ width: 300, marginTop: 16 }}>
      <AutocompleteWithAnchor {...(storyArgs as React.ComponentProps<typeof AutocompleteWithAnchor>)}>
        <div data-testid={'anchor'} style={{ padding: 12, border: '1px solid #ccc' }}>
          {'anchor'}
        </div>
      </AutocompleteWithAnchor>
    </div>
  </div>
);

export const AnchoredPopperStyleContract: Story = {
  args,
  render,
  play: async ({ canvasElement }) => {
    const anchor = within(canvasElement).getByTestId('anchor');
    const anchorEl = anchor.parentElement as HTMLElement; // the onClick wrapper is the Popper anchorEl

    await userEvent.click(anchor);
    await waitFor(() => expect(getPopper()).not.toBeNull(), SETTLE);
    const popper = getPopper() as HTMLElement;

    // module SCSS on the Popper root
    await expect(popper).toHaveClass(styles.autocompleteContent);
    const popperStyle = getComputedStyle(popper);
    await expect(popperStyle.boxSizing).toBe('border-box');
    await expect(popperStyle.maxHeight).toBe('222px');
    await expect(popperStyle.borderTopLeftRadius).toBe('4px');
    // OverlayStackingService z-index beats the static .autocomplete-content z-index: 50
    await expect(Number(popperStyle.zIndex)).toBeGreaterThan(1100);

    // placement: below the anchor, same width (border-box), left aligned
    await waitFor(() => expect(popper).toHaveAttribute('data-popper-placement', 'bottom'), SETTLE);
    const popperRect = popper.getBoundingClientRect();
    const anchorRect = anchorEl.getBoundingClientRect();
    await expect(Math.round(popperRect.width)).toBe(anchorEl.clientWidth);
    await expect(Math.round(popperRect.left)).toBe(Math.round(anchorRect.left));
    // popper.js positions against the anchor rect at open time and does not track the small (font/layout) shift
    // of the anchor that follows -> allow a few px.
    await expect(Math.abs(popperRect.top - anchorRect.bottom)).toBeLessThanOrEqual(4);
  },
};

export const AnchoredPopperInteractionContract: Story = {
  args: { ...args, onOpenChange: fn() },
  render,
  play: async ({ canvasElement, args: storyArgs }) => {
    const canvas = within(canvasElement);
    await expect(storyArgs.onOpenChange).toHaveBeenLastCalledWith(false);

    await userEvent.click(canvas.getByTestId('anchor'));
    await waitFor(() => expect(getPopper()).not.toBeNull(), SETTLE);
    const popper = getPopper() as HTMLElement;
    await expect(storyArgs.onOpenChange).toHaveBeenLastCalledWith(true);

    // focus lands in the Autocomplete input
    const input = within(popper).getByRole('combobox');
    await waitFor(() => expect(input).toHaveFocus(), SETTLE);

    // the Autocomplete listbox (its own portal) stacks above the anchor popper
    await userEvent.click(input);
    const listbox = await within(document.body).findByRole('listbox', {}, SETTLE);
    const listPopper = portalRoot(listbox);
    await expect(listPopper).not.toBe(popper);
    await expect(Number(getComputedStyle(listPopper).zIndex)).toBeGreaterThan(Number(getComputedStyle(popper).zIndex));
    await userEvent.click(within(listbox).getByRole('option', { name: 'Option 2' }));
    await expect((input as HTMLInputElement).value).toBe('Option 2');
    await expect(getPopper()).not.toBeNull();

    // click-away closes
    await userEvent.click(canvas.getByTestId('outside'));
    await waitFor(() => expect(getPopper()).toBeNull(), SETTLE);
    await expect(storyArgs.onOpenChange).toHaveBeenLastCalledWith(false);
  },
};
