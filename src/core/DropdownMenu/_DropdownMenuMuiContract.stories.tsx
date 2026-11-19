import { StoryObj } from '@storybook/react';
import { SbDecorator } from '@test-utils/get-storybook-decorator';
import { OVERLAY_BASE_Z_INDEX } from '@vanguard/OverlayStacking/OverlayStackingService';
import React, { useRef, useState } from 'react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { DropdownMenu, DropdownMenuProps } from './DropdownMenu';

/**
 * MUI contract (real browser) for DropdownMenu over MUI v5 `Popper` + `Fade` + `ClickAwayListener` + `MenuList`.
 *
 * Pins the 20px offset placement, the arrow positioned by popper.js's arrow modifier, the module SCSS on the
 * MUI MenuList/MenuItem and keyboard/click-away close. The popper is located via `[data-popper-placement]`
 * (DropdownMenu.module.scss:24 styles it); no MUI class is asserted.
 * Story names tagged `[bug-lock]` / `[v5-quirk]` = baseline characterization, not a promised contract.
 */
export default {
  ...SbDecorator({
    title: 'Vanguard/DropdownMenu/MUI Contract',
    component: DropdownMenu,
  }),
};

type Story = StoryObj<typeof DropdownMenu>;

const onItemSpy = fn();

const Harness = (props: Partial<DropdownMenuProps>) => {
  const [isOpen, setIsOpen] = useState(false);
  const anchorRef = useRef<HTMLButtonElement>(null);
  return (
    <div style={{ padding: 160, display: 'flex', justifyContent: 'center' }}>
      <button ref={anchorRef} data-testid={'anchor'} style={{ width: 140, height: 36 }} onClick={() => setIsOpen((v) => !v)}>
        {'Dropdown'}
      </button>
      <button data-testid={'outside'}>{'outside'}</button>
      <DropdownMenu
        anchorEl={anchorRef}
        isOpen={isOpen}
        toggleIsOpen={() => setIsOpen((v) => !v)}
        items={[{ title: 'Change image', onClick: onItemSpy }, { title: 'Remove' }]}
        {...props}
      />
    </div>
  );
};

// Settle waits (Fade 250ms, popper positioning, focus, unmount) get headroom for loaded full-suite runs.
const SETTLE = { timeout: 5000 };

const getPopper = () => document.querySelector('[data-popper-placement]') as HTMLElement | null;

const openDropdown = async (canvasElement: HTMLElement) => {
  const anchor = within(canvasElement).getByTestId('anchor');
  // popper.js measures once on open; a late web-font swap would resize content after positioning
  await document.fonts.ready;
  await userEvent.click(anchor);
  await waitFor(() => expect(getPopper()).not.toBeNull(), SETTLE);
  const popper = getPopper() as HTMLElement;
  const fade = popper.firstElementChild as HTMLElement;
  await waitFor(() => expect(getComputedStyle(fade).opacity).toBe('1'), SETTLE);
  const list = within(popper).getByRole('menu');
  const arrow = fade.firstElementChild as HTMLElement;
  return { anchor, popper, list, arrow };
};

const waitClosed = () => waitFor(() => expect(getPopper()).toBeNull(), SETTLE);

const center = (r: DOMRect) => ({ x: r.left + r.width / 2, y: r.top + r.height / 2 });

export const BottomPlacementOffsetAndArrow: Story = {
  render: () => <Harness />,
  play: async ({ canvasElement }) => {
    const { anchor, popper, list, arrow } = await openDropdown(canvasElement);
    const a = anchor.getBoundingClientRect();
    const p = popper.getBoundingClientRect();
    const ar = arrow.getBoundingClientRect();

    await expect(popper).toHaveAttribute('data-popper-placement', 'bottom');
    // offset modifier [0, 20]
    await expect(Math.round(p.top - a.bottom)).toBe(20);
    // popper.js measures the list once on open, before the Text content reaches its final width, so the
    // card can sit a few px off-centre; the arrow (positioned in the same pass) is exact
    await expect(Math.abs(center(p).x - center(a).x)).toBeLessThanOrEqual(4);
    // arrow: popper.js arrow modifier centres it on the anchor; SCSS `top: -12px` puts it above the list
    await expect(getComputedStyle(arrow).position).toBe('absolute');
    await expect(Math.abs(center(ar).x - center(a).x)).toBeLessThanOrEqual(1);
    await expect(Math.round(ar.bottom)).toBe(Math.round(p.top));
    await expect(Math.round(ar.height)).toBe(12);
    await expect(Math.round(ar.width)).toBe(24);
    await expect(getComputedStyle(arrow).borderBottomWidth).toBe('12px');
    await expect(getComputedStyle(arrow).borderTopWidth).toBe('0px');

    await expect(Number(getComputedStyle(popper).zIndex)).toBe(OVERLAY_BASE_Z_INDEX + 1);
    await expect(popper.parentElement).toBe(document.body);
    await expect(list).toBeVisible();

    await userEvent.keyboard('{Escape}');
    await waitClosed();
  },
};

