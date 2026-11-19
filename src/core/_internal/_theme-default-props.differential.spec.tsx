import { readFileSync } from 'node:fs';
import path from 'node:path';
import { createTheme, THEME_ID, ThemeProvider, useThemeProps } from '@mui/material/styles';
import { render } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';
import { useThemeDefaultProps } from './theme-default-props';

/**
 * Plan §36.2 B.3 option 5.3: the own useThemeDefaultProps equals MUI's useThemeProps for the same tree: no provider,
 * a plain theme, a scoped `$$material` theme, nested providers, and defaultProps with slots / slotProps (objects and
 * functions, resolved with an owner state).
 */
type AnyProps = Record<string, unknown>;

const resolveFns = (value: unknown): unknown => {
  if (typeof value === 'function') return { fn: resolveFns((value as (o: object) => unknown)({ owner: true })) };
  if (Array.isArray(value)) return value.map(resolveFns);
  if (value && typeof value === 'object')
    return Object.fromEntries(Object.entries(value as AnyProps).map(([k, v]) => [k, resolveFns(v)]));
  return value;
};

const Probe = ({ impl, props, out }: { impl: 'mui' | 'own'; props: AnyProps; out: { value?: unknown } }) => {
  const resolved =
    impl === 'mui' ? useThemeProps({ props, name: 'MuiTextField' }) : useThemeDefaultProps(props, 'MuiTextField');
  out.value = resolveFns(resolved);
  return null;
};

const run = (impl: 'mui' | 'own', wrap: (child: React.ReactElement) => React.ReactElement, props: AnyProps) => {
  const out: { value?: unknown } = {};
  const view = render(wrap(<Probe impl={impl} props={props} out={out} />));
  view.unmount();
  return out.value;
};

const defaults = {
  variant: 'filled',
  size: 'small',
  slots: { inputLabel: 'span' },
  slotProps: {
    input: { className: 'theme-input', readOnly: true },
    htmlInput: (owner: object) => ({ 'data-owner': Object.keys(owner).join(',') }),
  },
};
const plain = createTheme({ components: { MuiTextField: { defaultProps: defaults as never } } });
const other = createTheme({ components: { MuiTextField: { defaultProps: { margin: 'dense' } as never } } });

describe('useThemeDefaultProps equals MUI useThemeProps', () => {
  const props = { label: 'L', slotProps: { input: { className: 'own' }, htmlInput: { maxLength: 3 } } };
  const cases: [string, (c: React.ReactElement) => React.ReactElement][] = [
    ['no provider', (c) => c],
    ['plain theme', (c) => <ThemeProvider theme={plain}>{c}</ThemeProvider>],
    ['scoped $$material theme', (c) => <ThemeProvider theme={{ [THEME_ID]: plain }}>{c}</ThemeProvider>],
    [
      'nested providers (inner wins)',
      (c) => (
        <ThemeProvider theme={other}>
          <ThemeProvider theme={plain}>{c}</ThemeProvider>
        </ThemeProvider>
      ),
    ],
    ['theme without MuiTextField defaults', (c) => <ThemeProvider theme={other}>{c}</ThemeProvider>],
  ];
  for (const [name, wrap] of cases) {
    it(name, () => {
      expect(run('own', wrap, props)).toEqual(run('mui', wrap, props));
    });
  }
  it('props without slotProps take the theme slotProps', () => {
    const wrap = (c: React.ReactElement) => <ThemeProvider theme={plain}>{c}</ThemeProvider>;
    expect(run('own', wrap, { label: 'x' })).toEqual(run('mui', wrap, { label: 'x' }));
  });
  it('imports nothing from @mui', () => {
    expect(readFileSync(path.join(__dirname, 'theme-default-props.ts'), 'utf8')).not.toMatch(/from '@mui/);
  });
});
