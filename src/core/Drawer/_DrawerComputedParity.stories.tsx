import { TRANSITION_LONGHANDS } from '@test-utils/transition-longhands';
import { StoryObj } from '@storybook/react';
import { SbDecorator } from '@test-utils/get-storybook-decorator';
import { VanguardThemeProvider } from '@vanguard/VanguardThemeProvider/VanguardThemeProvider';
import React, { useState } from 'react';
import { expect } from 'storybook/test';
import { DrawerMuiReference } from './_Drawer.mui-reference';
import { Drawer } from './Drawer';

/**
 * Differential parity in Chromium: the own Drawer vs the frozen MUI implementation, computed styles of root, paper
 * and backdrop per variant/anchor after the slide settles, without and with VanguardThemeProvider.
 */
export default {
  ...SbDecorator({ title: 'Vanguard/Drawer/Computed Parity', component: Drawer }),
};

type Story = StoryObj<typeof Drawer>;

type Scenario = { name: string; props: Record<string, unknown> };
const SCENARIOS: Scenario[] = [
  { name: 'persistent right', props: {} },
  { name: 'persistent left + close button', props: { anchor: 'left', showCloseButton: true } },
  { name: 'persistent bottom', props: { anchor: 'bottom' } },
  { name: 'temporary right', props: { variant: 'temporary' } },
  { name: 'temporary bottom hideBackdrop', props: { variant: 'temporary', anchor: 'bottom', hideBackdrop: true } },
  { name: 'temporary zIndex', props: { variant: 'temporary', zIndex: 2000 } },
  { name: 'permanent', props: { variant: 'permanent' } },
];

const PROPS = [
  ...TRANSITION_LONGHANDS,
  'display',
  'position',
  'box-sizing',
  'flex-grow',
  'flex-shrink',
  'flex-basis',
  'flex-direction',
  'top',
  'right',
  'bottom',
  'left',
  'width',
  'height',
  'max-height',
  'overflow-y',
  'color',
  'background-color',
  'background-image',
  'box-shadow',
  'border-top',
  'border-right',
  'border-bottom',
  'border-left',
  'border-radius',
  'outline-style',
  'z-index',
  'opacity',
  'visibility',
  'transform',
  'font-size',
  'line-height',
];

const PARTS: [string, string][] = [
  ['root', '.MuiDrawer-root'],
  ['paper', '.MuiDrawer-paper'],
  ['backdrop', '.MuiDrawer-root .MuiBackdrop-root'],
  ['content', '.MuiDrawer-paper > div'],
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
  const C = (which === 'mui' ? DrawerMuiReference : Drawer) as React.ElementType;
  const body = (
    <div style={{ display: 'flex', minHeight: 300 }}>
      <button type="button" data-next onClick={() => setWhich((w) => (w === 'mui' ? 'own' : 'mui'))} />
      <button type="button" data-case onClick={() => setI((n) => n + 1)} />
      {s ? (
        <C key={`${which}-${i}`} open title="Parity drawer" description="Body" {...s.props}>
          <div style={{ width: 280, height: 120 }}>{'content'}</div>
        </C>
      ) : null}
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
      // Slide enter is 400 ms (Vanguard's transitionDuration).
      await new Promise((r) => setTimeout(r, 650));
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
