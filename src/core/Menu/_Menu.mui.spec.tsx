/**
 * MUI contract (characterization) spec for Menu (MUI Menu -> Popover -> Modal + MenuList).
 *
 * Locks CURRENT behaviour on MUI v5.16 so the MUI v6/v7/v9 bumps go red where MUI changed behaviour.
 * Do not edit these assertions to make a bump pass; see agentic-plans/mui-upgrade-plan.md "TDD contract".
 *
 * MUI class names asserted/queried only where Vanguard production depends on them (red after a bump = signal):
 * - `.MuiMenu-root` (root-components.scss:64), `.MuiMenu-paper` (SearchableSelect.scss:45), `.MuiMenu-list`
 *   (Menu.module.scss:2, SearchableSelect.scss:50), `.MuiPaper-root` (Select.module.scss:2, root-components.scss:64),
 *   `.MuiList-root` (Select.module.scss:3), `.MuiMenuItem-root` (Select.module.scss:4, SearchableSelect.scss:96).
 * - `.MuiBackdrop-root` is a LOCATOR only (no production dependency): the backdrop has no role/testid.
 * Tags: `[bug-lock]` / `[v5-quirk]` = baseline characterization, not a promised contract.
 */
import '@testing-library/jest-dom/vitest';

import userEvent from '@testing-library/user-event';
import { Menu, MenuItemConfig, MenuProps } from '@vanguard/Menu/Menu';
import { MenuItem } from '@vanguard/MenuItem/MenuItem';
import { OVERLAY_BASE_Z_INDEX, OverlayStackingService } from '@vanguard/OverlayStacking/OverlayStackingService';
import React, { useState } from 'react';
import { afterEach, describe, expect, test, vi } from 'vitest';

import { render, screen, waitFor } from '../../../test-utils/test-utils';
import styles from './Menu.module.scss';

const items: MenuItemConfig[] = [
  { key: 'alpha', children: 'Alpha' },
  { key: 'beta', children: 'Beta', disabled: true },
  { key: 'gamma', children: 'Gamma' },
  { key: 'delta', children: 'Delta' },
];

type HarnessProps = Partial<MenuProps> & {
  onCloseSpy?: (event: unknown, reason: string) => void;
  onAncestorClick?: () => void;
};

const Harness = ({ onCloseSpy, onAncestorClick, ...menuProps }: HarnessProps) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  return (
    <div onClick={onAncestorClick}>
      <button onClick={(e) => setAnchorEl(e.currentTarget)}>{'open menu'}</button>
      <button>{'outside'}</button>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={(event, reason) => {
          onCloseSpy?.(event, reason);
          setAnchorEl(null);
        }}
        items={items}
        {...menuProps}
      />
    </div>
  );
};

const openMenu = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(screen.getByRole('button', { name: 'open menu' }));
  return screen.findByRole('menu');
};

const getItems = () => screen.getAllByRole('menuitem');
const tabIndexes = () => getItems().map((el) => el.getAttribute('tabindex'));
// DOM query (not role): during the exit transition MUI aria-hides the root, which hides it from role queries
const waitForMenuGone = () => waitFor(() => expect(document.querySelector('.MuiMenu-root')).toBeNull());

