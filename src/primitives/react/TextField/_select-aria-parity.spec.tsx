import { MenuItem as MuiMenuItem, TextField } from '@mui/material';
import { render } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';
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
});
