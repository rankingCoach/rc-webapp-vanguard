import { readFileSync } from 'node:fs';
import path from 'node:path';
import { useMediaQuery as muiUseMediaQuery } from '@mui/material';
import { act, render } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';
import { useMediaQuery } from './use-media-query';

/**
 * Own useMediaQuery equals MUI's (string queries, the options Vanguard exposes): initial value, change events,
 * defaultMatches / noSsr, a custom matchMedia, the `@media ` prefix, listener removal on unmount.
 */
const fakeMatchMedia = (initial: Record<string, boolean>) => {
  const lists = new Map<string, { matches: boolean; listeners: Set<() => void> }>();
  const log: string[] = [];
  const matchMedia = (query: string) => {
    if (!lists.has(query)) lists.set(query, { matches: initial[query] ?? false, listeners: new Set() });
    const entry = lists.get(query) as { matches: boolean; listeners: Set<() => void> };
    return {
      get matches() {
        return entry.matches;
      },
      media: query,
      addEventListener: (_: string, fn: () => void) => {
        log.push(`add:${query}`);
        entry.listeners.add(fn);
      },
      removeEventListener: (_: string, fn: () => void) => {
        log.push(`remove:${query}`);
        entry.listeners.delete(fn);
      },
    } as unknown as MediaQueryList;
  };
  const set = (query: string, matches: boolean) => {
    const entry = lists.get(query);
    if (!entry) return;
    entry.matches = matches;
    for (const fn of Array.from(entry.listeners)) fn();
  };
  return { matchMedia, set, log };
};

type Hook = typeof useMediaQuery;
const run = (hook: Hook, query: string, options: Parameters<Hook>[1], steps: [string, boolean][]) => {
  const values: boolean[] = [];
  const fake = fakeMatchMedia({ '(min-width:1025px)': true });
  const Probe = () => {
    values.push(hook(query, { ...options, matchMedia: options?.matchMedia === null ? undefined : fake.matchMedia }));
    return null;
  };
  const view = render(<Probe />);
  for (const [q, m] of steps) act(() => fake.set(q, m));
  view.unmount();
  return { values, log: fake.log };
};

describe('useMediaQuery own core equals MUI', () => {
  const cases: [string, string, Parameters<Hook>[1], [string, boolean][]][] = [
    [
      'matching query, then change',
      '(min-width:1025px)',
      {},
      [
        ['(min-width:1025px)', false],
        ['(min-width:1025px)', true],
      ],
    ],
    ['non-matching query', '(max-width:600px)', {}, [['(max-width:600px)', true]]],
    ['defaultMatches true', '(max-width:600px)', { defaultMatches: true }, []],
    ['noSsr', '(min-width:1025px)', { noSsr: true }, [['(min-width:1025px)', false]]],
    ['@media prefix stripped', '@media (min-width:1025px)', {}, [['(min-width:1025px)', false]]],
  ];
  for (const [name, query, options, steps] of cases) {
    it(name, () => {
      expect(run(useMediaQuery, query, options, steps)).toEqual(run(muiUseMediaQuery as Hook, query, options, steps));
    });
  }
  it('imports nothing from @mui', () => {
    const src = readFileSync(path.join(__dirname, 'use-media-query.ts'), 'utf8');
    expect(src).not.toMatch(/from '@mui\//);
  });
});
