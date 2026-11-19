import { TRANSITION_LONGHANDS } from '@test-utils/transition-longhands';
import { StoryObj } from '@storybook/react';
import { SbDecorator } from '@test-utils/get-storybook-decorator';
import { VanguardThemeProvider } from '@vanguard/VanguardThemeProvider/VanguardThemeProvider';
import React, { useState } from 'react';
import { expect, userEvent, waitFor } from 'storybook/test';
import { AutocompleteMuiReference } from './_Autocomplete.mui-reference';
import { Autocomplete } from './Autocomplete';

/**
 * Differential parity in Chromium (queue 2.5b): the own Autocomplete vs the frozen MUI implementation, computed styles
 * of every part (root, input root, input, end adornment, indicators, popper, paper, listbox, options, no-options /
 * loading) per scenario, without and with VanguardThemeProvider. Positions are covered by the Popper parity suites.
 */
export default {
  ...SbDecorator({ title: 'Vanguard/Autocomplete/Computed Parity', component: Autocomplete }),
};

type Story = StoryObj<typeof Autocomplete>;

const OPTIONS = [
  { key: 0, value: 'apple', title: 'Apple' },
  { key: 1, value: 'plum', title: 'Plum' },
  { key: 2, value: 'cherry', title: 'Cherry' },
];

type Scenario = { name: string; props: Record<string, unknown>; open?: boolean; arrow?: boolean };
const SCENARIOS: Scenario[] = [
  { name: 'closed with value', props: { value: OPTIONS[1] } },
  { name: 'open, highlighted', props: {}, open: true, arrow: true },
  { name: 'multiple with chips, open', props: { multiple: true, value: [OPTIONS[0]] }, open: true },
  { name: 'loading', props: { isLoading: true }, open: true },
  { name: 'no options', props: { restrictToOptions: true, noOptionsText: 'Nothing', options: [] }, open: true },
  { name: 'disabled', props: { disabled: true, value: OPTIONS[2] } },
];

const PROPS = [
  ...TRANSITION_LONGHANDS,
  'display',
  'position',
  'box-sizing',
  'width',
  'min-width',
  'max-height',
  'padding-top',
  'padding-right',
  'padding-bottom',
  'padding-left',
  'margin-top',
  'margin-right',
  'margin-bottom',
  'margin-left',
  'color',
  'background-color',
  'border-radius',
  'box-shadow',
  'font-family',
  'font-size',
  'font-weight',
  'line-height',
  'letter-spacing',
  'opacity',
  'visibility',
  'transform',
  'flex-wrap',
  'flex-grow',
  'overflow-x',
  'overflow-y',
  'list-style-type',
  'cursor',
  'z-index',
  'text-overflow',
  'min-height',
  'top',
  'right',
];

const PARTS: [string, string][] = [
  ['root', '.MuiAutocomplete-root'],
  ['inputRoot', '.MuiAutocomplete-inputRoot'],
  ['input', '.MuiAutocomplete-input'],
  ['endAdornment', '.MuiAutocomplete-endAdornment'],
  ['clear', '.MuiAutocomplete-clearIndicator'],
  ['popupIndicator', '.MuiAutocomplete-popupIndicator'],
  ['popper', '.MuiAutocomplete-popper'],
  ['paper', '.MuiAutocomplete-paper'],
  ['listbox', '.MuiAutocomplete-listbox'],
  ['option0', '.MuiAutocomplete-option'],
  ['optionFocused', '.MuiAutocomplete-option.Mui-focused'],
  ['optionSelected', '.MuiAutocomplete-option[aria-selected="true"]'],
  ['tag', '.MuiAutocomplete-tag'],
  ['noOptions', '.MuiAutocomplete-noOptions'],
  ['loading', '.MuiAutocomplete-loading'],
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
  const C = (which === 'mui' ? AutocompleteMuiReference : Autocomplete) as React.ElementType;
  const body = (
    <div style={{ padding: 40, width: 360 }}>
      <button type="button" data-next onClick={() => setWhich((w) => (w === 'mui' ? 'own' : 'mui'))} />
      <button type="button" data-case onClick={() => setI((n) => n + 1)} />
      {s ? <C key={`${which}-${i}`} testId="ac" id="ac" options={OPTIONS} optionKey="title" {...s.props} /> : null}
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
      const input = await waitFor(() => {
        const el = canvasElement.querySelector<HTMLInputElement>('.MuiAutocomplete-root input');
        if (!el) throw new Error('not rendered');
        return el;
      });
      if (s.open) {
        await userEvent.click(input);
        await waitFor(() => expect(document.querySelector('.MuiAutocomplete-popper')).not.toBeNull());
        if (s.arrow) await userEvent.keyboard('{ArrowDown}');
      }
      await new Promise((r) => setTimeout(r, 120));
      snap[which] = read();
      (document.activeElement as HTMLElement | null)?.blur();
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
