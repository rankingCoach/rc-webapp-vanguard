/**
 * MUI upgrade contract (v5 -> v9), real-browser part: our Autocomplete.scss rules target MUI class names. Each style
 * story asserts a computed value our SCSS sets, so a renamed / removed MUI class (or changed DOM nesting) turns the
 * story red. Interaction stories assert observable behaviour only (no MUI class lookups).
 *
 * MUI classes used, with the production dependency (grep hit):
 * `.MuiAutocomplete-inputRoot` Autocomplete.scss:13, `.MuiAutocomplete-input` :20, `.MuiAutocomplete-endAdornment`
 * :52, `.MuiButtonBase-root` :55, `.MuiAutocomplete-clearIndicator` :67, `.MuiAutocomplete-popupIndicator` :73.
 * Vanguard classes: `.vanguard-input-tags` Autocomplete.tsx:202, `.option-style` Autocomplete.tsx:336.
 */
import { StoryObj } from '@storybook/react';
import { SbDecorator } from '@test-utils/get-storybook-decorator';
import React from 'react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { Autocomplete } from './Autocomplete';

type Story = StoryObj<typeof Autocomplete>;

const FRUITS = ['apple', 'banana', 'cherry'];
/** Popper / transition settle budget under a loaded full-suite run. */
const SETTLE = { timeout: 5000 };

export default {
  ...SbDecorator({
    title: 'Vanguard/Autocomplete/MUI Contract',
    component: Autocomplete,
    opts: { withRedux: true },
  }),
};

const Wrapper = ({ children }: { children: React.ReactNode }) => <div style={{ width: 320 }}>{children}</div>;

const getRoot = (canvasElement: HTMLElement, testId = 'contract-ac') =>
  canvasElement.querySelector(`[data-testid="${testId}"]`) as HTMLElement;
/** Top-level body child (portal root) holding `el`; structural, no MUI class. */
const portalRoot = (el: Element): HTMLElement => {
  let node = el as HTMLElement;
  while (node.parentElement && node.parentElement !== document.body) node = node.parentElement;
  return node;
};
const findListbox = () => within(document.body).findByRole('listbox', {}, SETTLE);
const findOption = (name: string) => within(document.body).findByRole('option', { name }, SETTLE);
/** Chips = role=button children of the vanguard `.vanguard-input-tags` wrapper. */
const getChips = (canvasElement: HTMLElement) => {
  const tags = getRoot(canvasElement).querySelector('.vanguard-input-tags') as HTMLElement | null;
  return tags ? (within(tags).queryAllByRole('button') as HTMLElement[]) : [];
};

export const InputStyleContract: Story = {
  args: { testId: 'contract-ac', label: 'Fruit', options: FRUITS, value: null },
  render: (args) => (
    <Wrapper>
      <Autocomplete {...args} />
    </Wrapper>
  ),
  play: async ({ canvasElement }) => {
    const root = getRoot(canvasElement);

    // .vanguard-autocomplete .MuiAutocomplete-inputRoot { padding: 0 54px 0 0 !important }
    const inputRoot = root.querySelector('.MuiAutocomplete-inputRoot') as HTMLElement;
    await expect(inputRoot).not.toBeNull();
    const inputRootStyle = getComputedStyle(inputRoot);
    await expect(inputRootStyle.paddingRight).toBe('54px');
    await expect(inputRootStyle.paddingLeft).toBe('0px');
    await expect(inputRootStyle.paddingTop).toBe('0px');
    await expect(inputRootStyle.paddingBottom).toBe('0px');

    // .MuiAutocomplete-inputRoot .MuiAutocomplete-input { padding: 12px 0 12px 18px !important }
    const input = within(canvasElement).getByRole('combobox');
    await expect(input).toHaveClass('MuiAutocomplete-input');
    const inputStyle = getComputedStyle(input);
    await expect(inputStyle.paddingTop).toBe('12px');
    await expect(inputStyle.paddingRight).toBe('0px');
    await expect(inputStyle.paddingBottom).toBe('12px');
    await expect(inputStyle.paddingLeft).toBe('18px');

    // .MuiAutocomplete-endAdornment .MuiButtonBase-root { 24x24 } (`top: unset` resolves to a layout px value,
    // not asserted).
    const endAdornment = root.querySelector('.MuiAutocomplete-endAdornment') as HTMLElement;
    await expect(endAdornment).not.toBeNull();
    const popupIndicator = endAdornment.querySelector('.MuiButtonBase-root.MuiAutocomplete-popupIndicator') as HTMLElement;
    await expect(getComputedStyle(popupIndicator).width).toBe('24px');
    await expect(getComputedStyle(popupIndicator).height).toBe('24px');
    // value={null}: caret is displayed
    await expect(getComputedStyle(popupIndicator).display).not.toBe('none');
  },
};

