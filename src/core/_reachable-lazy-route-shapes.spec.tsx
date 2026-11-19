import { render } from '@test-utils/test-utils';
import { fireEvent } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { replayRouteShapes, sourceRoutes } from '../../agentic-plans/mui-upgrade-gates/package-fixture/smoke/replay-route-shapes';
import { AppBar } from './AppBar/AppBar';
import { Autocomplete } from './Autocomplete/Autocomplete';
import { AutocompleteWithAnchor } from './AutocompleteWithAnchor/AutocompleteWithAnchor';
import { Menu } from './Menu/Menu';
import { MenuItem } from './MenuItem/MenuItem';
import { PopoverPopper } from './Popover/PopoverPopper/PopoverPopper';
import { PopoverModal } from './PopoverModal/PopoverModal';
import { Render } from './Render/Render';
import { SearchableSelect } from './SearchableSelect/SearchableSelect';
import { Snackbar } from './Snackbar/Snackbar';
import { Toolbar } from './Toolbar/Toolbar';

const { loadMuiPopper } = vi.hoisted(() => ({ loadMuiPopper: vi.fn() }));
vi.mock('./Popover/PopoverPopper/MuiPopperFallback', (importOriginal) => {
  loadMuiPopper();
  return importOriginal();
});

it.each(sourceRoutes)('renders every inventoried %s shape without preload', { timeout: 15_000 }, (name) => {
  replayRouteShapes(
    name,
    { AppBar, Autocomplete, Menu, MenuItem, PopoverPopper, PopoverModal, Render, SearchableSelect, Snackbar, Toolbar },
    render,
    false,
    () => expect(loadMuiPopper).not.toHaveBeenCalled(),
  );
});

it('renders the private anchored Autocomplete and PopoverPopper in their actual parent frame', () => {
  const { getByRole } = render(
    <AutocompleteWithAnchor autocompleteProps={{ options: [{ key: 'a', title: 'Apple' }], optionKey: 'title' }}>
      <button type="button">{'Fixture autocomplete anchor'}</button>
    </AutocompleteWithAnchor>,
  );
  fireEvent.click(getByRole('button', { name: 'Fixture autocomplete anchor' }));
  const input = getByRole('combobox');
  expect(input.closest('.MuiAutocomplete-root')?.hasAttribute('data-vg-core')).toBe(true);
  expect(input.closest('.vanguard-popover')?.getAttribute('data-slot')).toBe('popper');
});
