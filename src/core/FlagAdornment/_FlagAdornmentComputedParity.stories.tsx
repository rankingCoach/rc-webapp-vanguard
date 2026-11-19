import { TRANSITION_LONGHANDS } from '@test-utils/transition-longhands';
import { StoryObj } from '@storybook/react';
import { SbDecorator } from '@test-utils/get-storybook-decorator';
import { Input } from '@vanguard/Input/Input';
import { VanguardThemeProvider } from '@vanguard/VanguardThemeProvider/VanguardThemeProvider';
import React from 'react';
import { expect, waitFor } from 'storybook/test';
import { FlagAdornmentMuiReference } from './_FlagAdornment.mui-reference';
import { FlagAdornment } from './FlagAdornment';

/**
 * Differential parity in Chromium: FlagAdornment on the own InputAdornment vs the frozen MUI one, standalone and inside
 * the Vanguard Input, computed styles of the adornment, its spacer span and the flag, plus the input's position,
 * without and with VanguardThemeProvider.
 */
export default {
  ...SbDecorator({ title: 'Vanguard/FlagAdornment/Computed Parity', component: FlagAdornment }),
};

type Story = StoryObj<typeof FlagAdornment>;

const PROPS = [
  ...TRANSITION_LONGHANDS,
  'display',
  'position',
  'width',
  'height',
  'max-height',
  'align-items',
  'white-space',
  'color',
  'margin-top',
  'margin-right',
  'margin-bottom',
  'margin-left',
  'padding-top',
  'padding-right',
  'padding-bottom',
  'padding-left',
  'font-size',
  'line-height',
  'pointer-events',
  'overflow-x',
];

const read = (root: Element) => {
  const parts: [string, Element | null][] = [
    ['adornment', root.querySelector('.MuiInputAdornment-root')],
    ['spacer', root.querySelector('.MuiInputAdornment-root > .notranslate')],
    ['img', root.querySelector('.MuiInputAdornment-root img')],
    ['input', root.querySelector('input')],
  ];
  return Object.fromEntries(
    parts.map(([k, el]) => {
      if (!el) return [k, null];
      const cs = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      return [
        k,
        {
          ...Object.fromEntries(PROPS.map((p) => [p, cs.getPropertyValue(p)])),
          x: r.left - root.getBoundingClientRect().left,
          w: r.width,
        },
      ];
    }),
  );
};

const Pair = () => (
  <div>
    <div data-side="mui" style={{ width: 320 }}>
      <FlagAdornmentMuiReference countryCode="de" />
      <Input label="Phone" adornment={<FlagAdornmentMuiReference countryCode="de" />} />
    </div>
    <div data-side="own" style={{ width: 320 }}>
      <FlagAdornment countryCode="de" />
      <Input label="Phone" adornment={<FlagAdornment countryCode="de" />} />
    </div>
  </div>
);

const play = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  await waitFor(() => expect(canvasElement.querySelectorAll('img[src*="de.png"]').length).toBe(4));
  await new Promise((r) => setTimeout(r, 200));
  const mismatches: string[] = [];
  for (const kind of ['standalone', 'input'] as const) {
    const pick = (side: string) => {
      const sideEl = canvasElement.querySelector(`[data-side="${side}"]`) as HTMLElement;
      const host = document.createElement('div');
      return kind === 'standalone' ? sideEl : ((sideEl.querySelector('.MuiInputBase-root') as Element) ?? host);
    };
    const a = read(pick('mui'));
    const b = read(pick('own'));
    for (const k of Object.keys(a)) {
      const x = a[k] as Record<string, unknown> | null;
      const y = b[k] as Record<string, unknown> | null;
      if (!x || !y) {
        if (x !== y) mismatches.push(`${kind} ${k}: missing`);
        continue;
      }
      for (const p of Object.keys(x)) if (x[p] !== y[p]) mismatches.push(`${kind} ${k}.${p}: mui ${x[p]} own ${y[p]}`);
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