export const TopPlacementArrowBelow: Story = {
  render: () => <Harness placement={'top'} />,
  play: async ({ canvasElement }) => {
    const { anchor, popper, arrow } = await openDropdown(canvasElement);
    const a = anchor.getBoundingClientRect();
    const p = popper.getBoundingClientRect();
    const ar = arrow.getBoundingClientRect();

    await expect(popper).toHaveAttribute('data-popper-placement', 'top');
    await expect(Math.round(a.top - p.bottom)).toBe(20);
    await expect(Math.round(ar.top)).toBe(Math.round(p.bottom));
    await expect(getComputedStyle(arrow).borderTopWidth).toBe('12px');
    await expect(Math.abs(center(ar).x - center(a).x)).toBeLessThanOrEqual(1);

    await userEvent.keyboard('{Escape}');
    await waitClosed();
  },
};

export const ListAndItemComputedStyles: Story = {
  render: () => <Harness />,
  play: async ({ canvasElement }) => {
    const { list } = await openDropdown(canvasElement);
    const ls = getComputedStyle(list);

    // DropdownMenu.module.scss .menu on MUI MenuList
    await expect(ls.display).toBe('flex');
    await expect(ls.flexDirection).toBe('column');
    await expect(ls.paddingTop).toBe('8px');
    await expect(ls.borderTopLeftRadius).toBe('4px');
    await expect(ls.filter).toContain('drop-shadow');

    const [first] = within(list).getAllByRole('menuitem');
    const is = getComputedStyle(first);
    await expect(is.paddingTop).toBe('6px');
    await expect(is.paddingLeft).toBe('16px');
    await expect(is.display).toBe('flex');

    await userEvent.keyboard('{Escape}');
    await waitClosed();
  },
};

// CURRENT BEHAVIOUR (suspected bug): MUI List's emotion `padding: 0` (injected after the module CSS, equal
// specificity) beats `.menu { padding: 8px }` horizontally; only MUI's own 8px vertical padding remains.
export const ListHorizontalPaddingLost: Story = {
  name: '[bug-lock] module .menu horizontal padding is overridden by MUI List padding 0',
  render: () => <Harness />,
  play: async ({ canvasElement }) => {
    // Baseline characterization: not a promised contract.
    const { list } = await openDropdown(canvasElement);
    const ls = getComputedStyle(list);

    await expect(ls.paddingLeft).toBe('0px');
    await expect(ls.paddingRight).toBe('0px');

    await userEvent.keyboard('{Escape}');
    await waitClosed();
  },
};

export const KeyboardAndFocus: Story = {
  render: () => <Harness />,
  play: async ({ canvasElement }) => {
    onItemSpy.mockClear();
    const { list } = await openDropdown(canvasElement);
    const [first, second] = within(list).getAllByRole('menuitem');

    await waitFor(() => expect(first).toHaveFocus(), SETTLE);
    await userEvent.keyboard('{ArrowDown}');
    await expect(second).toHaveFocus();
    await userEvent.keyboard('{ArrowUp}');
    await expect(first).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(onItemSpy).toHaveBeenCalledTimes(1);
    await waitClosed();
  },
};

// CURRENT BEHAVIOUR (suspected a11y bug): Popper has no focus restore, so focus is lost after close.
export const NoFocusRestoreAfterClose: Story = {
  name: '[bug-lock] focus is not returned to the anchor after close',
  render: () => <Harness />,
  play: async ({ canvasElement }) => {
    // Baseline characterization: not a promised contract.
    const { anchor, list } = await openDropdown(canvasElement);
    await waitFor(() => expect(within(list).getAllByRole('menuitem')[0]).toHaveFocus(), SETTLE);

    await userEvent.keyboard('{Escape}');
    await waitClosed();

    await expect(anchor).not.toHaveFocus();
  },
};

export const ClickAwayCloses: Story = {
  render: () => <Harness />,
  play: async ({ canvasElement }) => {
    await openDropdown(canvasElement);

    await userEvent.click(within(canvasElement).getByTestId('outside'));
    await waitClosed();
  },
};
