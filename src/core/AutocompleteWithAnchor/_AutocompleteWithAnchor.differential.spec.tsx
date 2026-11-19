import { readFileSync } from 'node:fs';
import path from 'node:path';
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render } from '../../../test-utils/test-utils';
import { AutocompleteWithAnchorMuiReference } from './_AutocompleteWithAnchor.mui-reference';
import { AutocompleteWithAnchor } from './AutocompleteWithAnchor';

/**
 * Differential, jsdom: AutocompleteWithAnchor's click-away on the own ClickAway vs the frozen MUI ClickAwayListener.
 * Same timeline → same onOpenChange log and same open state: click outside closes; clicks in the input, in the
 * portaled listbox (React subtree) and in a separately mounted node behave as with MUI.
 */
type Impl = 'mui' | 'own';
const OPTIONS = [
  { key: 0, value: 'apple', title: 'Apple' },
  { key: 1, value: 'plum', title: 'Plum' },
];

afterEach(() => {
  vi.useRealTimers();
  document.body.innerHTML = '';
});

const go = (impl: Impl, steps: ('trigger' | 'outside' | 'input' | 'option' | 'detached')[]) => {
  vi.useFakeTimers();
  const C = impl === 'mui' ? AutocompleteWithAnchorMuiReference : AutocompleteWithAnchor;
  const log: string[] = [];
  const view = render(
    <C
      onOpenChange={(o) => log.push(`open:${o}`)}
      autocompleteProps={{ options: OPTIONS, optionKey: 'title' } as never}
    >
      <button type="button" data-trigger="">
        {'Pick'}
      </button>
    </C>,
  );
  const outside = document.createElement('div');
  document.body.appendChild(outside);
  const trace: string[] = [];
  for (const step of steps) {
    if (step === 'trigger') fireEvent.click(document.querySelector('[data-trigger]') as HTMLElement);
    if (step === 'outside') {
      fireEvent.mouseDown(outside);
      fireEvent.click(outside);
    }
    if (step === 'input') {
      const input = document.querySelector('.MuiAutocomplete-root input') as HTMLElement | null;
      if (input) {
        fireEvent.mouseDown(input);
        fireEvent.click(input);
      }
    }
    if (step === 'option') {
      const option = document.querySelector('.MuiAutocomplete-option') as HTMLElement | null;
      if (option) fireEvent.click(option);
    }
    if (step === 'detached') {
      const node = document.createElement('div');
      fireEvent.click(node);
    }
    act(() => {
      vi.advanceTimersByTime(50);
    });
    trace.push(`${step}:${log.splice(0).join(',')}:${Boolean(document.querySelector('.MuiAutocomplete-root'))}`);
  }
  view.unmount();
  return trace;
};

describe('AutocompleteWithAnchor click-away on the own core equals MUI', () => {
  const cases: [string, Parameters<typeof go>[1]][] = [
    ['open, click outside closes', ['trigger', 'outside']],
    ['open, click in the input stays open', ['trigger', 'input', 'outside']],
    ['open, type-open listbox, pick an option (portal)', ['trigger', 'input', 'option', 'outside']],
    ['click on a detached node', ['trigger', 'detached']],
  ];
  for (const [name, steps] of cases) {
    it(name, () => {
      expect(go('own', steps)).toEqual(go('mui', steps));
    });
  }
  it('imports nothing from @mui', () => {
    const src = readFileSync(path.join(__dirname, 'AutocompleteWithAnchor.tsx'), 'utf8');
    expect(src).not.toMatch(/from '@mui\//);
  });
});