// CURRENT BEHAVIOUR (suspected bug): without a `value` prop the caret is hidden (value !== null).
export const CaretHiddenByDefault: Story = {
  name: '[bug-lock] Caret hidden by default',
  args: { testId: 'contract-ac', label: 'Fruit', options: FRUITS },
  render: (args) => (
    <Wrapper>
      <Autocomplete {...args} />
    </Wrapper>
  ),
  play: async ({ canvasElement }) => {
    // Baseline characterization: not a promised contract.
    const root = getRoot(canvasElement);
    // .vanguard-autocomplete-no-caret .MuiAutocomplete-popupIndicator { display: none }
    const popupIndicator = root.querySelector('.MuiAutocomplete-popupIndicator') as HTMLElement;
    await expect(popupIndicator).not.toBeNull();
    await expect(getComputedStyle(popupIndicator).display).toBe('none');
  },
};

export const ClearIndicatorStyleContract: Story = {
  args: { testId: 'contract-ac', label: 'Fruit', options: FRUITS, value: null },
  render: (args) => (
    <Wrapper>
      <Autocomplete {...args} />
      <Autocomplete {...args} testId={'contract-ac-noclear'} hideClearButton={true} />
    </Wrapper>
  ),
  play: async ({ canvasElement }) => {
    const [input, inputNoClear] = within(canvasElement).getAllByRole('combobox');

    // interaction only to reach the "has a value + focused" state
    await userEvent.click(input);
    await userEvent.click(await findOption('apple'));

    const clearBtn = getRoot(canvasElement).querySelector('.MuiAutocomplete-clearIndicator') as HTMLElement;
    await expect(clearBtn).not.toBeNull();
    // MUI: visible while the root is focused; our SCSS sizes every endAdornment ButtonBase to 24x24
    await waitFor(() => expect(getComputedStyle(clearBtn).visibility).toBe('visible'), SETTLE);
    await expect(getComputedStyle(clearBtn).width).toBe('24px');
    await expect(getComputedStyle(clearBtn).height).toBe('24px');

    // .vanguard-autocomplete-no-clear-btn .MuiAutocomplete-clearIndicator { display: none }
    await userEvent.click(inputNoClear);
    await userEvent.click(await findOption('banana'));
    const hiddenClear = getRoot(canvasElement, 'contract-ac-noclear').querySelector(
      '.MuiAutocomplete-clearIndicator',
    ) as HTMLElement;
    await expect(hiddenClear).not.toBeNull();
    await expect(getComputedStyle(hiddenClear).display).toBe('none');
  },
};

export const PopperPlacementContract: Story = {
  args: { testId: 'contract-ac', label: 'Fruit', options: FRUITS, value: null },
  render: (args) => (
    <Wrapper>
      <Autocomplete {...args} />
    </Wrapper>
  ),
  play: async ({ canvasElement }) => {
    const root = getRoot(canvasElement);
    await userEvent.click(within(canvasElement).getByRole('combobox'));
    const listbox = await findListbox();

    const popper = portalRoot(listbox);
    await expect(popper.parentElement).toBe(document.body);
    await waitFor(() => expect(popper).toHaveAttribute('data-popper-placement', 'bottom'), SETTLE);
    // below the field, as wide as the Autocomplete root and left aligned — our sx zIndex must not clobber MUI's
    // inline width
    await waitFor(() => {
      const popperRect = popper.getBoundingClientRect();
      const rootRect = root.getBoundingClientRect();
      expect(Math.round(popperRect.width)).toBe(Math.round(root.clientWidth));
      expect(Math.round(popperRect.left)).toBe(Math.round(rootRect.left));
      expect(popperRect.top).toBeGreaterThanOrEqual(Math.floor(rootRect.bottom) - 1);
    }, SETTLE);
    // OverlayStackingService z-index applied via sx (popover slot above the 1100 base)
    await expect(Number(getComputedStyle(popper).zIndex)).toBeGreaterThan(1100);

    // .option-style { display: flex; gap: $x1 } on highlighted options
    const optionStyle = within(listbox).getAllByRole('option')[0].querySelector('.option-style') as HTMLElement;
    await expect(getComputedStyle(optionStyle).display).toBe('flex');
    await expect(getComputedStyle(optionStyle).columnGap).toBe('8px');

    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(within(document.body).queryByRole('listbox')).toBeNull(), SETTLE);
  },
};

