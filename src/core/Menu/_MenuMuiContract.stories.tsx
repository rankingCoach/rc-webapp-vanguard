import { StoryObj } from '@storybook/react';
import { SbDecorator } from '@test-utils/get-storybook-decorator';
import { Menu, MenuItemConfig, MenuProps } from '@vanguard/Menu/Menu';
import { OVERLAY_BASE_Z_INDEX } from '@vanguard/OverlayStacking/OverlayStackingService';
import React, { useState } from 'react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

/**
 * MUI contract (real browser) for Menu / MenuItem over MUI v5 `Menu` (Popover + Modal + MenuList).
 *
 * Pins paper placement relative to the anchor, computed styles on `.MuiMenu-paper/-list` and
 * `.MuiMenuItem-root` (Menu.module.scss targets `.MuiMenu-list`; SearchableSelect/Select SCSS target
 * `.MuiMenuItem-root`), real focus movement/return and the stacking z-index.
 * The menu portals to <body>, so queries go through `document.body`.
 * Production deps of the MUI classes used: `.MuiMenu-paper` (SearchableSelect.scss:45), `.MuiMenu-list`
 * (Menu.module.scss:2), `.MuiMenuItem-root` (Select.module.scss:4). `.MuiBackdrop-root` is a locator only.
 * Story names tagged `[bug-lock]` / `[v5-quirk]` = baseline characterization, not a promised contract.
 */
export default {
  ...SbDecorator({
    title: 'Vanguard/Menu/MUI Contract',
    component: Menu,
  }),
};

type Story = StoryObj<typeof Menu>;

const body = () => within(document.body);

// Settle waits (Grow transition, focus moves, unmount) get headroom for loaded full-suite runs.
const SETTLE = { timeout: 5000 };

const items: MenuItemConfig[] = [
  { key: 'a', children: 'Alpha' },
  { key: 'b', children: 'Beta', disabled: true },
  { key: 'c', children: 'Gamma', selected: true },
  { key: 'd', children: 'Delta' },
];

const onCloseSpy = fn();

const Harness = (props: Partial<MenuProps>) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  return (
    <div style={{ padding: 80 }}>
      <button data-testid={'anchor'} style={{ width: 140, height: 36 }} onClick={(e) => setAnchorEl(e.currentTarget)}>
        {'Open menu'}
      </button>
      <Menu
        testId={'contract-menu'}
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={(event, reason) => {
          onCloseSpy(reason);
          setAnchorEl(null);
        }}
        items={items}
        {...props}
      />
    </div>
  );
};

const openMenu = async (canvasElement: HTMLElement) => {
  const anchor = within(canvasElement).getByTestId('anchor');
  await userEvent.click(anchor);
  const list = await body().findByRole('menu', {}, SETTLE);
  const paper = list.closest('.MuiMenu-paper') as HTMLElement;
  // wait for the Grow enter transition to settle so rects are final
  await waitFor(() => expect(getComputedStyle(paper).opacity).toBe('1'), SETTLE);
  await waitFor(() => expect(getComputedStyle(paper).transform).toBe('none'), SETTLE);
  return { anchor, list, paper, root: body().getByTestId('contract-menu') };
};

// DOM query (not role): during the exit transition MUI aria-hides the root, which hides it from role queries
const waitClosed = () =>
  waitFor(() => expect(document.querySelector('[data-testid="contract-menu"]')).toBeNull(), SETTLE);

export const PaperPlacementAndStyles: Story = {
  render: () => <Harness />,
  play: async ({ canvasElement }) => {
    const { anchor, list, paper, root } = await openMenu(canvasElement);
    const a = anchor.getBoundingClientRect();
    const p = paper.getBoundingClientRect();

    // anchorOrigin bottom/left, transformOrigin top/left: paper hangs from the anchor's bottom-left corner
    await expect(Math.abs(p.top - a.bottom)).toBeLessThanOrEqual(1);
    await expect(Math.abs(p.left - a.left)).toBeLessThanOrEqual(1);

    // root is fixed full-viewport, stacked by OverlayStackingService
    const rootStyle = getComputedStyle(root);
    await expect(rootStyle.position).toBe('fixed');
    await expect(Number(rootStyle.zIndex)).toBe(OVERLAY_BASE_Z_INDEX + 1);

    // Menu.module.scss: `.menu .MuiMenu-list { max-height: 100% !important }`
    await expect(getComputedStyle(list).maxHeight).toBe('100%');
    await expect(getComputedStyle(list).paddingTop).toBe('8px');
    await expect(getComputedStyle(list).outlineStyle).toBe('none');
    // MUI Menu paper caps its height relative to the viewport
    await expect(getComputedStyle(paper).maxHeight).toBe('calc(100% - 96px)');
    await expect(getComputedStyle(paper).overflowY).toBe('auto');
    // elevated surface: the paper paints a drop shadow
    await expect(getComputedStyle(paper).boxShadow).not.toBe('none');

    await userEvent.keyboard('{Escape}');
    await waitClosed();
  },
};

