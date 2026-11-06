/**
 * MUI upgrade contract (v5 -> v9) for the vanguard SearchableSelect (MUI Select + Menu + MenuItem).
 *
 * Locks the CURRENT observable behaviour on MUI v5 so that the unchanged tests go red where MUI changes
 * behaviour (see agentic-plans/mui-upgrade-breaking-changes.md). Real MUI, no mocks.
 *
 * MUI classes asserted here are only those Vanguard production code depends on (grep hits):
 * - `.MuiOutlinedInput-root` SearchableSelect.scss:4 / InputBase.scss:106, `.MuiOutlinedInput-input`
 *   SearchableSelect.scss:20, `.MuiSvgIcon-root` SearchableSelect.scss:16, `.MuiSelect-select` InputBase.scss:261,
 *   `.MuiFormControl-root` InputBase.scss:12
 * - `.MuiInputAdornment-root` SearchableSelect.scss:27, `-positionEnd` :30, `-positionStart` :36
 * - `.MuiMenu-root` root-components.scss:64, `.MuiMenu-paper` SearchableSelect.scss:45, `.MuiMenu-list` :50,
 *   `.MuiMenuItem-root` :96, `.Mui-selected` :111
 * Class checks use expect.soft (or live in class-only tests) so a rename never hides a behaviour result.
 */
import '@testing-library/jest-dom/vitest';

import userEvent from '@testing-library/user-event';
import { IconNames } from '@vanguard/Icon/IconNames';
import { OVERLAY_BASE_Z_INDEX, OverlayStackingService } from '@vanguard/OverlayStacking/OverlayStackingService';
import { SelectOptionProp } from '@vanguard/Select/Select';
import React from 'react';
import { afterEach, describe, expect, test, vi } from 'vitest';

import { render, screen, waitFor, within } from '../../../test-utils/test-utils';
import { SearchableSelect, SearchableSelectProps } from './SearchableSelect';

const ZERO_WIDTH_SPACE = String.fromCharCode(8203);

const makeOptions = (count: number): SelectOptionProp<string>[] =>
  Array.from({ length: count }, (_, i) => ({ key: i, value: `v${i}`, title: `Title ${i}` }));

const SMALL = makeOptions(3); // below both thresholds
const MEDIUM = makeOptions(6); // footer (>= 5) but no search bar (< 10)
const LARGE = makeOptions(11); // footer + search bar

const renderSelect = (props: Partial<SearchableSelectProps<string>> = {}) =>
  render(<SearchableSelect<string> options={SMALL} {...props} />);

// hidden: the open Menu (Modal) sets aria-hidden on the app container that holds the trigger
const getCombobox = () => screen.getByRole('combobox', { hidden: true });
const getRoot = () => screen.getByTestId('vanguard-searchable-select-input');
const getMenuRoot = () => document.querySelector('.vanguard-searchable-select-menu') as HTMLElement | null;
/**
 * Only the real MenuItems: MUI also stamps role=option onto the search-bar / footer children, which carry our own
 * classes. Located by role (not `.MuiMenuItem-root`) so a class rename cannot hide behaviour results.
 */
const menuItems = () =>
  (screen.queryAllByRole('option') as HTMLElement[]).filter(
    (o) =>
      !o.classList.contains('search-bar-container') &&
      !o.classList.contains('vanguard-searchable-select-input-menu-list-footer'),
  );
const menuItemTitles = () => menuItems().map((li) => li.textContent);
const displayedValue = () => getCombobox().textContent?.split(ZERO_WIDTH_SPACE).join('').trim();
const getSearchInput = () =>
  within(screen.getByTestId('search-select-input-search')).getByRole('textbox') as HTMLInputElement;

const open = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(getCombobox());
  await screen.findByRole('listbox');
};

