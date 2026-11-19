import { FormControl as MuiFormControl, MenuItem as MuiMenuItem, Select as MuiSelect, TextField } from '@mui/material';
import { act, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { describe, expect, it } from 'vitest';
import { MenuOption } from '../Menu/MenuOption';
import { SelectTextField } from './SelectTextField';

/**
 * Raw (not normalised) a11y ids on the select display, MUI 9.5 vs own: the display's `aria-labelledby` is the label
 * id only (MUI v9 dropped v5's `[labelId, buttonId]` join) and its id is SelectDisplayProps.id / the field id / the
 * `mui-component-select-<name>` fallback.
 */
const read = (container: HTMLElement) => {
  const display = container.querySelector('[role="combobox"]') as HTMLElement;
  // React's useId counter runs across renders: an auto id is compared by shape, not value.
  const auto = (v: string | null) => (v && /^(_r_|:r)[a-z0-9]+[_:]$/.test(v) ? 'AUTO' : v);
  return { labelledby: auto(display.getAttribute('aria-labelledby')), id: auto(display.getAttribute('id')) };
};

const item = <MuiMenuItem value="a">{'A'}</MuiMenuItem>;

describe('select display aria ids equal MUI', () => {
  it.each([
    ['label + id', { id: 'f', label: 'L' }],
    ['id, no label', { id: 'f' }],
    ['name, no id', { name: 'fruit' }],
    ['label + id + name', { id: 'f', label: 'L', name: 'fruit' }],
  ])('TextField select: %s', (_name, props) => {
    const a = render(
      <TextField select value="a" {...props}>
        {item}
      </TextField>,
    );
    const mui = read(a.container);
    a.unmount();
    const b = render(
      <SelectTextField select value="a" {...props}>
        {item}
      </SelectTextField>,
    );
    const own = read(b.container);
    b.unmount();
    expect(own).toEqual(mui);
  });

  it('htmlInput aria-label labels the display only, not the native input', () => {
    const go = (C: React.ElementType, props: Record<string, unknown>) => {
      const v = render(
        <C select value="a" id="f" {...props}>
          {item}
        </C>,
      );
      const native = v.container.querySelector('input[aria-hidden="true"]') as HTMLElement;
      const display = v.container.querySelector('[role="combobox"]') as HTMLElement;
      const out = { native: native.getAttribute('aria-label'), display: display.getAttribute('aria-label') };
      v.unmount();
      return out;
    };
    expect(go(SelectTextField, { slotProps: { htmlInput: { 'aria-label': 'Fruit' } } })).toEqual(
      go(TextField, { slotProps: { htmlInput: { 'aria-label': 'Fruit' } } }),
    );
  });

  it('MenuProps.autoFocus false: an autofocusing child in the menu keeps focus', async () => {
    const go = async (C: React.ElementType) => {
      const user = userEvent.setup();
      const v = render(
        <C select value="a" id="f" slotProps={{ select: { MenuProps: { autoFocus: false } } }}>
          <div>
            <input aria-label="search" autoFocus />
          </div>
          {C === TextField ? item : <MenuOption value="a">{'A'}</MenuOption>}
        </C>,
      );
      await user.click(v.container.querySelector('[role="combobox"]') as HTMLElement);
      await act(async () => {
        await new Promise((r) => setTimeout(r, 20));
      });
      const out = (document.activeElement as HTMLElement).getAttribute('aria-label');
      v.unmount();
      return out;
    };
    const mui = await go(TextField);
    expect(mui).toBe('search');
    expect(await go(SelectTextField)).toBe(mui);
  });
  it('bare FormControl + Select with id', () => {
    const a = render(
      <MuiFormControl fullWidth>
        <MuiSelect id="search-select" value="a">
          {item}
        </MuiSelect>
      </MuiFormControl>,
    );
    const mui = read(a.container);
    a.unmount();
    const b = render(
      <SelectTextField bare select fullWidth id="search-select" value="a">
        {item}
      </SelectTextField>,
    );
    const own = read(b.container);
    b.unmount();
    expect(own).toEqual(mui);
  });
});
