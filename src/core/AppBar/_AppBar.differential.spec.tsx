import { render } from '@test-utils/test-utils';
import React, { createRef } from 'react';
import { describe, expect, it } from 'vitest';
import { ToolbarMuiReference } from '../Toolbar/_Toolbar.mui-reference';
import { Toolbar } from '../Toolbar/Toolbar';
import { AppBarMuiReference } from './_AppBar.mui-reference';
import { AppBar } from './AppBar';

/**
 * Differential parity, jsdom: AppBar / Toolbar on the own core vs the frozen MUI implementations, per position and
 * colour, with rc-webapp's Navbar shape (ref, className, position fixed, inline style, Toolbar with className).
 * Emotion classes and own-core markers normalised; element, class order, inline style and ref target must match.
 */
type Impl = 'mui' | 'own';

const normalize = (html: string) =>
  html
    .replace(/ ?\bcss-[a-z0-9]+(-[A-Za-z0-9]+)*/g, '')
    .replace(/ class=""/g, '')
    .replace(/ data-vg-core=""/g, '')
    .replace(/ data-slot="[^"]*"/g, '');

const go = (impl: Impl, bar: Record<string, unknown>, tool: Record<string, unknown>) => {
  const A = (impl === 'mui' ? AppBarMuiReference : AppBar) as React.ElementType;
  const T = (impl === 'mui' ? ToolbarMuiReference : Toolbar) as React.ElementType;
  const ref = createRef<HTMLElement>();
  const view = render(
    <A ref={ref} {...bar}>
      <T {...tool}>{'Nav'}</T>
    </A>,
  );
  const out = { html: normalize(view.container.innerHTML), refTag: ref.current?.tagName ?? null };
  view.unmount();
  return out;
};

describe('AppBar / Toolbar own core equal MUI', () => {
  const cases: [string, Record<string, unknown>, Record<string, unknown>][] = [
    ['defaults', {}, {}],
    [
      'rc-webapp Navbar shape',
      { className: 'appBar scrolled', position: 'fixed', style: { top: 48 } },
      { className: 'toolbar' },
    ],
    ['position static', { position: 'static' }, {}],
    ['position sticky', { position: 'sticky' }, {}],
    ['position absolute', { position: 'absolute' }, {}],
    ['position relative', { position: 'relative' }, {}],
    ['color default', { color: 'default' }, {}],
    ['color transparent', { color: 'transparent' }, {}],
    ['color inherit', { color: 'inherit' }, {}],
    ['color secondary', { color: 'secondary' }, {}],
    ['Toolbar dense, no gutters', {}, { variant: 'dense', disableGutters: true }],
  ];
  for (const [name, bar, tool] of cases) {
    it(name, () => {
      expect(go('own', bar, tool)).toEqual(go('mui', bar, tool));
    });
  }
  it('routing: the modelled props render the own core; sx / component keep MUI', () => {
    const own = render(
      <AppBar className="appBar" position="fixed" style={{ top: 48 }}>
        <Toolbar className="toolbar">{'Nav'}</Toolbar>
      </AppBar>,
    );
    expect(own.container.querySelector('header')?.hasAttribute('data-vg-core')).toBe(true);
    expect(own.container.querySelector('.MuiToolbar-root')?.hasAttribute('data-vg-core')).toBe(true);
    own.unmount();
    const mui = render(
      <AppBar sx={{ zIndex: 5 }}>
        <Toolbar component="nav">{'Nav'}</Toolbar>
      </AppBar>,
    );
    expect(mui.container.querySelector('header')?.hasAttribute('data-vg-core')).toBe(false);
    expect(mui.container.querySelector('.MuiToolbar-root')?.hasAttribute('data-vg-core')).toBe(false);
    mui.unmount();
  });
});