describe('Menu (MUI Menu) contract', () => {
  afterEach(() => {
    OverlayStackingService.__resetForTests();
    vi.restoreAllMocks();
  });

  describe('render and structure', () => {
    test('closed: nothing is portaled to body (no keepMounted)', () => {
      render(<Harness />);

      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
      expect(document.querySelector('.MuiMenu-root')).toBeNull();
    });

    test('open: root is a role="presentation" element portaled to body with the module + MuiMenu-root classes', async () => {
      const user = userEvent.setup();
      const { container } = render(<Harness testId={'my-menu'} />);

      await openMenu(user);

      const root = screen.getByTestId('my-menu');
      expect(root.parentElement).toBe(document.body);
      expect(container.contains(root)).toBe(false);
      expect(root).toHaveAttribute('role', 'presentation');
      expect(root).toHaveClass('MuiMenu-root', styles.menu);
    });

    test('open: the menu list sits inside the .MuiMenu-paper / .MuiPaper-root surface', async () => {
      const user = userEvent.setup();
      render(<Harness testId={'my-menu'} />);

      const list = await openMenu(user);

      const paper = screen.getByTestId('my-menu').querySelector('.MuiMenu-paper') as HTMLElement;
      expect(paper).toHaveClass('MuiPaper-root');
      expect(paper).toContainElement(list);
    });

    test('open: list is a <ul role="menu"> with .MuiList-root and .MuiMenu-list', async () => {
      const user = userEvent.setup();
      render(<Harness />);

      const list = await openMenu(user);

      expect(list.tagName).toBe('UL');
      expect(list).toHaveClass('MuiList-root', 'MuiMenu-list');
    });

    test('open: items render in order as <li role="menuitem" class="MuiMenuItem-root">', async () => {
      const user = userEvent.setup();
      render(<Harness />);

      await openMenu(user);

      expect(getItems().map((el) => el.textContent)).toEqual(['Alpha', 'Beta', 'Gamma', 'Delta']);
      getItems().forEach((el) => {
        expect(el.tagName).toBe('LI');
        expect(el).toHaveClass('MuiMenuItem-root');
      });
    });

    // MUI v5 Backdrop sets aria-hidden itself; v9 drops it. Vanguard does not rely on it (no production hit).
    test('[v5-quirk] open: the backdrop element carries aria-hidden="true"', async () => {
      const user = userEvent.setup();
      // Baseline characterization: not a promised contract.
      render(<Harness testId={'my-menu'} />);

      await openMenu(user);

      const backdrop = screen.getByTestId('my-menu').querySelector('.MuiBackdrop-root') as HTMLElement;
      expect(backdrop).toHaveAttribute('aria-hidden', 'true');
    });

    test('open: the rest of the app is hidden from assistive tech (aria-hidden on app siblings)', async () => {
      const user = userEvent.setup();
      const { container } = render(<Harness testId={'my-menu'} />);

      await openMenu(user);

      expect(container).toHaveAttribute('aria-hidden', 'true');
    });

    test('focus is trapped: focusing an element outside the open menu pulls focus back into the menu', async () => {
      const user = userEvent.setup();
      render(<Harness testId={'my-menu'} />);

      await openMenu(user);
      const outside = screen.getByRole('button', { name: 'outside', hidden: true });
      outside.focus();

      await waitFor(() =>
        expect(screen.getByTestId('my-menu')).toContainElement(document.activeElement as HTMLElement),
      );
      expect(outside).not.toHaveFocus();
    });

    test('Shift+Tab also closes the menu (tabKeyDown) and focus returns to the anchor', async () => {
      const user = userEvent.setup();
      const onCloseSpy = vi.fn();
      render(<Harness onCloseSpy={onCloseSpy} />);

      await openMenu(user);
      await user.tab({ shift: true });

      expect(onCloseSpy).toHaveBeenCalledTimes(1);
      expect(onCloseSpy.mock.calls[0][1]).toBe('tabKeyDown');
      await waitForMenuGone();
      expect(screen.getByRole('button', { name: 'open menu' })).toHaveFocus();
    });

    test('children are rendered when items is not given', async () => {
      const user = userEvent.setup();
      render(
        <Harness items={undefined}>
          <MenuItem>{'Child one'}</MenuItem>
          <MenuItem>{'Child two'}</MenuItem>
        </Harness>,
      );

      await openMenu(user);

      expect(getItems().map((el) => el.textContent)).toEqual(['Child one', 'Child two']);
    });

    test('items without `key` fall back to the index key (no React key warning)', async () => {
      const user = userEvent.setup();
      const errorSpy = vi.spyOn(console, 'error');
      render(<Harness items={[{ children: 'No key 1' }, { children: 'No key 2' }]} />);

      await openMenu(user);

      expect(getItems().map((el) => el.textContent)).toEqual(['No key 1', 'No key 2']);
      expect(errorSpy.mock.calls.some((args) => String(args[0]).includes('unique "key"'))).toBe(false);
    });

    test('items win over children when both are given', async () => {
      const user = userEvent.setup();
      render(
        <Harness>
          <MenuItem>{'ignored child'}</MenuItem>
        </Harness>,
      );

      await openMenu(user);

      expect(screen.queryByText('ignored child')).not.toBeInTheDocument();
      expect(getItems()).toHaveLength(4);
    });

    // CURRENT BEHAVIOUR (suspected bug): Menu sets `className={styles.menu}` after spreading rest, so a caller
    // className is silently dropped.
    test('[bug-lock] caller className is dropped; only the module class is applied to the root', async () => {
      const user = userEvent.setup();
      // Baseline characterization: not a promised contract.
      render(<Harness testId={'my-menu'} className={'caller-class'} />);

      await openMenu(user);

      const root = screen.getByTestId('my-menu');
      expect(root).toHaveClass(styles.menu);
      expect(root).not.toHaveClass('caller-class');
    });

    test('ref (React 19 ref-as-prop) is forwarded through rest to the MUI root element', async () => {
      const user = userEvent.setup();
      const ref = React.createRef<HTMLDivElement>();
      render(<Harness testId={'my-menu'} ref={ref} />);

      await openMenu(user);

      expect(ref.current).toBe(screen.getByTestId('my-menu'));
    });
  });

  describe('sizing via slotProps.paper', () => {
    test('width/height/maxWidth/maxHeight land inline on the paper', async () => {
      const user = userEvent.setup();
      render(<Harness testId={'my-menu'} width={300} height={200} maxWidth={'50vw'} maxHeight={150} />);

      await openMenu(user);

      const paper = screen.getByTestId('my-menu').querySelector('.MuiMenu-paper') as HTMLElement;
      expect(paper.style.width).toBe('300px');
      expect(paper.style.height).toBe('200px');
      expect(paper.style.maxWidth).toBe('50vw');
      expect(paper.style.maxHeight).toBe('150px');
    });

    test('no size props: paper has no inline width/height', async () => {
      const user = userEvent.setup();
      render(<Harness testId={'my-menu'} />);

      await openMenu(user);

      const paper = screen.getByTestId('my-menu').querySelector('.MuiMenu-paper') as HTMLElement;
      expect(paper.style.width).toBe('');
      expect(paper.style.height).toBe('');
    });

    // CURRENT BEHAVIOUR (suspected bug): the merged paper style is spread first and then `...rest.slotProps.paper`
    // overwrites `style`, so caller paper.style replaces the size props instead of merging with them.
    test('[bug-lock] caller slotProps.paper.style replaces the size style (no merge)', async () => {
      const user = userEvent.setup();
      // Baseline characterization: not a promised contract.
      render(
        <Harness
          testId={'my-menu'}
          width={300}
          slotProps={{ paper: { style: { color: 'red' }, className: 'caller-paper' } }}
        />,
      );

      await openMenu(user);

      const paper = screen.getByTestId('my-menu').querySelector('.MuiMenu-paper') as HTMLElement;
      expect(paper.style.color).toBe('red');
      expect(paper.style.width).toBe('');
      expect(paper).toHaveClass('caller-paper');
    });

    test('caller slotProps.paper without size props is passed through', async () => {
      const user = userEvent.setup();
      render(<Harness testId={'my-menu'} slotProps={{ paper: { className: 'caller-paper' } }} />);

      await openMenu(user);

      expect(screen.getByTestId('my-menu').querySelector('.MuiMenu-paper')).toHaveClass('caller-paper');
    });

    test('legacy MenuListProps (v9 -> slotProps.list) reach the list', async () => {
      const user = userEvent.setup();
      render(<Harness MenuListProps={{ className: 'legacy-list' }} />);

      const list = await openMenu(user);

      expect(list).toHaveClass('legacy-list');
    });

    test('legacy PaperProps (v9 -> slotProps.paper) reach the paper when slotProps.paper is absent', async () => {
      const user = userEvent.setup();
      render(<Harness testId={'my-menu'} PaperProps={{ className: 'legacy-paper' }} />);

      await openMenu(user);

      expect(screen.getByTestId('my-menu').querySelector('.MuiMenu-paper')).toHaveClass('legacy-paper');
    });
  });

  describe('overlay stacking (OverlayStackingService)', () => {
    test('open registers a popover slot whose z-index lands inline on the root; close releases it', async () => {
      const user = userEvent.setup();
      render(<Harness testId={'my-menu'} />);

      await openMenu(user);
      expect(screen.getByTestId('my-menu').style.zIndex).toBe(String(OVERLAY_BASE_Z_INDEX + 1));
      expect(OverlayStackingService.getTopmostZIndex('popover')).toBe(OVERLAY_BASE_Z_INDEX + 1);

      await user.keyboard('{Escape}');
      expect(OverlayStackingService.getTopmostZIndex()).toBe(OVERLAY_BASE_Z_INDEX);
    });

    test('caller slotProps.root style is merged with the z-index override', async () => {
      const user = userEvent.setup();
      render(<Harness testId={'my-menu'} slotProps={{ root: { style: { color: 'red', zIndex: 1 } } }} />);

      await openMenu(user);

      const root = screen.getByTestId('my-menu');
      expect(root.style.color).toBe('red');
      expect(root.style.zIndex).toBe(String(OVERLAY_BASE_Z_INDEX + 1));
    });

    test('stacks above a modal that raised the stacking floor', async () => {
      const user = userEvent.setup();
      const modalZ = OverlayStackingService.register('host-modal', 'modal', 5000);
      render(<Harness testId={'my-menu'} />);

      await openMenu(user);

      expect(Number(screen.getByTestId('my-menu').style.zIndex)).toBeGreaterThan(modalZ);
    });

    test('unmount while open releases the slot and leaves no portal nodes in body', async () => {
      const user = userEvent.setup();
      const { unmount } = render(<Harness testId={'my-menu'} />);

      await openMenu(user);
      unmount();

      expect(document.querySelector('.MuiMenu-root')).toBeNull();
      expect(document.querySelector('[role="menu"]')).toBeNull();
      // only RTL's (now empty) container remains in body
      expect([...document.body.children].every((child) => child.childElementCount === 0)).toBe(true);
      expect(OverlayStackingService.register('after', 'modal')).toBe(OVERLAY_BASE_Z_INDEX + 1);
    });
  });

  describe('close triggers and onClose reason', () => {
    test('Escape -> onClose(event, "escapeKeyDown") and the menu unmounts after the transition', async () => {
      const user = userEvent.setup();
      const onCloseSpy = vi.fn();
      render(<Harness onCloseSpy={onCloseSpy} />);

      await openMenu(user);
      await user.keyboard('{Escape}');

      expect(onCloseSpy).toHaveBeenCalledTimes(1);
      expect(onCloseSpy.mock.calls[0][1]).toBe('escapeKeyDown');
      expect((onCloseSpy.mock.calls[0][0] as KeyboardEvent).type).toBe('keydown');
      await waitForMenuGone();
    });

    test('backdrop click -> onClose(event, "backdropClick")', async () => {
      const user = userEvent.setup();
      const onCloseSpy = vi.fn();
      render(<Harness testId={'my-menu'} onCloseSpy={onCloseSpy} />);

      await openMenu(user);
      await user.click(screen.getByTestId('my-menu').querySelector('.MuiBackdrop-root') as HTMLElement);

      expect(onCloseSpy).toHaveBeenCalledTimes(1);
      expect(onCloseSpy.mock.calls[0][1]).toBe('backdropClick');
      await waitForMenuGone();
    });

    test('Tab -> onClose(event, "tabKeyDown") with default prevented', async () => {
      const user = userEvent.setup();
      const onCloseSpy = vi.fn();
      render(<Harness onCloseSpy={onCloseSpy} />);

      await openMenu(user);
      await user.tab();

      expect(onCloseSpy).toHaveBeenCalledTimes(1);
      expect(onCloseSpy.mock.calls[0][1]).toBe('tabKeyDown');
      expect((onCloseSpy.mock.calls[0][0] as KeyboardEvent).defaultPrevented).toBe(true);
    });

    test('clicking an item does NOT close the menu by itself', async () => {
      const user = userEvent.setup();
      const onCloseSpy = vi.fn();
      render(<Harness onCloseSpy={onCloseSpy} />);

      await openMenu(user);
      await user.click(screen.getByRole('menuitem', { name: 'Alpha' }));

      expect(onCloseSpy).not.toHaveBeenCalled();
      expect(screen.getByRole('menu')).toBeInTheDocument();
    });
  });

  describe('focus', () => {
    test('on open the first enabled item receives focus', async () => {
      const user = userEvent.setup();
      render(<Harness />);

      await openMenu(user);

      const alpha = screen.getByRole('menuitem', { name: 'Alpha' });
      await waitFor(() => expect(alpha).toHaveFocus());
    });

    test('on open the (last) selected item receives focus instead of the first', async () => {
      const user = userEvent.setup();
      render(
        <Harness
          items={[
            { key: 'a', children: 'Alpha' },
            { key: 'g', children: 'Gamma', selected: true },
            { key: 'd', children: 'Delta' },
          ]}
        />,
      );

      await openMenu(user);

      await waitFor(() => expect(screen.getByRole('menuitem', { name: 'Gamma' })).toHaveFocus());
    });

    test('variant="menu" ignores selected and focuses the first item', async () => {
      const user = userEvent.setup();
      render(
        <Harness
          variant={'menu'}
          items={[
            { key: 'a', children: 'Alpha' },
            { key: 'g', children: 'Gamma', selected: true },
          ]}
        />,
      );

      await openMenu(user);

      await waitFor(() => expect(screen.getByRole('menuitem', { name: 'Alpha' })).toHaveFocus());
    });

    test('autoFocus={false}: no menu item receives focus on open', async () => {
      const user = userEvent.setup();
      render(<Harness autoFocus={false} />);

      await openMenu(user);

      expect(getItems().some((el) => el === document.activeElement)).toBe(false);
    });

    test('on close focus returns to the anchor', async () => {
      const user = userEvent.setup();
      render(<Harness />);

      await openMenu(user);
      await user.keyboard('{Escape}');
      await waitForMenuGone();

      expect(screen.getByRole('button', { name: 'open menu' })).toHaveFocus();
    });
  });

  describe('tabindex (v9 switches to roving tabindex)', () => {
    test('list has tabindex -1; first item 0, others -1 on open', async () => {
      const user = userEvent.setup();
      render(<Harness />);

      const list = await openMenu(user);

      expect(list).toHaveAttribute('tabindex', '-1');
      expect(tabIndexes()).toEqual(['0', '-1', '-1', '-1']);
    });

    test('selected item owns tabindex 0', async () => {
      const user = userEvent.setup();
      render(
        <Harness
          items={[
            { key: 'a', children: 'Alpha' },
            { key: 'g', children: 'Gamma', selected: true },
          ]}
        />,
      );

      await openMenu(user);

      expect(tabIndexes()).toEqual(['-1', '0']);
    });

    // MUI v5 MenuList: tabindex 0 stays on the initially active item; v9 moves it with focus (roving tabindex).
    test("[v5-quirk] tabindex follows focused items while arrowing (v9)", async () => {
      const user = userEvent.setup();
      // Baseline characterization: not a promised contract.
      render(<Harness />);

      await openMenu(user);
      await user.keyboard('{ArrowDown}');

      expect(screen.getByRole('menuitem', { name: 'Gamma' })).toHaveFocus();
      expect(tabIndexes()).toEqual(['-1', '-1', '0', '-1']);
    });
  });

  describe('MenuList keyboard navigation', () => {
    test('ArrowDown skips disabled items', async () => {
      const user = userEvent.setup();
      render(<Harness />);

      await openMenu(user);
      await user.keyboard('{ArrowDown}');

      expect(screen.getByRole('menuitem', { name: 'Gamma' })).toHaveFocus();
    });

    test('ArrowUp from the first item wraps to the last', async () => {
      const user = userEvent.setup();
      render(<Harness />);

      await openMenu(user);
      await user.keyboard('{ArrowUp}');

      expect(screen.getByRole('menuitem', { name: 'Delta' })).toHaveFocus();
    });

    test('ArrowDown from the last item wraps to the first', async () => {
      const user = userEvent.setup();
      render(<Harness />);

      await openMenu(user);
      await user.keyboard('{End}{ArrowDown}');

      expect(screen.getByRole('menuitem', { name: 'Alpha' })).toHaveFocus();
    });

    test('End -> last, Home -> first', async () => {
      const user = userEvent.setup();
      render(<Harness />);

      await openMenu(user);
      await user.keyboard('{End}');
      expect(screen.getByRole('menuitem', { name: 'Delta' })).toHaveFocus();
      await user.keyboard('{Home}');
      expect(screen.getByRole('menuitem', { name: 'Alpha' })).toHaveFocus();
    });

    test('typeahead moves focus to the next item starting with the typed character', async () => {
      const user = userEvent.setup();
      render(<Harness />);

      await openMenu(user);
      await user.keyboard('d');
      expect(screen.getByRole('menuitem', { name: 'Delta' })).toHaveFocus();
    });

    test('typeahead keys typed in quick succession are combined into one search string', async () => {
      const user = userEvent.setup();
      render(<Harness />);

      await openMenu(user);
      await user.keyboard('de');
      expect(screen.getByRole('menuitem', { name: 'Delta' })).toHaveFocus();
      // "deg" matches nothing -> focus stays
      await user.keyboard('g');
      expect(screen.getByRole('menuitem', { name: 'Delta' })).toHaveFocus();
    });

    test('typeahead does not land on disabled items', async () => {
      const user = userEvent.setup();
      render(<Harness />);

      await openMenu(user);
      await user.keyboard('b');

      expect(screen.getByRole('menuitem', { name: 'Alpha' })).toHaveFocus();
    });
  });

  describe('item activation (v9: onClick gets MouseEvent for keyboard + click bubbles)', () => {
    const setup = () => {
      const onAlpha = vi.fn();
      const onAncestorClick = vi.fn();
      const user = userEvent.setup();
      render(
        <Harness
          onAncestorClick={onAncestorClick}
          items={[
            { key: 'a', children: 'Alpha', onClick: onAlpha },
            { key: 'b', children: 'Beta' },
          ]}
        />,
      );
      return { user, onAlpha, onAncestorClick };
    };

    test('mouse click -> onClick(click event) and the click bubbles to React ancestors through the portal', async () => {
      const { user, onAlpha, onAncestorClick } = setup();
      await openMenu(user);
      onAncestorClick.mockClear();

      await user.click(screen.getByRole('menuitem', { name: 'Alpha' }));

      expect(onAlpha).toHaveBeenCalledTimes(1);
      expect(onAlpha.mock.calls[0][0].type).toBe('click');
      expect(onAncestorClick).toHaveBeenCalledTimes(1);
    });

    test('Enter activates the focused item (onClick called once)', async () => {
      const { user, onAlpha } = setup();
      await openMenu(user);

      await user.keyboard('{Enter}');

      expect(onAlpha).toHaveBeenCalledTimes(1);
    });

    // MUI v5 ButtonBase calls onClick directly from keydown; v9 dispatches a click (MouseEvent) that bubbles.
    test("[v5-quirk] Enter dispatches a click MouseEvent that reaches ancestors (v9)", async () => {
      const { user, onAlpha, onAncestorClick } = setup();
      // Baseline characterization: not a promised contract.
      await openMenu(user);
      onAncestorClick.mockClear();

      await user.keyboard('{Enter}');

      expect(onAlpha.mock.calls[0][0].type).toBe('click');
      expect(onAncestorClick).toHaveBeenCalledTimes(1);
    });

    test('Space activates the focused item (onClick called once)', async () => {
      const { user, onAlpha } = setup();
      await openMenu(user);

      await user.keyboard(' ');

      expect(onAlpha).toHaveBeenCalledTimes(1);
    });

    // MUI v5 ButtonBase calls onClick directly from keyup; v9 dispatches a click (MouseEvent) that bubbles.
    test("[v5-quirk] Space dispatches a click MouseEvent that reaches ancestors (v9)", async () => {
      const { user, onAlpha, onAncestorClick } = setup();
      // Baseline characterization: not a promised contract.
      await openMenu(user);
      onAncestorClick.mockClear();

      await user.keyboard(' ');

      expect(onAlpha.mock.calls[0][0].type).toBe('click');
      expect(onAncestorClick).toHaveBeenCalledTimes(1);
    });
  });
});
