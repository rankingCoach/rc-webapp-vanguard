import { setTimeout as sleep } from 'node:timers/promises';
import { cleanupOverlaySpec } from '@test-utils/cleanup-overlay-spec';
import { waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { act, render } from '../../../test-utils/test-utils';
import { AutocompleteMuiReference } from './_Autocomplete.mui-reference';
import { Autocomplete, AutocompleteProps } from './Autocomplete';

/**
 * Differential parity, jsdom (queue 2.5b): Vanguard Autocomplete on the own core vs the frozen MUI 9.5
 * implementation, same props and interactions → same document (root, input, adornments, popper, listbox, options,
 * chips) and the same callbacks. Canonical form: emotion classes, own-core markers and attribute/style/class order
 * normalised (no observable meaning); values and structure must match.
 */
type Impl = 'mui' | 'own';

const OPTIONS = [
  { key: 0, value: 'apple', title: 'Apple' },
  { key: 1, value: 'plum', title: 'Plum' },
  { key: 2, value: 'cherry', title: 'Cherry' },
  { key: 3, value: 'banana', title: 'Banana' },
  { key: 4, value: 'orange', title: 'Orange' },
];

const normalize = (html: string) =>
  html
    .replace(/ ?\bcss-[a-z0-9]+(-[A-Za-z0-9]+)*/g, '')
    // own analogue of the sx emotion class (src/primitives/react/z-index-class.ts)
    .replace(/ ?\bvg-z-n?\d+/g, '')
    .replace(/ class=""/g, '')
    .replace(/ data-vg-core=""/g, '')
    .replace(/ data-slot="[^"]*"/g, '')
    .replace(/ data-(open|disabled|selected|focus-visible|highlighted|checked|pressed|focused|filled|multiple)=""/g, '')
    .replace(/ data-mui-internal-clone-element="true"/g, '')
    .replace(/ vg-typography-vanguard/g, '')
    .replace(/<legend class="vg-notched-legend">/g, '<legend>')
    .replace(/ (id|aria-labelledby|aria-controls|aria-describedby|aria-activedescendant|for)="[^"]*"/g, ' $1="ID"');

const canonical = (html: string) => {
  const host = document.createElement('div');
  host.innerHTML = html;
  for (const el of Array.from(host.querySelectorAll('*'))) {
    const attrs = Array.from(el.attributes).map((a) => [a.name, a.value] as const);
    for (const [name] of attrs) el.removeAttribute(name);
    for (const [name, value] of attrs.sort(([x], [y]) => x.localeCompare(y))) {
      let v = value;
      if (name === 'class') v = value.split(/\s+/).filter(Boolean).sort().join(' ');
      if (name === 'style')
        v = value
          .split(';')
          .map((d) => d.trim())
          .filter(Boolean)
          .sort()
          .join('; ');
      el.setAttribute(name, v);
    }
  }
  return host.innerHTML;
};

// Body state belongs to every overlay differential (H16): the body's own inline style (scroll lock, scrollbar gap)
// next to its children (sibling aria-hidden is in the markup).
const snapshot = () =>
  `<body style="${document.body.getAttribute('style') ?? ''}">${canonical(normalize(document.body.innerHTML))}`;

const settle = async (signal: AbortSignal) => {
  let last = '';
  for (let i = 0; i < 60; i++) {
    await act(async () => {
      await sleep(5, undefined, { signal });
    });
    const now = snapshot();
    if (now === last) return;
    last = now;
  }
};

type Step = ['focus'] | ['type', string] | ['key', string] | ['option', number] | ['clear'] | ['blur'];

const go = async (impl: Impl, props: Partial<AutocompleteProps>, steps: Step[], signal: AbortSignal) => {
  signal.throwIfAborted();
  const user = userEvent.setup();
  const log: string[] = [];
  const C = (impl === 'mui' ? AutocompleteMuiReference : Autocomplete) as React.ElementType;
  const view = render(
    <C
      testId="ac"
      id="ac"
      options={OPTIONS}
      optionKey="title"
      onChange={(_e: unknown, v: unknown) => log.push(`change:${JSON.stringify(v)}`)}
      onInputChange={(_e: unknown, v: unknown, r: unknown) => log.push(`input:${JSON.stringify([v, r])}`)}
      {...props}
    />,
  );
  const popupIndicator = view.container.querySelector('.MuiAutocomplete-popupIndicator');
  // The settled DOM includes the packaged icon, which resolves separately from the input frame.
  if (popupIndicator) {
    await waitFor(() => expect(popupIndicator.querySelector('svg')).not.toBeNull(), { timeout: 2500 });
  }
  const trace: { html: string; log: string[] }[] = [];
  await settle(signal);
  trace.push({ html: snapshot(), log: log.splice(0) });
  const input = () => document.querySelector('input[role="combobox"], input') as HTMLInputElement;
  for (const step of steps) {
    signal.throwIfAborted();
    if (step[0] === 'focus') await user.click(input());
    if (step[0] === 'type') await user.type(input(), step[1]);
    if (step[0] === 'key') await user.keyboard(step[1]);
    if (step[0] === 'option') await user.click(document.querySelectorAll('[role="option"]')[step[1]] as HTMLElement);
    if (step[0] === 'clear') await user.click(document.querySelector('.MuiAutocomplete-clearIndicator') as HTMLElement);
    if (step[0] === 'blur')
      await act(async () => {
        input().blur();
      });
    await settle(signal);
    trace.push({ html: snapshot(), log: log.splice(0) });
  }
  view.unmount();
  view.container.remove();
  return trace;
};

afterEach(cleanupOverlaySpec);

const CASES: [string, Partial<AutocompleteProps>, Step[]][] = [
  ['closed, placeholder', { placeholder: 'Select a fruit...' }, []],
  ['with label', { label: 'Fruit', placeholder: 'Select' }, [['focus']]],
  [
    'open, type, select by keyboard',
    { placeholder: 'Select' },
    [['focus'], ['type', 'an'], ['key', '{ArrowDown}'], ['key', '{Enter}']],
  ],
  ['click option, then clear', { placeholder: 'Select' }, [['focus'], ['option', 2], ['focus'], ['clear']]],
  [
    'multiple: two chips, Backspace',
    { multiple: true, placeholder: 'Pick' },
    [['focus'], ['option', 0], ['focus'], ['option', 1], ['key', '{Backspace}']],
  ],
  [
    'restrictToOptions, no match text',
    { restrictToOptions: true, noOptionsText: 'Nothing found' },
    [['focus'], ['type', 'zz']],
  ],
  ['loading', { isLoading: true }, [['focus']]],
  ['highlightOptions', { highlightOptions: true }, [['focus'], ['type', 'er']]],
  ['disabled', { disabled: true, value: OPTIONS[1] as never }, [['focus']]],
  ['value given, hideClearButton', { value: OPTIONS[3] as never, hideClearButton: true }, [['focus'], ['blur']]],
];

describe('Autocomplete own core equals the MUI implementation', () => {
  for (const [name, props, steps] of CASES) {
    const timeout = name === 'open, type, select by keyboard' ? 15_000 : undefined;
    it(name, { timeout }, async ({ signal }) => {
      expect(await go('own', props, steps, signal)).toEqual(await go('mui', props, steps, signal));
    });
  }
});