describe('SearchableSelect MUI contract', () => {
  afterEach(() => {
    OverlayStackingService.__resetForTests();
    vi.restoreAllMocks();
  });

  describe('closed render', () => {
    test('renders a focusable combobox trigger with the Vanguard id / aria-label inside the vanguard wrapper', () => {
      renderSelect();
      const root = getRoot();
      expect(root.closest('.vanguard-input.vanguard-searchable-select-input')).not.toBeNull();

      const combobox = getCombobox();
      expect(root.contains(combobox)).toBe(true);
      expect(combobox).toHaveAttribute('id', 'search-select');
      expect(combobox).toHaveAttribute('aria-label', 'Without label');
      expect(combobox).toHaveAttribute('aria-haspopup', 'listbox');
      expect(combobox).toHaveAttribute('aria-expanded', 'false');
      expect(combobox).toHaveAttribute('tabindex', '0');
    });

    // CURRENT BEHAVIOUR (suspected a11y bug): the hard-coded aria-label="Without label" (copied from the MUI docs
    // example) is what screen readers announce; the selected value is not part of the name.
    test('[bug-lock] the trigger accessible name is "Without label", even with a value selected', () => {
      // Baseline characterization: not a promised contract.
      renderSelect({ value: 'v1' });
      expect(getCombobox()).toHaveAccessibleName('Without label');
    });

    test('closed: the MUI classes Vanguard SCSS targets are on the expected elements', () => {
      renderSelect();
      const root = getRoot();
      expect.soft(root).toHaveClass('MuiOutlinedInput-root');
      expect.soft(root.parentElement).toHaveClass('MuiFormControl-root');
      expect.soft(getCombobox()).toHaveClass('MuiSelect-select', 'MuiOutlinedInput-input');
      // .vanguard-searchable-select-input .MuiOutlinedInput-root .MuiSvgIcon-root { display: none } hides MUI's caret
      expect.soft(root.querySelector('svg')).toHaveClass('MuiSvgIcon-root');
      expect.soft(root.querySelector('.MuiInputAdornment-root.MuiInputAdornment-positionEnd')).not.toBeNull();
    });

    test('closed: transparent background, no start adornment', () => {
      renderSelect();
      const root = getRoot();
      expect(root.style.background).toBe('transparent');
      expect.soft(root.querySelector('.MuiInputAdornment-positionStart')).toBeNull();
    });

    test('startAdornment renders a start InputAdornment before the trigger', () => {
      renderSelect({ startAdornment: { icon: IconNames.search, color: '--n400' } });
      const start = getRoot().querySelector('.MuiInputAdornment-root.MuiInputAdornment-positionStart');
      expect(start).not.toBeNull();
      expect((start as Element).compareDocumentPosition(getCombobox()) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    });

    test('renderValue shows the selected option title', () => {
      renderSelect({ value: 'v2' });
      expect(displayedValue()).toBe('Title 2');
      expect(getCombobox().querySelector('.rc-text.notranslate')).not.toBeNull();
    });

    test('renderValue shows an empty title when the value is not among the options', () => {
      vi.spyOn(console, 'warn').mockImplementation(() => undefined);
      renderSelect({ value: 'unknown' });
      expect(displayedValue()).toBe('');
    });

    test('no value: nothing but the zero-width placeholder is rendered', () => {
      renderSelect();
      expect(getCombobox().textContent).toBe(ZERO_WIDTH_SPACE);
    });

    // CURRENT BEHAVIOUR (suspected bug): `defaultSelected` is declared in the props but never read.
    test('[bug-lock] defaultSelected is ignored', () => {
      // Baseline characterization: not a promised contract.
      renderSelect({ defaultSelected: 'v1' });
      expect(displayedValue()).toBe('');
    });
  });

  describe('open menu', () => {
    test('click opens a body-portalled MUI Menu scoped by vanguard-searchable-select-menu', async () => {
      const user = userEvent.setup();
      const { container } = renderSelect();
      await open(user);

      const combobox = getCombobox();
      expect(combobox).toHaveAttribute('aria-expanded', 'true');
      const listbox = screen.getByRole('listbox');
      expect(combobox).toHaveAttribute('aria-controls', listbox.id);

      // `.vanguard-searchable-select-menu` (MenuProps.className) scopes SearchableSelect.scss:44 in the portal
      const menuRoot = getMenuRoot() as HTMLElement;
      expect(menuRoot.parentElement).toBe(document.body);
      expect(container.contains(menuRoot)).toBe(false);
      expect(menuRoot.contains(listbox)).toBe(true);
      expect(menuItemTitles()).toEqual(['Title 0', 'Title 1', 'Title 2']);
      // the trigger background switches while open
      expect(getRoot().style.background).toBe('var(--n000)');
    });

    test('open: the MUI classes Vanguard SCSS targets are on the expected elements', async () => {
      const user = userEvent.setup();
      renderSelect({ value: 'v1' });
      await open(user);
      const menuRoot = getMenuRoot() as HTMLElement;
      const listbox = screen.getByRole('listbox');
      expect.soft(menuRoot).toHaveClass('MuiMenu-root');
      expect.soft(listbox).toHaveClass('MuiMenu-list');
      expect.soft(listbox.parentElement).toHaveClass('MuiMenu-paper');
      menuItems().forEach((li) => { expect.soft(li).toHaveClass('MuiMenuItem-root'); });
      expect.soft(menuItems()[1]).toHaveClass('Mui-selected');
    });

    test('MenuItems are options; the selected one is aria-selected and the only tabbable item', async () => {
      const user = userEvent.setup();
      renderSelect({ value: 'v1' });
      await open(user);

      expect(menuItems().map((li) => li.getAttribute('aria-selected'))).toEqual(['false', 'true', 'false']);
      // v9 MenuList: roving tabindex
      expect(menuItems().map((li) => li.getAttribute('tabindex'))).toEqual(['-1', '0', '-1']);
    });

    test('the menu marks the app container aria-hidden while open (Modal behaviour)', async () => {
      const user = userEvent.setup();
      const { container } = renderSelect();
      await open(user);
      expect(container).toHaveAttribute('aria-hidden', 'true');
    });

    test('option description is rendered as a caption below the title', async () => {
      const user = userEvent.setup();
      renderSelect({ options: [{ key: 1, value: 'a', title: 'Alpha', description: 'first letter' }] });
      await open(user);
      const item = menuItems()[0];
      expect(item.querySelectorAll('.rc-text')).toHaveLength(2);
      expect(item.querySelector('.text-caption')?.textContent).toBe('first letter');
    });

    test('hidden options are not listed', async () => {
      const user = userEvent.setup();
      renderSelect({ options: [...SMALL, { key: 9, value: 'h', title: 'Hidden', hidden: true }] });
      await open(user);
      expect(menuItemTitles()).toEqual(['Title 0', 'Title 1', 'Title 2']);
    });

    test('below the thresholds there is neither a search bar nor a footer', async () => {
      const user = userEvent.setup();
      renderSelect();
      await open(user);
      expect(screen.queryByTestId('search-select-input-search')).toBeNull();
      expect(screen.queryByTestId('search-selector-footer-menu')).toBeNull();
      // only MenuItems carry role=option
      expect(screen.getAllByRole('option')).toHaveLength(3);
    });

    test('footer shows the total count (incl. elementName) once options reach displayTotalCountThreshold', async () => {
      const user = userEvent.setup();
      renderSelect({ options: MEDIUM, elementName: 'domain' });
      await open(user);
      const footer = screen.getByTestId('search-selector-footer-menu');
      expect(footer.textContent).toBe('6 domains');
      expect(footer.closest('.vanguard-searchable-select-input-menu-list-footer')?.parentElement).toBe(
        screen.getByRole('listbox'),
      );
      expect(screen.queryByTestId('search-select-input-search')).toBeNull();
    });

    // CURRENT BEHAVIOUR (suspected a11y bug): MUI Select clones every child, so the search bar container and the
    // footer get role="option" aria-selected="false" and show up as (non-selectable) options.
    test('[bug-lock] search bar and footer children are exposed as extra role=option nodes', async () => {
      // Baseline characterization: not a promised contract.
      const user = userEvent.setup();
      renderSelect({ options: LARGE, value: 'v2' });
      await open(user);
      const options = screen.getAllByRole('option');
      expect(options).toHaveLength(LARGE.length + 2);
      expect(options[0]).toHaveClass('search-bar-container');
      expect(options[options.length - 1]).toHaveClass('vanguard-searchable-select-input-menu-list-footer');
      expect(options[0]).toHaveAttribute('aria-selected', 'false');
    });

    test('custom thresholds control search bar and footer', async () => {
      const user = userEvent.setup();
      renderSelect({ options: SMALL, displaySearchBarMinimumElements: 3, displayTotalCountThreshold: 4 });
      await open(user);
      expect(screen.getByTestId('search-select-input-search')).toBeInTheDocument();
      expect(screen.queryByTestId('search-selector-footer-menu')).toBeNull();
    });
  });

  describe('selection and close semantics', () => {
    test('clicking a MenuItem calls onSelection(value) and closes the menu', async () => {
      const onSelection = vi.fn();
      const user = userEvent.setup();
      renderSelect({ onSelection });
      await open(user);

      await user.click(screen.getByRole('option', { name: 'Title 2' }));
      expect(onSelection).toHaveBeenCalledTimes(1);
      expect(onSelection).toHaveBeenCalledWith('v2');
      await waitFor(() => expect(getMenuRoot()).toBeNull());
      expect(getCombobox()).toHaveAttribute('aria-expanded', 'false');
      expect(getRoot().style.background).toBe('transparent');
    });

    test('uncontrolled (no value prop): the picked title is shown after selection', async () => {
      const user = userEvent.setup();
      renderSelect();
      await open(user);
      await user.click(screen.getByRole('option', { name: 'Title 1' }));
      await waitFor(() => expect(displayedValue()).toBe('Title 1'));
    });

    test('controlled: the shown title follows the value prop, not the click', async () => {
      const user = userEvent.setup();
      const { rerender } = renderSelect({ value: 'v0' });
      await open(user);
      await user.click(screen.getByRole('option', { name: 'Title 2' }));
      await waitFor(() => expect(getMenuRoot()).toBeNull());
      expect(displayedValue()).toBe('Title 0');

      rerender(<SearchableSelect<string> options={SMALL} value={'v2'} />);
      expect(displayedValue()).toBe('Title 2');
    });

    test('Escape closes without selecting', async () => {
      const onSelection = vi.fn();
      const user = userEvent.setup();
      renderSelect({ onSelection });
      await open(user);
      await user.keyboard('{Escape}');
      await waitFor(() => expect(getMenuRoot()).toBeNull());
      expect(onSelection).not.toHaveBeenCalled();
    });

    test('clicking the backdrop closes without selecting', async () => {
      const onSelection = vi.fn();
      const user = userEvent.setup();
      renderSelect({ onSelection });
      await open(user);
      // the invisible click-away surface (MUI Backdrop): the menu-root child that is neither the paper nor a
      // focus-trap sentinel (located structurally, no MUI class / aria-hidden dependency)
      const listbox = screen.getByRole('listbox');
      const backdrop = Array.from((getMenuRoot() as HTMLElement).children).find(
        (c) => !c.contains(listbox) && !c.hasAttribute('tabindex'),
      ) as HTMLElement;
      await user.click(backdrop);
      await waitFor(() => expect(getMenuRoot()).toBeNull());
      expect(onSelection).not.toHaveBeenCalled();
    });

    test('Enter on the focused trigger opens the menu without focusing a MenuItem (autoFocus=false)', async () => {
      const user = userEvent.setup();
      renderSelect({ value: 'v0' });
      getCombobox().focus();
      await user.keyboard('{Enter}');
      await screen.findByRole('listbox');
      // autoFocus=false: focus does not move onto a MenuItem
      expect(menuItems()).not.toContain(document.activeElement);
    });

    test('Enter on a focused MenuItem selects it', async () => {
      const onSelection = vi.fn();
      const user = userEvent.setup();
      renderSelect({ onSelection });
      await open(user);
      menuItems()[1].focus();
      await user.keyboard('{Enter}');
      expect(onSelection).toHaveBeenCalledWith('v1');
    });

    test('ArrowDown moves focus between MenuItems once one is focused', async () => {
      const user = userEvent.setup();
      renderSelect();
      await open(user);
      menuItems()[0].focus();
      await user.keyboard('{ArrowDown}');
      expect(document.activeElement).toBe(menuItems()[1]);
    });
  });

  describe('search', () => {
    test('search bar autofocuses with the elementName placeholder', async () => {
      const user = userEvent.setup();
      renderSelect({ options: LARGE, elementName: 'domain' });
      await open(user);
      const search = getSearchInput();
      expect(search).toHaveAttribute('placeholder', 'Search domain');
      await waitFor(() => expect(search).toHaveFocus());
      expect(search.closest('.search-bar-container')?.parentElement).toBe(screen.getByRole('listbox'));
    });

    test('default placeholder is "Search"', async () => {
      const user = userEvent.setup();
      renderSelect({ options: LARGE });
      await open(user);
      expect(getSearchInput()).toHaveAttribute('placeholder', 'Search');
    });

    test('typing fuzzy-filters MenuItems and does not trigger Select typeahead / selection', async () => {
      const onSelection = vi.fn();
      const user = userEvent.setup();
      renderSelect({ options: LARGE, onSelection });
      await open(user);
      await waitFor(() => expect(getSearchInput()).toHaveFocus());

      await user.keyboard('10');
      expect(getSearchInput().value).toBe('10');
      expect(menuItemTitles()).toEqual(['Title 10']);
      expect(onSelection).not.toHaveBeenCalled();
      // footer keeps the TOTAL count
      expect(screen.getByTestId('search-selector-footer-menu').textContent).toBe('11 elements');
    });

    // CURRENT BEHAVIOUR (suspected a11y bug): every key but Escape is stopped in the search input, so keyboard
    // users cannot move from the search field to the items.
    test('[bug-lock] ArrowDown / Enter inside the search input stay in the input (propagation stopped)', async () => {
      // Baseline characterization: not a promised contract.
      const onSelection = vi.fn();
      const user = userEvent.setup();
      renderSelect({ options: LARGE, onSelection });
      await open(user);
      await waitFor(() => expect(getSearchInput()).toHaveFocus());

      await user.keyboard('{ArrowDown}');
      expect(getSearchInput()).toHaveFocus();
      await user.keyboard('{Enter}');
      expect(onSelection).not.toHaveBeenCalled();
      expect(getMenuRoot()).not.toBeNull();
    });

    test('Escape in the search input closes the menu and resets the search on reopen', async () => {
      const user = userEvent.setup();
      renderSelect({ options: LARGE });
      await open(user);
      await waitFor(() => expect(getSearchInput()).toHaveFocus());
      await user.keyboard('10');
      expect(menuItemTitles()).toEqual(['Title 10']);

      await user.keyboard('{Escape}');
      await waitFor(() => expect(getMenuRoot()).toBeNull());

      await open(user);
      expect(getSearchInput().value).toBe('');
      expect(menuItems()).toHaveLength(LARGE.length);
    });

    test('selecting a filtered item reports its value and resets the search', async () => {
      const onSelection = vi.fn();
      const user = userEvent.setup();
      renderSelect({ options: LARGE, onSelection });
      await open(user);
      await waitFor(() => expect(getSearchInput()).toHaveFocus());
      await user.keyboard('7');
      await user.click(screen.getByRole('option', { name: 'Title 7' }));
      expect(onSelection).toHaveBeenCalledWith('v7');
      await waitFor(() => expect(getMenuRoot()).toBeNull());

      await open(user);
      expect(menuItems()).toHaveLength(LARGE.length);
    });

    test('a search that would hide the selected option keeps the closed value title', async () => {
      const user = userEvent.setup();
      renderSelect({ options: LARGE, value: 'v1' });
      await open(user);
      await waitFor(() => expect(getSearchInput()).toHaveFocus());
      await user.keyboard('10');
      expect(displayedValue()).toBe('Title 1');
    });

    // CURRENT BEHAVIOUR (suspected bug): `hidden` options are only filtered when the search text is empty;
    // the fuzzy results include them again.
    test('[bug-lock] hidden options re-appear in search results', async () => {
      // Baseline characterization: not a promised contract.
      const user = userEvent.setup();
      const options = [...LARGE, { key: 99, value: 'secret', title: 'Secret entry', hidden: true }];
      renderSelect({ options });
      await open(user);
      expect(menuItemTitles()).not.toContain('Secret entry');
      await waitFor(() => expect(getSearchInput()).toHaveFocus());
      await user.keyboard('Secret');
      expect(menuItemTitles()).toEqual(['Secret entry']);
    });

    test('searchableProps: strings, numbers, objects, booleans and nullish values are searchable text', async () => {
      type Rich = SelectOptionProp<string> & { extra?: unknown };
      const circular: Record<string, unknown> = {};
      circular.self = circular;
      const options: Rich[] = [
        ...makeOptions(6),
        { key: 'n', value: 'num', title: 'Numeric', extra: 4242 },
        { key: 'o', value: 'obj', title: 'Object', extra: { tag: 'zebra' } },
        { key: 'b', value: 'bool', title: 'Boolean', extra: true },
        { key: 'u', value: 'undef', title: 'Undefined', extra: undefined },
        { key: 'c', value: 'circ', title: 'Circular', extra: circular },
      ];
      const user = userEvent.setup();
      renderSelect({ options, searchableProps: ['title', 'extra'] as any });
      await open(user);
      await waitFor(() => expect(getSearchInput()).toHaveFocus());

      await user.keyboard('4242');
      expect(menuItemTitles()).toEqual(['Numeric']);
      await user.clear(getSearchInput());
      await user.keyboard('zebra');
      expect(menuItemTitles()).toEqual(['Object']);
      await user.clear(getSearchInput());
      await user.keyboard('true');
      expect(menuItemTitles()).toEqual(['Boolean']);
    });

    test('searchableProps can target the description', async () => {
      const options = makeOptions(10).map((o, i) => ({ ...o, description: i === 4 ? 'needle' : 'hay' }));
      const user = userEvent.setup();
      renderSelect({ options, searchableProps: ['description'] as any });
      await open(user);
      await waitFor(() => expect(getSearchInput()).toHaveFocus());
      await user.keyboard('needle');
      expect(menuItemTitles()).toEqual(['Title 4needle']);
    });
  });

  describe('menu stacking (OverlayStackingService)', () => {
    test('open registers a popover slot set as inline z-index on the menu root; close releases it', async () => {
      const user = userEvent.setup();
      renderSelect();
      expect(OverlayStackingService.getTopmostZIndex('popover')).toBe(OVERLAY_BASE_Z_INDEX);
      await open(user);

      expect(OverlayStackingService.getTopmostZIndex('popover')).toBe(OVERLAY_BASE_Z_INDEX + 1);
      // MenuProps.slotProps.root.style
      expect((getMenuRoot() as HTMLElement).style.zIndex).toBe(String(OVERLAY_BASE_Z_INDEX + 1));

      await user.keyboard('{Escape}');
      await waitFor(() => expect(getMenuRoot()).toBeNull());
      expect(OverlayStackingService.getTopmostZIndex('popover')).toBe(OVERLAY_BASE_Z_INDEX);
    });

    test('stacks above a modal that raised the floor', async () => {
      const modalZ = OverlayStackingService.register('host-modal', 'modal', 4000);
      const user = userEvent.setup();
      renderSelect();
      await open(user);
      expect(Number((getMenuRoot() as HTMLElement).style.zIndex)).toBeGreaterThan(modalZ);
    });

    test('unmounting while open releases the slot', async () => {
      const user = userEvent.setup();
      const { unmount } = renderSelect();
      await open(user);
      unmount();
      expect(OverlayStackingService.getTopmostZIndex('popover')).toBe(OVERLAY_BASE_Z_INDEX);
    });
  });
});
