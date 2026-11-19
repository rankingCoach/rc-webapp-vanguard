import { act, fireEvent, render } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Pagination } from './Pagination';

/** Track g: no timer (ripple) or document/window listener survives paging + unmount; DOM contract; no junk tokens. */
describe('Pagination cleanup and contract', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('focus, press and page, then unmount: no timer, no global listener left', () => {
    const warm = render(<span />);
    getComputedStyle(warm.container); // jsdom nwsapi + React DOM once-per-document listeners
    warm.unmount();
    const added: unknown[] = [];
    const removed: unknown[] = [];
    const proto = EventTarget.prototype;
    const add = proto.addEventListener;
    const remove = proto.removeEventListener;
    const isGlobal = (t: unknown) => t === document || t === window;
    vi.spyOn(proto, 'addEventListener').mockImplementation(function (this: EventTarget, type, fn, opts) {
      if (isGlobal(this)) added.push([this, type, fn]);
      add.call(this, type, fn, opts);
    });
    vi.spyOn(proto, 'removeEventListener').mockImplementation(function (this: EventTarget, type, fn, opts) {
      if (isGlobal(this)) removed.push([this, type, fn]);
      remove.call(this, type, fn, opts);
    });
    const base = vi.getTimerCount();
    const view = render(<Pagination count={5} showFirstButton showLastButton />);
    const next = view.getByRole('button', { name: 'Go to next page' });
    act(() => next.focus());
    fireEvent.mouseDown(next);
    fireEvent.mouseUp(next);
    fireEvent.click(next);
    fireEvent.click(view.getByRole('button', { name: 'Go to last page' }));
    view.unmount();
    act(() => {
      vi.runOnlyPendingTimers();
    });
    expect(vi.getTimerCount()).toBe(base);
    expect(
      added.filter(([t, ty, fn]) => !removed.some(([t2, ty2, fn2]) => t === t2 && ty === ty2 && fn === fn2)),
    ).toEqual([]);
  });

  it('parts carry the own-core marker and slots; state attributes; no junk class tokens', () => {
    const { container } = render(<Pagination count={10} page={5} size="small" shape="rounded" />);
    const nav = container.querySelector('nav') as HTMLElement;
    expect(nav.getAttribute('data-slot')).toBe('pagination');
    expect(nav.getAttribute('data-size')).toBe('small');
    expect(nav.getAttribute('data-shape')).toBe('rounded');
    for (const slot of ['pagination-list', 'pagination-item', 'pagination-ellipsis'])
      expect(container.querySelector(`[data-slot="${slot}"]`)?.hasAttribute('data-vg-core'), slot).toBe(true);
    expect(container.querySelector('[aria-current="page"]')?.getAttribute('data-selected')).toBe('');
    for (const el of container.querySelectorAll('nav, ul, li > div, svg')) {
      const c = el.getAttribute('class');
      if (!c) continue;
      expect(c, c).not.toMatch(/(^|\s)(false|true|undefined|null|NaN)(\s|$)|\s{2,}|^\s|\s$/);
    }
  });
});
