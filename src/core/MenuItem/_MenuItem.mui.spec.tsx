/**
 * MUI contract (characterization) spec for MenuItem (MUI MenuItem / ButtonBase).
 *
 * Locks CURRENT behaviour on MUI v5.16 so the MUI v6/v7/v9 bumps go red where MUI changed behaviour.
 * Do not edit these assertions to make a bump pass; see agentic-plans/mui-upgrade-plan.md "TDD contract".
 *
 * v9 notes this file is designed to catch:
 * - MenuItem rendered outside Menu/MenuList throws (Vanguard stories now provide the required MenuList).
 * - Enter/Space: click bubbles and onClick receives a MouseEvent; disabled non-native elements run no handlers.
 *
 * MUI classes asserted only where production depends on them: `.MuiMenuItem-root` (Select.module.scss:4,
 * SearchableSelect.scss:96), `Mui-selected` (Select.module.scss:5, SearchableSelect.scss:111).
 * Tags: `[bug-lock]` / `[v5-quirk]` = baseline characterization, not a promised contract.
 */
import '@testing-library/jest-dom/vitest';

import { MenuList } from '@mui/material';
import userEvent from '@testing-library/user-event';
import { IconNames } from '@vanguard/Icon/IconNames';
import { MenuItem } from '@vanguard/MenuItem/MenuItem';
import { TextTypes } from '@vanguard/Text/Text';
import React from 'react';
import { describe, expect, test, vi } from 'vitest';

import { fireEvent, render, screen } from '../../../test-utils/test-utils';

// Everything except the explicit standalone block renders inside a MUI MenuList, so the v9 "throws outside
// Menu/MenuList" change only reds the standalone tests and not every content/state assertion.
const renderInList = (ui: React.ReactElement) => render(<MenuList>{ui}</MenuList>);

