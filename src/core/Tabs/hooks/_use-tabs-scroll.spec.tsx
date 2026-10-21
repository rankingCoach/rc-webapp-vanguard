import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, test, vi } from 'vitest';

import { useTabsScroll } from './use-tabs-scroll';

/** A 300px viewport over 1000px of tabs, scrolled to `scrollLeft`, with `scrollTo` mocked. */
const makeScroller = (scrollLeft: number, dir: 'ltr' | 'rtl' = 'ltr') => {
  const scroller = document.createElement('div');
  scroller.style.direction = dir;
  Object.defineProperty(scroller, 'scrollWidth', { configurable: true, value: 1000 });
  Object.defineProperty(scroller, 'clientWidth', { configurable: true, value: 300 });
  Object.defineProperty(scroller, 'scrollLeft', { configurable: true, value: scrollLeft, writable: true });
  const scrollTo = vi.fn();
  scroller.scrollTo = scrollTo as unknown as typeof scroller.scrollTo;
  document.body.appendChild(scroller);
  return { scroller, scrollTo };
};

/** Renders the hook, attaches the scroller and re-measures (a new layoutKey runs the layout effect again). */
const renderWithScroller = (scroller: HTMLDivElement) => {
  const hook = renderHook(({ layoutKey }) => useTabsScroll({ currentValue: 0, layoutKey }), {
    initialProps: { layoutKey: 'a' },
  });
  hook.result.current.scrollerRef.current = scroller;
  act(() => hook.rerender({ layoutKey: 'b' }));
  return hook;
};

describe('useTabsScroll', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  test('LTR: the start button scrolls to 0 and the end button to the far right', () => {
    const { scroller, scrollTo } = makeScroller(200);
    const { result } = renderWithScroller(scroller);

    act(() => result.current.scrollToEnd());
    expect(scrollTo).toHaveBeenLastCalledWith({ left: 700, behavior: 'smooth' });

    act(() => result.current.scrollToStart());
    expect(scrollTo).toHaveBeenLastCalledWith({ left: 0, behavior: 'smooth' });
  });

  test('RTL: the end is the far left (negative scrollLeft), the start is 0', () => {
    const { scroller, scrollTo } = makeScroller(-200, 'rtl');
    const { result } = renderWithScroller(scroller);

    act(() => result.current.scrollToEnd());
    expect(scrollTo).toHaveBeenLastCalledWith({ left: -700, behavior: 'smooth' });

    act(() => result.current.scrollToStart());
    expect(scrollTo).toHaveBeenLastCalledWith({ left: 0, behavior: 'smooth' });
  });

  test.each([
    { dir: 'ltr' as const, scrollLeft: 0, start: false, end: true },
    { dir: 'ltr' as const, scrollLeft: 300, start: true, end: true },
    { dir: 'ltr' as const, scrollLeft: 700, start: true, end: false },
    { dir: 'rtl' as const, scrollLeft: 0, start: false, end: true },
    { dir: 'rtl' as const, scrollLeft: -300, start: true, end: true },
    { dir: 'rtl' as const, scrollLeft: -700, start: true, end: false },
  ])('$dir at scrollLeft $scrollLeft: canScrollStart=$start, canScrollEnd=$end', ({ dir, scrollLeft, start, end }) => {
    const { scroller } = makeScroller(scrollLeft, dir);
    const { result } = renderWithScroller(scroller);

    expect(result.current.canScrollStart).toBe(start);
    expect(result.current.canScrollEnd).toBe(end);
    expect(result.current.isOverflowing).toBe(true);
  });
});
