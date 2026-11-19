import { StoryObj } from '@storybook/react';
import { EntryCss } from '@test-utils/consumer-css';
import { SbDecorator } from '@test-utils/get-storybook-decorator';
import { TRANSITION_LONGHANDS } from '@test-utils/transition-longhands';
import { VanguardThemeProvider } from '@vanguard/VanguardThemeProvider/VanguardThemeProvider';
import React from 'react';
import { expect } from 'storybook/test';
import { ToolbarMuiReference } from '../Toolbar/_Toolbar.mui-reference';
import { Toolbar } from '../Toolbar/Toolbar';
import { AppBarMuiReference } from './_AppBar.mui-reference';
import { AppBar } from './AppBar';

/**
 * Differential parity in Chromium: own AppBar / Toolbar vs the frozen MUI implementations, computed styles of the
 * header and the toolbar per colour, per position and in rc-webapp's Navbar shape, without and with
 * VanguardThemeProvider. Each pair renders side by side inside its own positioned box.
 */
export default {
  ...SbDecorator({ title: 'Vanguard/AppBar/Computed Parity', component: AppBar }),
};
type Story = StoryObj<typeof AppBar>;

const CASES: [string, Record<string, unknown>, Record<string, unknown>][] = [
  ...['primary', 'secondary', 'default', 'inherit', 'transparent', 'error', 'info', 'success', 'warning'].map(
    (color) =>
      [`color ${color}`, { color, position: 'static' }, {}] as [
        string,
        Record<string, unknown>,
        Record<string, unknown>,
      ],
  ),
  ...['fixed', 'absolute', 'sticky', 'static', 'relative'].map(
    (position) =>
      [`position ${position}`, { position }, { variant: 'dense', disableGutters: true }] as [
        string,
        Record<string, unknown>,
        Record<string, unknown>,
      ],
  ),
  ['Navbar shape', { className: 'appBar', position: 'fixed', style: { top: 10 } }, { className: 'toolbar' }],
];

const PROPS = [
  'display',
  'flex-direction',
  'width',
  'box-sizing',
  'flex-shrink',
  'position',
  'z-index',
  'top',
  'left',
  'right',
  'background-color',
  'background-image',
  'color',
  'box-shadow',
  ...TRANSITION_LONGHANDS,
  'align-items',
  'padding-left',
  'padding-right',
  'min-height',
  'height',
];

const Pair = () => (
  <div>
    {CASES.map(([name, bar, tool]) => (
      <div key={name} data-case={name} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
        {(['mui', 'own'] as const).map((which) => {
          const A = (which === 'mui' ? AppBarMuiReference : AppBar) as React.ElementType;
          const T = (which === 'mui' ? ToolbarMuiReference : Toolbar) as React.ElementType;
          return (
            <div
              key={which}
              data-side={which}
              style={{ position: 'relative', width: 300, height: 90, transform: 'translateZ(0)' }}
            >
              <A {...bar}>
                <T {...tool}>{'Nav'}</T>
              </A>
            </div>
          );
        })}
      </div>
    ))}
  </div>
);

// rc-webapp Navbar.module.scss travels in the entry CSS, before vanguard.css (D15).
const navbarEntryCss = `
  .appBar {
    background: transparent !important;
    box-shadow: none !important;
    z-index: 100 !important;
    transition: background 0.3s ease, box-shadow 0.3s ease;
  }
  .appBar.scrolled {
    background: var(--fn-bg) !important;
    box-shadow: 0 2px 4px rgba(var(--fn-shadow-rgb), 0.1) !important;
  }
`;

const play = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const mismatches: string[] = [];
  for (const [name] of CASES) {
    const row = canvasElement.querySelector(`[data-case="${name}"]`) as HTMLElement;
    for (const part of ['header', '.MuiToolbar-root']) {
      const a = getComputedStyle(row.querySelector(`[data-side="mui"] ${part}`) as Element);
      const b = getComputedStyle(row.querySelector(`[data-side="own"] ${part}`) as Element);
      for (const p of PROPS)
        if (a.getPropertyValue(p) !== b.getPropertyValue(p))
          mismatches.push(`${name} ${part}.${p}: mui ${a.getPropertyValue(p)} own ${b.getPropertyValue(p)}`);
    }
  }
  await expect({ n: mismatches.length, first: mismatches.slice(0, 15) }).toEqual({ n: 0, first: [] });
};

export const ComputedStylesMatchMui: Story = { render: () => <Pair />, play };
export const ComputedStylesMatchMuiInVanguardTheme: Story = {
  render: () => (
    <VanguardThemeProvider>
      <Pair />
    </VanguardThemeProvider>
  ),
  play,
};

export const NavbarInProductionStylesheetOrder: Story = {
  render: () => (
    <>
      <EntryCss css={navbarEntryCss} />
      <Pair />
    </>
  ),
  play: async ({ canvasElement }) => {
    const row = canvasElement.querySelector('[data-case="Navbar shape"]') as HTMLElement;
    const headers = [...row.querySelectorAll('header')];
    const transition = (header: HTMLElement) =>
      TRANSITION_LONGHANDS.map((property) => getComputedStyle(header).getPropertyValue(property));
    const muiBoxShadow = ['box-shadow', '0.3s', 'cubic-bezier(0.4, 0, 0.2, 1)', '0s'];
    await expect(headers.map(transition)).toEqual([muiBoxShadow, muiBoxShadow]);
    for (const header of headers) header.classList.add('scrolled');
    await expect(headers.map(transition)).toEqual([muiBoxShadow, muiBoxShadow]);
  },
};