describe('MenuItem (MUI MenuItem) contract', () => {
  describe('standalone render (outside Menu/MenuList; v9 throws)', () => {
    // User-approved v9 requirement: standalone throws; the supported MenuList path retains content and activation.
    test('standalone rendering requires Menu or MenuList context', () => {
      // User-approved v9 break: MenuItem/MenuItem.mjs:188 and MenuList/MenuListContext.mjs:16.
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
      try {
        expect(() => render(<MenuItem testId={'solo'}>{'Solo'}</MenuItem>)).toThrow('MenuListContext is missing');
      } finally {
        errorSpy.mockRestore();
      }
    });

    test('inside MenuList the item renders its li role and click callback', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
      try {
        renderInList(<MenuItem testId={'solo'} onClick={onClick}>{'Solo'}</MenuItem>);
        const item = screen.getByTestId('solo');
        expect(item.tagName).toBe('LI');
        expect(item).toHaveAttribute('role', 'menuitem');
        expect(item).toHaveAttribute('tabindex', '0');
        expect(item).toHaveClass('MuiMenuItem-root');
        expect(screen.getByRole('menuitem', { name: 'Solo' })).toBe(item);
        expect(errorSpy).not.toHaveBeenCalled();
        await user.click(item);
        expect(onClick).toHaveBeenCalledTimes(1);
        expect(onClick.mock.calls[0][0].type).toBe('click');
      } finally {
        errorSpy.mockRestore();
      }
    });
  });

  describe('content', () => {
    test('string children are wrapped in a <Text> with the default text type', () => {
      renderInList(<MenuItem>{'Label'}</MenuItem>);

      const label = screen.getByText('Label');
      expect(label.tagName).toBe('SPAN');
      expect(label).toHaveClass('rc-text', 'text');
    });

    test('textType is forwarded to the <Text>', () => {
      renderInList(<MenuItem textType={TextTypes.textCaption}>{'Caption'}</MenuItem>);

      expect(screen.getByText('Caption')).toHaveClass('text-caption');
    });

    test('non-string children are rendered as-is (no Text wrapper)', () => {
      renderInList(
        <MenuItem>
          <strong data-testid={'node'}>{'Node'}</strong>
        </MenuItem>,
      );

      expect(screen.getByTestId('node').parentElement).toBe(screen.getByRole('menuitem'));
    });

    test('icon before: flex wrapper with justify-content flex-start, icon precedes text', async () => {
      renderInList(
        <MenuItem icon={IconNames.edit} iconProps={{ testId: 'icon' }}>
          {'Edit'}
        </MenuItem>,
      );

      const icon = await screen.findByTestId('icon');
      const wrapper = icon.parentElement as HTMLElement;
      expect(wrapper.tagName).toBe('DIV');
      expect(wrapper.style.display).toBe('flex');
      expect(wrapper.style.justifyContent).toBe('flex-start');
      expect(wrapper.style.gap).toBe('8px');
      expect(wrapper.firstElementChild).toBe(icon);
      expect(wrapper.lastElementChild).toBe(screen.getByText('Edit'));
    });

    test('icon after: justify-content space-between, icon follows text', async () => {
      renderInList(
        <MenuItem icon={IconNames.edit} iconPosition={'after'} iconProps={{ testId: 'icon' }}>
          {'Edit'}
        </MenuItem>,
      );

      const icon = await screen.findByTestId('icon');
      const wrapper = icon.parentElement as HTMLElement;
      expect(wrapper.style.justifyContent).toBe('space-between');
      expect(wrapper.firstElementChild).toBe(screen.getByText('Edit'));
      expect(wrapper.lastElementChild).toBe(icon);
    });

    test('useActiveIcon loads the "-active" icon variant', async () => {
      renderInList(
        <MenuItem icon={IconNames.document} useActiveIcon iconProps={{ testId: 'icon' }}>
          {'Doc'}
        </MenuItem>,
      );

      expect(await screen.findByTestId('icon')).toBeInTheDocument();
    });
  });

  describe('state props', () => {
    test('selected -> Mui-selected class; no aria-selected attribute', () => {
      renderInList(<MenuItem selected>{'Sel'}</MenuItem>);

      const item = screen.getByRole('menuitem');
      expect(item).toHaveClass('Mui-selected');
      expect(item).not.toHaveAttribute('aria-selected');
    });

    test('disabled -> aria-disabled="true", tabindex -1, pointer-events none', () => {
      renderInList(<MenuItem disabled>{'Dis'}</MenuItem>);

      const item = screen.getByRole('menuitem');
      expect(item).toHaveAttribute('aria-disabled', 'true');
      expect(item).toHaveAttribute('tabindex', '-1');
      expect(getComputedStyle(item).pointerEvents).toBe('none');
    });

    // MUI9 ButtonBase suppresses disabled non-native activation.
    // The prior v5 quirk and its expected migration RED are retained in the evidence.
    test("[v5-quirk] disabled items ignore dispatched clicks (v9)", () => {
      // Baseline characterization: not a promised contract.
      const onClick = vi.fn();
      renderInList(
        <MenuItem disabled onClick={onClick}>
          {'Dis'}
        </MenuItem>,
      );

      fireEvent.click(screen.getByRole('menuitem'));

      expect(onClick).not.toHaveBeenCalled();
    });

    test('default item: 6px vertical / 16px horizontal padding, no divider border', () => {
      renderInList(<MenuItem>{'Plain'}</MenuItem>);

      const style = getComputedStyle(screen.getByRole('menuitem'));
      expect(style.paddingTop).toBe('6px');
      expect(style.paddingLeft).toBe('16px');
      expect(style.paddingRight).toBe('16px');
      expect(style.borderBottomStyle).not.toBe('solid');
    });

    test('dense / divider / disableGutters change padding and add a bottom border', () => {
      renderInList(
        <MenuItem dense divider disableGutters>
          {'Flags'}
        </MenuItem>,
      );

      const style = getComputedStyle(screen.getByRole('menuitem'));
      expect(style.paddingTop).toBe('4px');
      expect(style.paddingBottom).toBe('4px');
      expect(style.paddingLeft).toBe('0px');
      expect(style.paddingRight).toBe('0px');
      expect(style.borderBottomWidth).toBe('1px');
      expect(style.borderBottomStyle).toBe('solid');
    });

    test('className and testId are forwarded to the <li>', () => {
      renderInList(
        <MenuItem className={'my-item'} testId={'item-id'}>
          {'X'}
        </MenuItem>,
      );

      expect(screen.getByTestId('item-id')).toHaveClass('my-item', 'MuiMenuItem-root');
    });

    test('explicit tabIndex and role are forwarded', () => {
      renderInList(
        <MenuItem tabIndex={0} role={'option'}>
          {'X'}
        </MenuItem>,
      );

      const item = screen.getByRole('option');
      expect(item).toHaveAttribute('tabindex', '0');
    });

    test('ref (React 19 ref-as-prop) reaches the <li>', () => {
      const ref = React.createRef<HTMLLIElement>();
      renderInList(<MenuItem ref={ref}>{'X'}</MenuItem>);

      expect(ref.current).toBe(screen.getByRole('menuitem'));
    });
  });

  describe('keyboard activation inside MenuList', () => {
    const setup = () => {
      const onClick = vi.fn();
      const onAncestorClick = vi.fn();
      const user = userEvent.setup();
      render(
        <div onClick={onAncestorClick}>
          <MenuList autoFocusItem>
            <MenuItem onClick={onClick}>{'First'}</MenuItem>
            <MenuItem>{'Second'}</MenuItem>
          </MenuList>
        </div>,
      );
      return { user, onClick, onAncestorClick };
    };

    test('autoFocusItem focuses the first item, which owns tabindex 0', () => {
      setup();

      const [first, second] = screen.getAllByRole('menuitem');
      expect(first).toHaveFocus();
      expect(first).toHaveAttribute('tabindex', '0');
      expect(second).toHaveAttribute('tabindex', '-1');
    });

    test('Enter activates the focused item (onClick called once)', async () => {
      const { user, onClick } = setup();

      await user.keyboard('{Enter}');

      expect(onClick).toHaveBeenCalledTimes(1);
    });

    // MUI v5 ButtonBase calls onClick directly from keydown; v9 dispatches a click (MouseEvent) that bubbles.
    test("[v5-quirk] Enter delivers a click MouseEvent and bubbles to ancestors (v9)", async () => {
      // Baseline characterization: not a promised contract.
      const { user, onClick, onAncestorClick } = setup();

      await user.keyboard('{Enter}');

      expect(onClick.mock.calls[0][0].type).toBe('click');
      expect(onClick.mock.calls[0][0].nativeEvent).toBeInstanceOf(MouseEvent);
      expect(onAncestorClick).toHaveBeenCalledTimes(1);
    });

    test('Space activates the focused item (onClick called once)', async () => {
      const { user, onClick } = setup();

      await user.keyboard(' ');

      expect(onClick).toHaveBeenCalledTimes(1);
    });

    // MUI v5 ButtonBase calls onClick directly from keyup; v9 dispatches a click (MouseEvent) that bubbles.
    test("[v5-quirk] Space delivers a click MouseEvent and bubbles to ancestors (v9)", async () => {
      // Baseline characterization: not a promised contract.
      const { user, onClick, onAncestorClick } = setup();

      await user.keyboard(' ');

      expect(onClick.mock.calls[0][0].type).toBe('click');
      expect(onClick.mock.calls[0][0].nativeEvent).toBeInstanceOf(MouseEvent);
      expect(onAncestorClick).toHaveBeenCalledTimes(1);
    });

    test('Enter on a disabled item does not call onClick', () => {
      const onClick = vi.fn();
      render(
        <MenuList>
          <MenuItem disabled onClick={onClick}>
            {'Dis'}
          </MenuItem>
        </MenuList>,
      );

      fireEvent.keyDown(screen.getByRole('menuitem'), { key: 'Enter' });

      expect(onClick).not.toHaveBeenCalled();
    });

    test('mouse click bubbles to ancestors', async () => {
      const { user, onClick, onAncestorClick } = setup();

      await user.click(screen.getByRole('menuitem', { name: 'First' }));

      expect(onClick).toHaveBeenCalledTimes(1);
      expect(onAncestorClick).toHaveBeenCalledTimes(1);
    });
  });
});
