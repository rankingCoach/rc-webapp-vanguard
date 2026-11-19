import { TRANSITION_LONGHANDS } from '@test-utils/transition-longhands';
import { Skeleton as MuiSkeleton } from '@mui/material';
import { StoryObj } from '@storybook/react';
import { SbDecorator } from '@test-utils/get-storybook-decorator';
import { VanguardThemeProvider } from '@vanguard/VanguardThemeProvider/VanguardThemeProvider';
import React from 'react';
import { expect } from 'storybook/test';
import { Skeleton } from '../../../primitives/react/Skeleton/Skeleton';

/** Chromium: own Skeleton vs MUI's (InputBase loading rows), computed styles and box, both themes. */
export default { ...SbDecorator({ title: 'Vanguard/InputBase/Skeleton Computed Parity', component: Skeleton }) };
type Story = StoryObj<typeof Skeleton>;

const PROPS = [
  ...TRANSITION_LONGHANDS,
  'display',
  'background-color',
  'margin-top',
  'margin-bottom',
  'height',
  'width',
  'transform-origin',
  'transform',
  'border-top-left-radius',
  'animation-name',
  'animation-duration',
  'animation-delay',
  'animation-timing-function',
  'animation-iteration-count',
];
const ROWS: { width: string; height: number }[] = [
  { width: '100%', height: 16 },
  { width: '80%', height: 16 },
  { width: '100%', height: 42 },
];

const Pair = () => (
  <div style={{ width: 300 }}>
    <div data-side="mui">
      {ROWS.map((r) => (
        <MuiSkeleton key={`${r.width}${r.height}`} {...r} />
      ))}
    </div>
    <div data-side="own">
      {ROWS.map((r) => (
        <Skeleton key={`${r.width}${r.height}`} {...r} />
      ))}
    </div>
  </div>
);

const play = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const rows = (side: string) => Array.from(canvasElement.querySelectorAll(`[data-side="${side}"] > span`));
  const mismatches: string[] = [];
  rows('mui').forEach((m, i) => {
    const o = rows('own')[i];
    const a = getComputedStyle(m);
    const b = getComputedStyle(o);
    for (const p of PROPS) {
      const x = p === 'animation-name' ? String(a.getPropertyValue(p) !== 'none') : a.getPropertyValue(p);
      const y = p === 'animation-name' ? String(b.getPropertyValue(p) !== 'none') : b.getPropertyValue(p);
      if (x !== y) mismatches.push(`row ${i} ${p}: mui ${x} own ${y}`);
    }
    const ra = m.getBoundingClientRect();
    const rb = o.getBoundingClientRect();
    // Transformed rects differ only in float noise (1e-5 px); compare at 0.01 px.
    const r2 = (v: number) => Math.round(v * 100) / 100;
    if (r2(ra.width) !== r2(rb.width) || r2(ra.height) !== r2(rb.height))
      mismatches.push(`row ${i} box: mui ${ra.width}x${ra.height} own ${rb.width}x${rb.height}`);
  });
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
