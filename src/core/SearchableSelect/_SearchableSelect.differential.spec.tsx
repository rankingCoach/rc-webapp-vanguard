import userEvent from '@testing-library/user-event';
import { SelectOptionProp } from '@vanguard/Select/Select';
import React from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { act, render } from '../../../test-utils/test-utils';
import { SearchableSelectMuiReference } from './_SearchableSelect.mui-reference';
import { SearchableSelect, SearchableSelectProps } from './SearchableSelect';

/**
 * Differential parity, jsdom (queue 2.5): SearchableSelect on the own core vs the frozen MUI 9.5 implementation, same
 * props, same interactions → same document (trigger, menu, search bar, items, footer), emotion classes and own-core
 * markers normalised.
 */
type Impl = 'mui' | 'own';

const makeOptions = (count: number): SelectOptionProp<string>[] =>
  Array.from({ length: count }, (_, i) => ({
    key: i,
    value: `v${i}`,
    title: `Title ${i}`,
    ...(i === 1 ? { description: 'Second' } : {}),
  }));

const normalize = (html: string) =>
  html
    .replace(/ ?\bcss-[a-z0-9]+(-[A-Za-z0-9]+)*/g, '')
    .replace(/ class=""/g, '')
    .replace(/ data-vg-core=""/g, '')
    .replace(/ data-slot="[^"]*"/g, '')
    // own-core boolean state attributes (D2)
    .replace(/ data-(open|disabled|selected|focus-visible|highlighted|checked|pressed|focused|filled)=""/g, '')
    .replace(/ data-mui-internal-clone-element="true"/g, '')
    .replace(/ vg-typography-vanguard/g, '')
    // The reference's search bar is Vanguard's InputBase, already on the own core (no MUI FormControl context), so
    // its MUI InputAdornment lacks the variant/size classes real MUI (9d3b75b) renders; the own InputAdornment reads
    // the own frame's context and renders them like 9d3b75b. Equal elsewhere.
    .replace(/ MuiInputAdornment-(outlined|size(Small|Medium))/g, '')
    // own-core styling hook on the notched legend (shipped with Input/Select, Tier A accepted)
    .replace(/<legend class="vg-notched-legend">/g, '<legend>')
    .replace(/ (id|aria-labelledby|aria-controls|aria-describedby|for)="[^"]*"/g, ' $1="ID"');

const Subject = ({ impl, ...props }: { impl: Impl } & SearchableSelectProps<string>) =>
  impl === 'mui' ? <SearchableSelectMuiReference<string> {...props} /> : <SearchableSelect<string> {...props} />;

/**
 * Canonical form: attribute, style-declaration and class-token order carry no observable meaning (nothing selects or
 * reads by order), so they are sorted; values and structure must match exactly.
 */
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

const snapshot = () => canonical(normalize(document.body.innerHTML));

/** Lazy icons (useDynamicImport) resolve over several macrotasks: wait until the document stops changing. */
const settle = async () => {
  let last = '';
  for (let i = 0; i < 50; i++) {
    await act(async () => {
      await new Promise((r) => setTimeout(r, 5));
    });
    const now = snapshot();
    if (now === last) return;
    last = now;
  }
};

const go = async (impl: Impl, props: SearchableSelectProps<string>, steps: ('open' | 'type' | 'pick')[]) => {
  const user = userEvent.setup();
  const trace: string[] = [];
  const view = render(<Subject impl={impl} {...props} />);
  await settle();
  trace.push(snapshot());
  for (const step of steps) {
    if (step === 'open') await user.click(view.getByRole('combobox'));
    if (step === 'type')
      await user.type(
        document.querySelector('[data-testid="search-select-input-search"] input') as HTMLElement,
        'Title 1',
      );
    if (step === 'pick') await user.click(document.querySelectorAll('[role="option"][data-value]')[0] as HTMLElement);
    await settle();
    trace.push(snapshot());
  }
  view.unmount();
  view.container.remove();
  return trace;
};

afterEach(() => {
  document.body.innerHTML = '';
});

describe('SearchableSelect own core equals the MUI implementation', () => {
  it.each([
    ['closed, value', { options: makeOptions(3), value: 'v1' }, []],
    ['open, small (no search, no footer)', { options: makeOptions(3), value: 'v1' }, ['open']],
    ['open, medium (footer)', { options: makeOptions(6), value: 'v0', elementName: 'account' }, ['open']],
    ['open, large (search bar), type', { options: makeOptions(11), value: 'v0' }, ['open', 'type']],
    [
      'start adornment, open, pick',
      { options: makeOptions(6), value: 'v2', startAdornment: { icon: 'search', color: '--n400' } },
      ['open', 'pick'],
    ],
  ] as [string, SearchableSelectProps<string>, ('open' | 'type' | 'pick')[]][])('%s', async (_name, props, steps) => {
    expect(await go('own', props, steps)).toEqual(await go('mui', props, steps));
  });
});
