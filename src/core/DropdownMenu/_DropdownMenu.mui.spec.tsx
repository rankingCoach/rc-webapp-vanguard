/**
 * MUI contract (characterization) spec for DropdownMenu (MUI Popper + Fade + ClickAwayListener + MenuList + MenuItem).
 *
 * Locks CURRENT behaviour on MUI v5.16 so the MUI v6/v7/v9 bumps go red where MUI changed behaviour.
 * Do not edit these assertions to make a bump pass; see agentic-plans/mui-upgrade-plan.md "TDD contract".
 *
 * The popper is located via `[data-popper-placement]` (DropdownMenu.module.scss:24 styles it); MUI classes are
 * asserted only where production depends on them: `.MuiList-root` (Select.module.scss:3), `.MuiMenuItem-root`
 * (Select.module.scss:4, SearchableSelect.scss:96), `Mui-selected` (Select.module.scss:5).
 * Tags: `[bug-lock]` / `[v5-quirk]` = baseline characterization, not a promised contract.
 */
import '@testing-library/jest-dom/vitest';

import userEvent from '@testing-library/user-event';
import { DropdownMenu, DropdownMenuItemProps, DropdownMenuProps } from '@vanguard/DropdownMenu/DropdownMenu';
import { IconNames } from '@vanguard/Icon/IconNames';
import { OVERLAY_BASE_Z_INDEX, OverlayStackingService } from '@vanguard/OverlayStacking/OverlayStackingService';
import React, { useRef, useState } from 'react';
import { afterEach, describe, expect, test, vi } from 'vitest';

import { act, fireEvent, render, screen, waitFor } from '../../../test-utils/test-utils';
import styles from './DropdownMenu.module.scss';

type HarnessProps = Partial<Omit<DropdownMenuProps, 'toggleIsOpen' | 'isOpen'>> & {
  initialOpen?: boolean;
  onToggle?: () => void;
  withAnchor?: boolean;
};

const Harness = ({ initialOpen = false, onToggle, withAnchor = true, items, ...rest }: HarnessProps) => {
  const [isOpen, setIsOpen] = useState(initialOpen);
  const anchorRef = useRef<HTMLButtonElement>(null);
  const toggle = () => {
    onToggle?.();
    setIsOpen((v) => !v);
  };
  return (
    <div>
      <button ref={anchorRef} onClick={toggle}>
        {'anchor'}
      </button>
      <button>{'outside'}</button>
      <DropdownMenu
        anchorEl={withAnchor ? anchorRef : undefined}
        isOpen={isOpen}
        toggleIsOpen={toggle}
        items={items ?? [{ title: 'One' }, { title: 'Two' }]}
        {...rest}
      />
    </div>
  );
};

const openDropdown = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(screen.getByRole('button', { name: 'anchor' }));
  return screen.findByRole('menu');
};

const POPPER = '[data-popper-placement]';
const getPopper = () => screen.getByRole('menu').closest(POPPER) as HTMLElement;
const waitForMenuGone = () => waitFor(() => expect(document.querySelector(POPPER)).toBeNull());

