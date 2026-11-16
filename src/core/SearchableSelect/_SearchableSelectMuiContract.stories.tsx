/**
 * MUI upgrade contract (v5 -> v9), real-browser part: SearchableSelect.scss targets MUI class names. Each style
 * story asserts a computed value our SCSS sets, so a renamed MUI class (or a moved slot such as
 * MenuListProps -> slotProps.list) turns the story red. The interaction story asserts behaviour only.
 *
 * MUI classes used, with the production dependency (grep hit):
 * `.MuiOutlinedInput-root` SearchableSelect.scss:4, `.MuiSvgIcon-root` :16, `.MuiOutlinedInput-input` :20 and
 * InputBase.scss:118, `.MuiInputAdornment-root` :27, `-positionEnd` :30, `-positionStart` :36, `.MuiMenu-paper` :45,
 * `.MuiMenu-list` :50, `.MuiMenuItem-root` :96, `.Mui-selected` :111.
 */
import { StoryObj } from '@storybook/react';
import { SbDecorator } from '@test-utils/get-storybook-decorator';
import { IconNames } from '@vanguard/Icon/IconNames';
import { SelectOptionProp } from '@vanguard/Select/Select';
import React from 'react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { SearchableSelect } from './SearchableSelect';

type Story = StoryObj<typeof SearchableSelect>;

const makeOptions = (count: number): SelectOptionProp<string>[] =>
  Array.from({ length: count }, (_, i) => ({ key: i, value: `v${i}`, title: `Title ${i}` }));
/** Menu transition / focus settle budget under a loaded full-suite run. */
const SETTLE = { timeout: 5000 };

export default {
  ...SbDecorator({
    title: 'Vanguard/SearchableSelect/MUI Contract',
    component: SearchableSelect,
    opts: { withRedux: true },
  }),
};

const Wrapper = ({ children }: { children: React.ReactNode }) => <div style={{ width: 360 }}>{children}</div>;

const styleOf = (el: Element, props: (keyof CSSStyleDeclaration)[]) => {
  const cs = getComputedStyle(el);
  return Object.fromEntries(props.map((p) => [p, cs[p]]));
};

const getMenuRoot = () => document.querySelector('.vanguard-searchable-select-menu') as HTMLElement | null;
const findListbox = () => within(document.body).findByRole('listbox', {}, SETTLE);
/** Real items only (search bar / footer also get role=option; they carry our own classes). */
const menuItems = (listbox: HTMLElement) =>
  (within(listbox).queryAllByRole('option') as HTMLElement[]).filter(
    (o) =>
      !o.classList.contains('search-bar-container') &&
      !o.classList.contains('vanguard-searchable-select-input-menu-list-footer'),
  );

export const TriggerStyleContract: Story = {
  args: { options: makeOptions(3), value: 'v1', startAdornment: { icon: IconNames.search } },
  render: (args) => (
    <Wrapper>
      <SearchableSelect {...args} />
    </Wrapper>
  ),
  play: async ({ canvasElement }) => {
    const root = within(canvasElement).getByTestId('vanguard-searchable-select-input');
    // fullWidth FormControl: the trigger spans the wrapper
    await expect(Math.round(root.getBoundingClientRect().width)).toBe(360);

    // .vanguard-searchable-select-input .MuiOutlinedInput-root .MuiSvgIcon-root { display: none }
    const muiCaret = root.querySelector('.MuiSvgIcon-root') as HTMLElement;
    await expect(muiCaret).not.toBeNull();
    await expect(getComputedStyle(muiCaret).display).toBe('none');

    // Root has `vanguard-input`, so InputBase.scss `.vanguard-input .MuiOutlinedInput-root .MuiOutlinedInput-input
    // { padding: 12px 18px }` applies vertically (MUI default would be 16.5px); padding-right 32px from our rule.
    const select = within(canvasElement).getByRole('combobox');
    await expect(styleOf(select, ['paddingTop', 'paddingBottom', 'paddingRight', 'marginRight'])).toEqual({
      paddingTop: '12px',
      paddingBottom: '12px',
      paddingRight: '32px',
      marginRight: '0px',
    });

    // .MuiInputAdornment-root { pointer-events: none } &.MuiInputAdornment-positionEnd { absolute; right 12px }
    const endAdornment = root.querySelector('.MuiInputAdornment-positionEnd') as HTMLElement;
    await expect(styleOf(endAdornment, ['pointerEvents', 'position', 'right'])).toEqual({
      pointerEvents: 'none',
      position: 'absolute',
      right: '12px',
    });
    // &.MuiInputAdornment-positionStart { margin-right: 0 } (MUI default 8px)
    const startAdornment = root.querySelector('.MuiInputAdornment-positionStart') as HTMLElement;
    await expect(styleOf(startAdornment, ['pointerEvents', 'marginRight'])).toEqual({
      pointerEvents: 'none',
      marginRight: '0px',
    });

    await expect(root.style.background).toBe('transparent');
  },
};

