import { Autocomplete as MuiAutocomplete, TextField } from '@mui/material';
import { act, fireEvent, render } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';
import OwnAutocomplete from './Autocomplete';

/**
 * H15 FAIL (verifier 2): without an `id` the own core prefixed React's id with `mui-` (MUI's fallback for React
 * without useId); MUI 9.5 on React 19 uses the bare React id for the input, listbox and option ids. Both trees are
 * rendered in the same order so React hands out the same ids.
 */
const ids = (impl: 'mui' | 'own') => {
  const C = (impl === 'mui' ? MuiAutocomplete : OwnAutocomplete) as React.ElementType;
  const view = render(
    <C
      disablePortal
      options={['Apple', 'Banana']}
      renderInput={(params: Record<string, unknown>) => <TextField {...params} />}
    />,
  );
  const input = view.container.querySelector('input') as HTMLInputElement;
  act(() => {
    fireEvent.mouseDown(input);
    fireEvent.keyDown(input, { key: 'ArrowDown' });
  });
  const out = {
    input: input.id,
    activedescendant: input.getAttribute('aria-activedescendant'),
    listbox: view.container.querySelector('[role="listbox"]')?.id,
    option: view.container.querySelector('[role="option"]')?.id,
  };
  view.unmount();
  return out;
};

describe('own Autocomplete generated ids equal MUI 9.5 on React 19', () => {
  it('no mui- prefix on the input / listbox / option ids', () => {
    const mui = ids('mui');
    const own = ids('own');
    const strip = (o: Record<string, unknown>) => JSON.stringify(o).replace(/_r_[0-9a-z]+_/g, 'ID');
    expect(strip(own)).toBe(strip(mui));
    expect(own.input.startsWith('mui-')).toBe(false);
  });
});