export const KeyboardFocusContract: Story = {
  args: { testId: 'contract-ac', label: 'Fruit', options: FRUITS, value: null, onChange: fn() },
  render: (args) => (
    <Wrapper>
      <Autocomplete {...args} />
    </Wrapper>
  ),
  play: async ({ canvasElement, args }) => {
    const input = within(canvasElement).getByRole('combobox') as HTMLInputElement;
    await userEvent.click(input);
    await findListbox();
    await userEvent.keyboard('{ArrowDown}{ArrowDown}');
    await expect(input).toHaveFocus();
    const activeId = input.getAttribute('aria-activedescendant');
    await expect(activeId ? document.getElementById(activeId)?.textContent : null).toBe('banana');
    await userEvent.keyboard('{Enter}');
    await expect(args.onChange).toHaveBeenCalledWith(expect.anything(), 'banana', 'selectOption', {
      option: 'banana',
    });
    await expect(input.value).toBe('banana');
    await expect(input).toHaveFocus();
  },
};

export const ChipsStyleContract: Story = {
  args: { testId: 'contract-ac', label: 'Fruit', options: FRUITS, value: null, multiple: true },
  render: (args) => (
    <Wrapper>
      <Autocomplete {...args} />
    </Wrapper>
  ),
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole('combobox');
    await userEvent.click(input);
    await userEvent.click(await findOption('apple'));
    await userEvent.click(input);
    await userEvent.click(await findOption('cherry'));

    // renderTags wrapper: .vanguard-autocomplete .vanguard-input-tags { max-height: 200px; overflow: scroll }
    const tags = getRoot(canvasElement).querySelector('.vanguard-input-tags') as HTMLElement;
    await expect(tags).not.toBeNull();
    await expect(getComputedStyle(tags).maxHeight).toBe('200px');
    await expect(getComputedStyle(tags).overflowY).toBe('scroll');

    // renderTags inline style={{ height: '100%' }} on every chip
    const chips = getChips(canvasElement);
    await expect(chips.map((c) => c.textContent)).toEqual(['apple', 'cherry']);
    chips.forEach((chip) => expect(chip.style.height).toBe('100%'));
  },
};

export const ChipsInteractionContract: Story = {
  args: { testId: 'contract-ac', label: 'Fruit', options: FRUITS, value: null, multiple: true },
  render: (args) => (
    <Wrapper>
      <Autocomplete {...args} />
    </Wrapper>
  ),
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole('combobox');
    await userEvent.click(input);
    await userEvent.click(await findOption('apple'));
    await userEvent.click(input);
    await userEvent.click(await findOption('cherry'));
    await expect(getChips(canvasElement).map((c) => c.textContent)).toEqual(['apple', 'cherry']);

    // Backspace removes the last chip
    input.focus();
    await userEvent.keyboard('{Backspace}');
    await expect(getChips(canvasElement).map((c) => c.textContent)).toEqual(['apple']);

    // ArrowLeft focuses the chip
    await userEvent.keyboard('{ArrowLeft}');
    await expect(getChips(canvasElement)[0]).toHaveFocus();

    // the delete "x" (the chip's only svg) removes it
    await userEvent.click(getChips(canvasElement)[0].querySelector('svg') as Element);
    await expect(getChips(canvasElement)).toHaveLength(0);
  },
};