// CURRENT BEHAVIOUR (suspected bug): SearchableSelect.scss and InputBase.scss rules with the SAME specificity fight;
// the winner depends on stylesheet order. With this file's import order InputBase wins both.
export const TriggerCssOrderConflict: Story = {
  name: '[bug-lock] Trigger CSS order conflict with InputBase',
  args: { options: makeOptions(3), value: 'v1' },
  render: (args) => (
    <Wrapper>
      <SearchableSelect {...args} />
    </Wrapper>
  ),
  play: async ({ canvasElement }) => {
    // Baseline characterization: not a promised contract.
    const root = within(canvasElement).getByTestId('vanguard-searchable-select-input');
    // ours `padding-left: 14px` loses to InputBase.scss:118 `padding: 12px 18px`
    await expect(getComputedStyle(within(canvasElement).getByRole('combobox')).paddingLeft).toBe('18px');
    // ours `margin-right: 0` loses to InputBase.scss:328 `.MuiInputAdornment-positionEnd { margin-right: 8px }`
    const endAdornment = root.querySelector('.MuiInputAdornment-positionEnd') as HTMLElement;
    await expect(getComputedStyle(endAdornment).marginRight).toBe('8px');
  },
};

export const MenuStyleContract: Story = {
  args: { options: makeOptions(11), value: 'v1', elementName: 'domain' },
  render: (args) => (
    <Wrapper>
      <SearchableSelect {...args} />
    </Wrapper>
  ),
  play: async ({ canvasElement }) => {
    const root = within(canvasElement).getByTestId('vanguard-searchable-select-input');
    await userEvent.click(within(canvasElement).getByRole('combobox'));
    const listbox = await findListbox();

    const menuRoot = getMenuRoot() as HTMLElement;
    await expect(menuRoot.parentElement).toBe(document.body);
    await expect(Number(menuRoot.style.zIndex)).toBeGreaterThan(1100);

    // .vanguard-searchable-select-menu .MuiMenu-paper { padding: 4px; padding-bottom: 8px; margin-top: 4px }
    const paper = menuRoot.querySelector('.MuiMenu-paper') as HTMLElement;
    await expect(styleOf(paper, ['paddingTop', 'paddingLeft', 'paddingBottom', 'marginTop'])).toEqual({
      paddingTop: '4px',
      paddingLeft: '4px',
      paddingBottom: '8px',
      marginTop: '4px',
    });

    // .MuiMenu-list { padding: 4px 4px 0; max-height: 276px; overflow-x: hidden }
    await expect(listbox).toHaveClass('MuiMenu-list');
    await expect(styleOf(listbox, ['paddingTop', 'paddingBottom', 'maxHeight', 'overflowX'])).toEqual({
      paddingTop: '4px',
      paddingBottom: '0px',
      maxHeight: '276px',
      overflowX: 'hidden',
    });

    // MenuProps.MenuListProps.style.width = trigger offsetWidth - 8 (v9: MenuListProps -> slotProps.list)
    await expect(listbox.style.width).toBe(`${root.offsetWidth - 8}px`);

    // MenuProps.anchorEl = the Select root -> paper opens below the trigger, horizontally centred on it
    // (Select's Menu anchorOrigin/transformOrigin horizontal: 'center'; a few px of rounding/measure drift allowed)
    await waitFor(() => {
      const paperRect = paper.getBoundingClientRect();
      const rootRect = root.getBoundingClientRect();
      expect(paperRect.top).toBeGreaterThanOrEqual(Math.floor(rootRect.bottom));
      expect(Math.abs(paperRect.left + paperRect.width / 2 - (rootRect.left + rootRect.width / 2))).toBeLessThanOrEqual(8);
      expect(paperRect.width).toBeLessThan(rootRect.width);
    }, SETTLE);

    // .MuiMenuItem-root { padding: 8px 16px; font-size 16px; line-height 28px; white-space normal }
    const items = Array.from(listbox.querySelectorAll('.MuiMenuItem-root')) as HTMLElement[];
    await expect(items).toHaveLength(11);
    await expect(styleOf(items[0], ['paddingTop', 'paddingLeft', 'fontSize', 'lineHeight', 'whiteSpace'])).toEqual({
      paddingTop: '8px',
      paddingLeft: '16px',
      fontSize: '16px',
      lineHeight: '28px',
      whiteSpace: 'normal',
    });
    // &.Mui-selected { color: var(--fn-fg-cta) } differs from the plain item colour var(--fn-fg)
    await expect(items[1]).toHaveClass('Mui-selected');
    await expect(getComputedStyle(items[1]).color).not.toBe(getComputedStyle(items[0]).color);

    // .search-bar-container { position: sticky; top: 0; margin-bottom: 8px }
    const searchBar = listbox.querySelector('.search-bar-container') as HTMLElement;
    await expect(styleOf(searchBar, ['position', 'marginBottom'])).toEqual({ position: 'sticky', marginBottom: '8px' });
    // search input inside the menu: .MuiOutlinedInput-input padding-left 42px, adornment absolute left 14px
    const searchInput = searchBar.querySelector('input') as HTMLInputElement;
    await expect(styleOf(searchInput, ['paddingLeft', 'paddingRight'])).toEqual({ paddingLeft: '42px', paddingRight: '14px' });
    const searchAdornment = searchBar.querySelector('.MuiInputAdornment-root') as HTMLElement;
    await expect(styleOf(searchAdornment, ['position', 'left', 'marginLeft'])).toEqual({
      position: 'absolute',
      left: '14px',
      marginLeft: '0px',
    });

    // footer: sticky bottom with a top border
    const footer = listbox.querySelector('.vanguard-searchable-select-input-menu-list-footer') as HTMLElement;
    await expect(styleOf(footer, ['position', 'borderTopWidth', 'paddingTop', 'paddingLeft'])).toEqual({
      position: 'sticky',
      borderTopWidth: '1px',
      paddingTop: '8px',
      paddingLeft: '16px',
    });
  },
};

export const MenuSearchSelectContract: Story = {
  args: { options: makeOptions(11), value: 'v1', onSelection: fn(), elementName: 'domain' },
  render: (args) => (
    <Wrapper>
      <SearchableSelect {...args} />
    </Wrapper>
  ),
  play: async ({ canvasElement, args }) => {
    await userEvent.click(within(canvasElement).getByRole('combobox'));
    const listbox = await findListbox();
    const searchInput = within(listbox).getByPlaceholderText('Search domain');
    await waitFor(() => expect(searchInput).toHaveFocus(), SETTLE);

    await userEvent.keyboard('9');
    await waitFor(() => expect(menuItems(listbox).map((o) => o.textContent)).toEqual(['Title 9']), SETTLE);
    await userEvent.click(menuItems(listbox)[0]);
    await expect(args.onSelection).toHaveBeenCalledWith('v9');
    await waitFor(() => expect(getMenuRoot()).toBeNull(), SETTLE);
  },
};