export const MenuItemComputedStyles: Story = {
  render: () => <Harness />,
  play: async ({ canvasElement }) => {
    await openMenu(canvasElement);
    const [alpha, beta, gamma] = body().getAllByRole('menuitem');
    const alphaStyle = getComputedStyle(alpha);

    await expect(alphaStyle.paddingTop).toBe('6px');
    await expect(alphaStyle.paddingBottom).toBe('6px');
    await expect(alphaStyle.paddingLeft).toBe('16px');
    await expect(alphaStyle.paddingRight).toBe('16px');
    await expect(alphaStyle.display).toBe('flex');
    await expect(alphaStyle.cursor).toBe('pointer');

    // disabled: MUI dims and blocks the pointer
    await expect(getComputedStyle(beta).opacity).toBe('0.38');
    await expect(getComputedStyle(beta).pointerEvents).toBe('none');

    // selected: tinted background (MUI primary @ selectedOpacity)
    await expect(getComputedStyle(gamma).backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
    await expect(getComputedStyle(alpha).backgroundColor).toBe('rgba(0, 0, 0, 0)');

    await userEvent.keyboard('{Escape}');
    await waitClosed();
  },
};

export const SizePropsOnPaper: Story = {
  render: () => <Harness width={300} maxHeight={90} />,
  play: async ({ canvasElement }) => {
    const { paper } = await openMenu(canvasElement);
    const p = paper.getBoundingClientRect();

    await expect(Math.round(p.width)).toBe(300);
    await expect(Math.round(p.height)).toBeLessThanOrEqual(90);
    await expect(paper.scrollHeight).toBeGreaterThan(paper.clientHeight);

    await userEvent.keyboard('{Escape}');
    await waitClosed();
  },
};

export const FocusMovesInAndReturnsToAnchor: Story = {
  render: () => <Harness />,
  play: async ({ canvasElement }) => {
    onCloseSpy.mockClear();
    const { anchor } = await openMenu(canvasElement);

    // selected item (Gamma) gets focus on open (variant selectedMenu)
    await waitFor(() => expect(body().getByRole('menuitem', { name: 'Gamma' })).toHaveFocus(), SETTLE);

    await userEvent.keyboard('{ArrowDown}');
    await expect(body().getByRole('menuitem', { name: 'Delta' })).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}');
    await expect(body().getByRole('menuitem', { name: 'Alpha' })).toHaveFocus();
    // disabled Beta is skipped
    await userEvent.keyboard('{ArrowDown}');
    await expect(body().getByRole('menuitem', { name: 'Gamma' })).toHaveFocus();

    await userEvent.keyboard('{Escape}');
    await waitClosed();
    await expect(onCloseSpy).toHaveBeenCalledWith('escapeKeyDown');
    await waitFor(() => expect(anchor).toHaveFocus(), SETTLE);
  },
};

// MUI v5 MenuList keeps tabindex 0 on the initially active item; v9 moves it with focus (roving tabindex).
export const TabIndexDoesNotFollowFocus: Story = {
  name: '[v5-quirk] tabindex follows focus while arrowing (v9)',
  render: () => <Harness />,
  play: async ({ canvasElement }) => {
    // Baseline characterization: not a promised contract.
    await openMenu(canvasElement);
    await waitFor(() => expect(body().getByRole('menuitem', { name: 'Gamma' })).toHaveFocus(), SETTLE);

    await userEvent.keyboard('{ArrowDown}');
    await expect(body().getByRole('menuitem', { name: 'Delta' })).toHaveFocus();
    await expect(
      body()
        .getAllByRole('menuitem')
        .map((el) => el.getAttribute('tabindex')),
    ).toEqual(['-1', '-1', '-1', '0']);

    await userEvent.keyboard('{Escape}');
    await waitClosed();
  },
};

export const TabClosesMenu: Story = {
  render: () => <Harness />,
  play: async ({ canvasElement }) => {
    onCloseSpy.mockClear();
    const { anchor } = await openMenu(canvasElement);

    await userEvent.tab();
    await waitClosed();
    await expect(onCloseSpy).toHaveBeenCalledWith('tabKeyDown');
    await waitFor(() => expect(anchor).toHaveFocus(), SETTLE);
  },
};

export const BackdropClickClosesMenu: Story = {
  render: () => <Harness />,
  play: async ({ canvasElement }) => {
    onCloseSpy.mockClear();
    const { root } = await openMenu(canvasElement);
    const backdrop = root.querySelector('.MuiBackdrop-root') as HTMLElement;

    // invisible backdrop covers the viewport
    const b = backdrop.getBoundingClientRect();
    await expect(Math.round(b.width)).toBe(window.innerWidth);
    await expect(getComputedStyle(backdrop).backgroundColor).toBe('rgba(0, 0, 0, 0)');

    await userEvent.click(backdrop);
    // waitClosed also proves no leftover portal node
    await waitClosed();
    await expect(onCloseSpy).toHaveBeenCalledWith('backdropClick');
  },
};
