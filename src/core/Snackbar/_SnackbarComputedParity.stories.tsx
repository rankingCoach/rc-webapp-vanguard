import { StoryObj } from '@storybook/react';
import { SbDecorator } from '@test-utils/get-storybook-decorator';
import { VanguardThemeProvider } from '@vanguard/VanguardThemeProvider/VanguardThemeProvider';
import React, { useState } from 'react';
import { expect } from 'storybook/test';
import { SnackbarMuiReference } from './_Snackbar.mui-reference';
import { Snackbar } from './Snackbar';

/**
 * Differential parity in Chromium: the own Snackbar vs the frozen MUI implementation, computed styles of root,
 * content (SnackbarContent), message and action per anchorOrigin, after the Grow enter settles, without and with
 * VanguardThemeProvider.
 */
export default {
  ...SbDecorator({ title: 'Vanguard/Snackbar/Computed Parity', component: Snackbar }),
};

type Story = StoryObj<typeof Snackbar>;

type Scenario = { name: string; props: Record<string, unknown> };
const ACTION = <button type="button">{'Undo'}</button>;
const SCENARIOS: Scenario[] = [
  { name: 'default (bottom left), content', props: { message: 'Saved' } },
  {
    name: 'top right, content + action',
    props: { anchorOrigin: { vertical: 'top', horizontal: 'right' }, message: 'Saved', action: ACTION },
  },
  { name: 'top center', props: { anchorOrigin: { vertical: 'top', horizontal: 'center' }, message: 'Saved' } },
  { name: 'bottom center', props: { anchorOrigin: { vertical: 'bottom', horizontal: 'center' }, message: 'Saved' } },
  {
    name: 'bottom right, custom child',
    props: {
      anchorOrigin: { vertical: 'bottom', horizontal: 'right' },
      children: <div className="custom">{'Custom'}</div>,
    },
  },
  { name: 'top left', props: { anchorOrigin: { vertical: 'top', horizontal: 'left' }, message: 'Saved' } },
];

const PROPS = [
  'display',
  'position',
  'z-index',
  'top',
  'right',
  'bottom',
  'left',
  'align-items',
  'justify-content',
  'flex-wrap',
  'flex-grow',
  'min-width',
  'width',
  'height',
  'padding-top',
  'padding-right',
  'padding-bottom',
  'padding-left',
  'margin-left',
  'margin-right',
  'color',
  'background-color',
  'background-image',
  'box-shadow',
  'border-radius',
  'font-family',
  'font-size',
  'font-weight',
  'line-height',
  'letter-spacing',
  'opacity',
  'transform',
];

const PARTS: [string, string][] = [
  ['root', '.MuiSnackbar-root'],
  ['content', '.MuiSnackbarContent-root'],
  ['message', '.MuiSnackbarContent-message'],
  ['action', '.MuiSnackbarContent-action'],
  ['child', '.MuiSnackbar-root > *'],
];

const read = () =>
  Object.fromEntries(
    PARTS.map(([key, sel]) => {
      const el = document.querySelector(sel);
      if (!el) return [key, null];
      const cs = getComputedStyle(el);
      return [key, Object.fromEntries(PROPS.map((p) => [p, cs.getPropertyValue(p)]))];
    }),
  );

const Runner = ({ themed }: { themed: boolean }) => {
  const [i, setI] = useState(0);
  const [which, setWhich] = useState<'mui' | 'own'>('mui');
  const s = SCENARIOS[i];
  const C = (which === 'mui' ? SnackbarMuiReference : Snackbar) as React.ElementType;
  const body = (
    <div>
      <button type="button" data-next onClick={() => setWhich((w) => (w === 'mui' ? 'own' : 'mui'))} />
      <button type="button" data-case onClick={() => setI((n) => n + 1)} />
      {s ? <C key={`${which}-${i}`} open {...s.props} /> : null}
    </div>
  );
  return themed ? <VanguardThemeProvider>{body}</VanguardThemeProvider> : body;
};

const play = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const mismatches: string[] = [];
  const click = (sel: string) => (canvasElement.querySelector(sel) as HTMLElement).click();
  for (const s of SCENARIOS) {
    const snap: Record<string, ReturnType<typeof read>> = {};
    for (const which of ['mui', 'own'] as const) {
      await new Promise((r) => setTimeout(r, 450));
      snap[which] = read();
      click('[data-next]');
      await new Promise((r) => setTimeout(r, 30));
    }
    for (const [key] of PARTS) {
      const a = snap.mui[key];
      const b = snap.own[key];
      if (a === null || b === null) {
        if (a !== b) mismatches.push(`${s.name} ${key}: ${a === null ? 'mui' : 'own'} missing`);
        continue;
      }
      for (const p of PROPS) if (a[p] !== b[p]) mismatches.push(`${s.name} ${key}.${p}: mui ${a[p]} own ${b[p]}`);
    }
    click('[data-case]');
    await new Promise((r) => setTimeout(r, 30));
  }
  await expect({ n: mismatches.length, first: mismatches.slice(0, 15) }).toEqual({ n: 0, first: [] });
};

export const ComputedStylesMatchMui: Story = { render: () => <Runner themed={false} />, play };
export const ComputedStylesMatchMuiInVanguardTheme: Story = { render: () => <Runner themed />, play };
