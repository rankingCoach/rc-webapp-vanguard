import { OutlinedInput } from '@mui/material';
import { Input } from '@vanguard/Input/Input';
import { VanguardThemeProvider } from '@vanguard/VanguardThemeProvider/VanguardThemeProvider';
import React from 'react';
import { describe, expect, it } from 'vitest';
import { render, waitFor } from '../../../test-utils/test-utils';
import { FlagAdornmentMuiReference } from './_FlagAdornment.mui-reference';
import { FlagAdornment } from './FlagAdornment';

/**
 * Differential parity, jsdom: FlagAdornment on the own InputAdornment vs the frozen MUI one, standalone, inside the
 * Vanguard Input (own frame) in both sizes / themes, and inside a MUI OutlinedInput. Canonical form: emotion classes and
 * own-core markers normalised; values and structure must match.
 */
const normalize = (html: string) =>
  html
    .replace(/ ?\bcss-[a-z0-9]+(-[A-Za-z0-9]+)*/g, '')
    .replace(/ class=""/g, '')
    .replace(/ data-vg-core=""/g, '')
    .replace(/ data-slot="input-adornment"/g, '')
    .replace(/ (id|for|aria-labelledby|aria-describedby)="[^"]*"/g, ' $1="ID"');

const canonical = (html: string) => {
  const host = document.createElement('div');
  host.innerHTML = html;
  for (const el of Array.from(host.querySelectorAll('*'))) {
    const attrs = Array.from(el.attributes).map((a) => [a.name, a.value] as const);
    for (const [name] of attrs) el.removeAttribute(name);
    for (const [name, value] of attrs.sort(([x], [y]) => x.localeCompare(y)))
      el.setAttribute(name, name === 'class' ? value.split(/\s+/).filter(Boolean).sort().join(' ') : value);
  }
  return host.innerHTML;
};

type Impl = 'mui' | 'own';
const F = (impl: Impl) => (impl === 'mui' ? FlagAdornmentMuiReference : FlagAdornment);

const go = async (impl: Impl, wrap: (flag: React.ReactElement) => React.ReactElement) => {
  const Flag = F(impl);
  const view = render(wrap(<Flag countryCode="de" />));
  await waitFor(() => expect(view.container.querySelector('img')?.getAttribute('src') ?? '').toMatch(/de\.png$/));
  const html = canonical(normalize(view.container.innerHTML));
  view.unmount();
  return html;
};

/**
 * Declared delta (handoff 18): inside the Vanguard Input (own TextFieldFrame) the own InputAdornment reads the frame's
 * form-control context, as MUI's InputAdornment read MUI's FormControl before the frame went own, so it carries
 * `MuiInputAdornment-outlined` and `MuiInputAdornment-size<Size>` again. The frozen HEAD reference (MUI adornment
 * inside the own frame) has no MUI context and lacks both. MUI styles neither class for outlined (computed style
 * unchanged); everything else must match.
 */
const withFrameContext = (size: 'Medium' | 'Small') => (html: string) =>
  html.replace(
    /class="MuiInputAdornment-positionStart MuiInputAdornment-root/,
    `class="MuiInputAdornment-outlined MuiInputAdornment-positionStart MuiInputAdornment-root MuiInputAdornment-size${size}`,
  );

describe('FlagAdornment own core equals MUI', () => {
  const cases: [string, (flag: React.ReactElement) => React.ReactElement, ((html: string) => string)?][] = [
    ['standalone', (f) => f],
    ['Vanguard Input adornment', (f) => <Input label="Phone" adornment={f} />, withFrameContext('Medium')],
    [
      'Vanguard Input adornment, small',
      (f) => <Input label="Phone" size={'small' as never} adornment={f} />,
      // Vanguard's `size` is its own sizing; the frame (and so the context) stays MUI size medium, as on the root.
      withFrameContext('Medium'),
    ],
    [
      'Vanguard Input adornment, VanguardThemeProvider',
      (f) => (
        <VanguardThemeProvider>
          <Input label="Phone" adornment={f} />
        </VanguardThemeProvider>
      ),
      withFrameContext('Medium'),
    ],
    ['MUI OutlinedInput startAdornment', (f) => <OutlinedInput startAdornment={f} />],
  ];
  for (const [name, wrap, delta] of cases) {
    it(name, async () => {
      const mui = await go('mui', wrap);
      expect(await go('own', wrap)).toEqual(delta ? delta(mui) : mui);
    });
  }
});