describe('DropdownMenu (MUI Popper + MenuList) contract', () => {
  afterEach(() => {
    OverlayStackingService.__resetForTests();
    vi.restoreAllMocks();
  });

  describe('render and structure', () => {
    test('closed: only the (empty) ComponentContainer is rendered; nothing in body', () => {
      render(<Harness />);

      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
      expect(document.querySelector(POPPER)).toBeNull();
    });

    test('open: Popper portaled to body, no role on the popper (role={undefined}), Fade > arrow + list', async () => {
      const user = userEvent.setup();
      const { container } = render(<Harness />);

      const list = await openDropdown(user);
      const popper = getPopper();

      expect(popper.parentElement).toBe(document.body);
      expect(container.contains(popper)).toBe(false);
      expect(popper).not.toHaveAttribute('role');
      const fade = popper.firstElementChild as HTMLElement;
      expect(fade.style.opacity).toBe('1');
      expect(fade.style.transition).toContain('250ms');
      expect(fade.firstElementChild).toHaveClass(styles.arrow);
      expect(list.tagName).toBe('UL');
      expect(list).toHaveClass('MuiList-root', styles.menu);
      expect(list).toHaveAttribute('tabindex', '-1');
    });

    test('items render as <li role="menuitem"> with module class, Text title, optional icon and selected state', async () => {
      const user = userEvent.setup();
      const items: DropdownMenuItemProps[] = [
        { title: 'Plain' },
        {
          title: 'With icon',
          iconName: IconNames.edit,
          iconProps: { testId: 'dd-icon', children: IconNames.edit },
          selected: true,
        },
      ];
      render(<Harness items={items} />);

      await openDropdown(user);
      const [plain, withIcon] = screen.getAllByRole('menuitem');

      expect(plain).toHaveClass('MuiMenuItem-root', styles.item);
      expect(plain).not.toHaveClass('Mui-selected');
      expect(withIcon).toHaveClass('Mui-selected');
      expect(screen.getByText('Plain')).toHaveClass('rc-text');
      expect(withIcon).toContainElement(await screen.findByTestId('dd-icon'));
    });

    test('default placement is bottom (data-popper-placement)', async () => {
      const user = userEvent.setup();
      render(<Harness />);

      await openDropdown(user);

      await waitFor(() => expect(getPopper()).toHaveAttribute('data-popper-placement', 'bottom'));
    });

    test('placement prop is forwarded to Popper', async () => {
      const user = userEvent.setup();
      render(<Harness placement={'top-end'} />);

      await openDropdown(user);

      await waitFor(() => expect(getPopper()).toHaveAttribute('data-popper-placement', 'top-end'));
    });
  });

  describe('focus and tabindex (v9 roving tabindex)', () => {
    test('autoFocusItem focuses the first item on open; first item tabindex 0, others -1', async () => {
      const user = userEvent.setup();
      render(<Harness items={[{ title: 'One' }, { title: 'Two' }, { title: 'Three' }]} />);

      await openDropdown(user);
      const menuItems = screen.getAllByRole('menuitem');

      await waitFor(() => expect(menuItems[0]).toHaveFocus());
      expect(menuItems.map((el) => el.getAttribute('tabindex'))).toEqual(['0', '-1', '-1']);
    });

    test('selected item gets focus and tabindex 0', async () => {
      const user = userEvent.setup();
      render(<Harness items={[{ title: 'One' }, { title: 'Two', selected: true }]} />);

      await openDropdown(user);
      const menuItems = screen.getAllByRole('menuitem');

      await waitFor(() => expect(menuItems[1]).toHaveFocus());
      expect(menuItems.map((el) => el.getAttribute('tabindex'))).toEqual(['-1', '0']);
    });

    test('ArrowDown/ArrowUp move focus (wrapping) and do not toggle', async () => {
      const user = userEvent.setup();
      const onToggle = vi.fn();
      render(<Harness onToggle={onToggle} items={[{ title: 'One' }, { title: 'Two' }]} />);

      await openDropdown(user);
      onToggle.mockClear();
      await user.keyboard('{ArrowDown}');
      expect(screen.getByRole('menuitem', { name: 'Two' })).toHaveFocus();
      await user.keyboard('{ArrowDown}');
      expect(screen.getByRole('menuitem', { name: 'One' })).toHaveFocus();
      await user.keyboard('{ArrowUp}');
      expect(screen.getByRole('menuitem', { name: 'Two' })).toHaveFocus();

      expect(onToggle).not.toHaveBeenCalled();
    });

    // CURRENT BEHAVIOUR (suspected a11y bug): no focus restore — Popper has no FocusTrap/restore, so after
    // Escape focus is left on the (removed) item and falls back to <body>.
    test('[bug-lock] after Escape focus is NOT returned to the anchor', async () => {
      // Baseline characterization: not a promised contract.
      const user = userEvent.setup();
      render(<Harness />);

      await openDropdown(user);
      await user.keyboard('{Escape}');
      await waitForMenuGone();

      expect(screen.getByRole('button', { name: 'anchor' })).not.toHaveFocus();
    });
  });

  describe('close triggers (toggleIsOpen)', () => {
    test('Escape calls toggleIsOpen and the menu unmounts after the Fade', async () => {
      const user = userEvent.setup();
      const onToggle = vi.fn();
      render(<Harness onToggle={onToggle} />);

      await openDropdown(user);
      onToggle.mockClear();
      await user.keyboard('{Escape}');

      expect(onToggle).toHaveBeenCalledTimes(1);
      await waitForMenuGone();
    });

    test('Tab calls toggleIsOpen with default prevented', async () => {
      const user = userEvent.setup();
      const onToggle = vi.fn();
      render(<Harness onToggle={onToggle} />);

      const list = await openDropdown(user);
      onToggle.mockClear();
      const tabEvent = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });
      act(() => {
        screen.getAllByRole('menuitem')[0].dispatchEvent(tabEvent);
      });

      expect(list).toBeInTheDocument();
      expect(onToggle).toHaveBeenCalledTimes(1);
      expect(tabEvent.defaultPrevented).toBe(true);
    });

    test('click away (outside anchor and menu) calls toggleIsOpen', async () => {
      const user = userEvent.setup();
      const onToggle = vi.fn();
      render(<Harness onToggle={onToggle} />);

      await openDropdown(user);
      onToggle.mockClear();
      await user.click(screen.getByRole('button', { name: 'outside' }));

      expect(onToggle).toHaveBeenCalledTimes(1);
      await waitForMenuGone();
    });

    test('click on the anchor is ignored by click-away (anchor own onClick toggles once)', async () => {
      const user = userEvent.setup();
      const onToggle = vi.fn();
      render(<Harness onToggle={onToggle} />);

      await openDropdown(user);
      onToggle.mockClear();
      await user.click(screen.getByRole('button', { name: 'anchor' }));

      expect(onToggle).toHaveBeenCalledTimes(1);
      await waitForMenuGone();
    });

    test('without anchorEl: click away still toggles, menu stays in body', async () => {
      const onToggle = vi.fn();
      render(<Harness onToggle={onToggle} withAnchor={false} initialOpen />);

      await screen.findByRole('menu');
      // ClickAwayListener activates after a 0ms timeout on mount
      await act(() => new Promise((resolve) => setTimeout(resolve, 0)));
      fireEvent.click(document.body);

      expect(onToggle).toHaveBeenCalledTimes(1);
    });

    test('click inside the menu (not on an item action) does not trigger click-away', async () => {
      const user = userEvent.setup();
      const onToggle = vi.fn();
      render(<Harness onToggle={onToggle} />);

      const list = await openDropdown(user);
      onToggle.mockClear();
      await user.click(list);

      expect(onToggle).not.toHaveBeenCalled();
    });
  });

  describe('item activation', () => {
    test('click -> item.onClick then toggleIsOpen (hideOnItemClick default true)', async () => {
      const user = userEvent.setup();
      const onToggle = vi.fn();
      const onOne = vi.fn();
      render(<Harness onToggle={onToggle} items={[{ title: 'One', onClick: onOne }]} />);

      await openDropdown(user);
      onToggle.mockClear();
      await user.click(screen.getByRole('menuitem', { name: 'One' }));

      expect(onOne).toHaveBeenCalledTimes(1);
      expect(onToggle).toHaveBeenCalledTimes(1);
      expect(onOne.mock.invocationCallOrder[0]).toBeLessThan(onToggle.mock.invocationCallOrder[0]);
      await waitForMenuGone();
    });

    test('hideOnItemClick={false}: item.onClick fires, menu stays open', async () => {
      const user = userEvent.setup();
      const onToggle = vi.fn();
      const onOne = vi.fn();
      render(<Harness onToggle={onToggle} hideOnItemClick={false} items={[{ title: 'One', onClick: onOne }]} />);

      await openDropdown(user);
      onToggle.mockClear();
      await user.click(screen.getByRole('menuitem', { name: 'One' }));

      expect(onOne).toHaveBeenCalledTimes(1);
      expect(onToggle).not.toHaveBeenCalled();
      expect(screen.getByRole('menu')).toBeInTheDocument();
    });

    test('item without onClick still toggles', async () => {
      const user = userEvent.setup();
      const onToggle = vi.fn();
      render(<Harness onToggle={onToggle} items={[{ title: 'One' }]} />);

      await openDropdown(user);
      onToggle.mockClear();
      await user.click(screen.getByRole('menuitem', { name: 'One' }));

      expect(onToggle).toHaveBeenCalledTimes(1);
    });

    test('Enter on the focused item activates it (MUI keyboard -> onClick)', async () => {
      const user = userEvent.setup();
      const onOne = vi.fn();
      render(<Harness items={[{ title: 'One', onClick: onOne }]} />);

      await openDropdown(user);
      await waitFor(() => expect(screen.getByRole('menuitem', { name: 'One' })).toHaveFocus());
      await user.keyboard('{Enter}');

      expect(onOne).toHaveBeenCalledTimes(1);
    });
  });

  describe('overlay stacking (OverlayStackingService)', () => {
    test('open registers a popover slot and applies its z-index to the popper; close releases it', async () => {
      const user = userEvent.setup();
      render(<Harness />);

      await openDropdown(user);
      expect(getPopper().style.zIndex).toBe(String(OVERLAY_BASE_Z_INDEX + 1));
      expect(OverlayStackingService.getTopmostZIndex('popover')).toBe(OVERLAY_BASE_Z_INDEX + 1);

      await user.keyboard('{Escape}');
      expect(OverlayStackingService.getTopmostZIndex()).toBe(OVERLAY_BASE_Z_INDEX);
    });

    test('stacks above a modal that raised the stacking floor', async () => {
      const user = userEvent.setup();
      const modalZ = OverlayStackingService.register('host-modal', 'modal', 5000);
      render(<Harness />);

      await openDropdown(user);

      expect(Number(getPopper().style.zIndex)).toBeGreaterThan(modalZ);
    });

    test('unmount while open releases the slot and leaves no popper in body', async () => {
      const user = userEvent.setup();
      const { unmount } = render(<Harness />);

      await openDropdown(user);
      unmount();

      expect(document.querySelector(POPPER)).toBeNull();
      expect(OverlayStackingService.register('after', 'modal')).toBe(OVERLAY_BASE_Z_INDEX + 1);
    });
  });
});
