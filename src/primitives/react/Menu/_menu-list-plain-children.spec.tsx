import { MenuItem as MuiMenuItem, MenuList as MuiMenuList } from '@mui/material';
import { act, fireEvent, render } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';
import { MenuList } from './MenuList';
import { MenuOption } from './MenuOption';

/**
 * MUI 9.5 MenuList manages only its MenuItems (roving tab index, arrow navigation). Plain children that Select clones
 * with `role="option"` (SearchableSelect's search bar and footer) get no tab stop and are skipped (queue 2.5).
 */
const go = (impl: 'mui' | 'own') => {
  const Item = impl === 'mui' ? MuiMenuItem : MenuOption;
  const List = (impl === 'mui' ? MuiMenuList : MenuList) as React.ElementType;
  const view = render(
    <List autoFocusItem>
      <div role="option" aria-selected="false" data-name="search">
        {'search'}
      </div>
      <Item data-name="a">{'A'}</Item>
      <Item data-name="b">{'B'}</Item>
      <div role="option" aria-selected="false" data-name="footer">
        {'footer'}
      </div>
    </List>,
  );
  const tabindex = Object.fromEntries(
    Array.from(view.container.querySelectorAll('[data-name]')).map((el) => [
      el.getAttribute('data-name'),
      el.getAttribute('tabindex'),
    ]),
  );
  const focused: (string | null)[] = [];
  const list = view.container.querySelector('[role="menu"]') as HTMLElement;
  for (const key of ['ArrowDown', 'ArrowDown', 'ArrowDown']) {
    act(() => {
      fireEvent.keyDown(document.activeElement ?? list, { key });
    });
    focused.push((document.activeElement as HTMLElement).getAttribute('data-name'));
  }
  view.unmount();
  return { tabindex, focused };
};

describe('own MenuList with plain role=option children equals MUI', () => {
  it('only menu items get the tab stop and arrow navigation', () => {
    expect(go('own')).toEqual(go('mui'));
  });
});
