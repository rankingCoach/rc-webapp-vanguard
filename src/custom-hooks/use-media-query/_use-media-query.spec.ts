import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, test, vi } from 'vitest';

import { useMediaQuery } from './use-media-query';

type Listener = (event: MediaQueryListEvent) => void;

const installMatchMedia = (initial: Record<string, boolean>) => {
  const state = { ...initial };
  const listeners = new Map<string, Set<Listener>>();
  const matchMedia = vi.fn((query: string) => {
    const set = listeners.get(query) ?? new Set<Listener>();
    listeners.set(query, set);
    return {
      get matches() {
        return state[query] ?? false;
      },
      media: query,
      onchange: null,
      addListener: (listener: Listener) => set.add(listener),
      removeListener: (listener: Listener) => set.delete(listener),
      addEventListener: (_type: string, listener: Listener) => set.add(listener),
      removeEventListener: (_type: string, listener: Listener) => set.delete(listener),
      dispatchEvent: () => true,
    } as unknown as MediaQueryList;
  });
  const original = window.matchMedia;
  window.matchMedia = matchMedia;
  const change = (query: string, matches: boolean) => {
    state[query] = matches;
    for (const listener of listeners.get(query) ?? []) listener({ matches, media: query } as MediaQueryListEvent);
  };
  return { change, restore: () => (window.matchMedia = original) };
};

describe('useMediaQuery', () => {
  let restore: () => void = () => undefined;
  afterEach(() => restore());

  test('returns the current match for a string query', () => {
    const media = installMatchMedia({ '(min-width:1025px)': true });
    restore = media.restore;
    const { result } = renderHook(() => useMediaQuery('(min-width:1025px)'));
    expect(result.current).toBe(true);
  });

  test('updates when the query starts or stops matching', () => {
    const media = installMatchMedia({ '(max-width:767px)': false });
    restore = media.restore;
    const { result } = renderHook(() => useMediaQuery('(max-width:767px)'));
    expect(result.current).toBe(false);
    act(() => media.change('(max-width:767px)', true));
    expect(result.current).toBe(true);
    act(() => media.change('(max-width:767px)', false));
    expect(result.current).toBe(false);
  });

  test('noSsr reads the match on the first render', () => {
    const media = installMatchMedia({ '(min-width:1025px)': true });
    restore = media.restore;
    const firstValues: boolean[] = [];
    renderHook(() => {
      const value = useMediaQuery('(min-width:1025px)', { noSsr: true });
      firstValues.push(value);
      return value;
    });
    expect(firstValues[0]).toBe(true);
  });
});
