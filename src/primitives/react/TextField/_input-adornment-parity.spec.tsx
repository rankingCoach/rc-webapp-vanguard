import MuiFormControl from '@mui/material/FormControl';
import MuiInputAdornment from '@mui/material/InputAdornment';
import { render } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';
import { OwnFormControlContext } from './form-control-context';
import { InputAdornment } from './InputAdornment';

/**
 * Differential parity, jsdom: MUI 9.5 InputAdornment vs the own one, outside any FormControl and inside one (MUI
 * FormControl vs the own frame's form-control context): classes in MUI's order, the zero-width span for `start`,
 * string children wrapped like MUI's Typography (body1, textSecondary).
 */
const normalize = (html: string) =>
  html
    .replace(/ ?\bcss-[a-z0-9]+(-[A-Za-z0-9]+)*/g, '')
    .replace(/ class=""/g, '')
    .replace(/ data-vg-core=""/g, '')
    .replace(/ data-slot="[^"]*"/g, '')
    .replace(/ vg-typography-vanguard/g, '');

type Case = {
  name: string;
  props: Record<string, unknown>;
  ctx?: { size?: 'small' | 'medium'; hiddenLabel?: boolean };
};

const CASES: Case[] = [
  { name: 'end, no form control', props: { position: 'end', children: <span>{'i'}</span> } },
  { name: 'start, no form control', props: { position: 'start', children: <span>{'i'}</span> } },
  { name: 'end, outlined medium', props: { position: 'end', children: <span>{'i'}</span> }, ctx: { size: 'medium' } },
  { name: 'start, outlined small', props: { position: 'start', children: <span>{'i'}</span> }, ctx: { size: 'small' } },
  {
    name: 'disablePointerEvents + className',
    props: { position: 'end', disablePointerEvents: true, className: 'x', children: <span>{'i'}</span> },
    ctx: { size: 'medium' },
  },
  { name: 'string child (typography)', props: { position: 'end', children: 'kg' }, ctx: { size: 'medium' } },
  { name: 'string child, disableTypography', props: { position: 'end', disableTypography: true, children: 'kg' } },
];

const AnyMuiAdornment = MuiInputAdornment as React.ElementType;
const AnyAdornment = InputAdornment as React.ElementType;

const mui = (c: Case) => {
  const el = <AnyMuiAdornment {...c.props} />;
  const view = render(
    c.ctx ? (
      <MuiFormControl variant="outlined" size={c.ctx.size} hiddenLabel={c.ctx.hiddenLabel}>
        {el}
      </MuiFormControl>
    ) : (
      el
    ),
  );
  const html = normalize((c.ctx ? view.container.firstElementChild?.innerHTML : view.container.innerHTML) ?? '');
  view.unmount();
  return html;
};

const own = (c: Case) => {
  const el = <AnyAdornment {...c.props} />;
  const view = render(
    c.ctx ? (
      <OwnFormControlContext.Provider
        value={{ variant: 'outlined', size: c.ctx.size ?? 'medium', hiddenLabel: c.ctx.hiddenLabel }}
      >
        {el}
      </OwnFormControlContext.Provider>
    ) : (
      el
    ),
  );
  const html = normalize(view.container.innerHTML);
  view.unmount();
  return html;
};

describe('own InputAdornment equals MUI InputAdornment', () => {
  it.each(CASES)('$name', (c) => {
    expect(own(c)).toBe(mui(c));
  });
});
