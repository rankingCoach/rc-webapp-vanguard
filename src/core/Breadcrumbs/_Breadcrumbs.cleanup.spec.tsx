import { act, fireEvent, render } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Breadcrumbs } from './Breadcrumbs';

/** Track g: no timer (ripple) or document/window listener survives an expand cycle; DOM contract; no junk class tokens. */
const items = (n: number) =>
  Array.from({ length: n }, (_, i) => (
    <a key={i} href={`#${i}`}>
      {i}
    </a>
  ));

describe('Breadcrumbs cleanup and contract', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('focus, press and expand, then unmount: no timer, no global listener left', () => {
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
    const view = render(<Breadcrumbs maxItems={2}>{items(5)}</Breadcrumbs>);
    const button = view.getByRole('button', { name: 'Show path' });
    act(() => button.focus());
    fireEvent.mouseDown(button);
    fireEvent.mouseUp(button);
    fireEvent.click(button);
    view.unmount();
    act(() => {
      vi.runOnlyPendingTimers();
    });
    expect(vi.getTimerCount()).toBe(base);
    expect(
      added.filter(([t, ty, fn]) => !removed.some(([t2, ty2, fn2]) => t === t2 && ty === ty2 && fn === fn2)),
    ).toEqual([]);
  });

  it('parts carry the own-core marker and slots; expanded state; no junk class tokens', () => {
    const { container, getByRole } = render(<Breadcrumbs maxItems={2}>{items(5)}</Breadcrumbs>);
    const nav = container.querySelector('nav') as HTMLElement;
    expect(nav.getAttribute('data-slot')).toBe('breadcrumbs');
    for (const slot of [
      'breadcrumbs-list',
      'breadcrumbs-item',
      'breadcrumbs-separator',
      'breadcrumbs-collapsed',
      'breadcrumbs-expand',
    ])
      expect(container.querySelector(`[data-slot="${slot}"]`)?.hasAttribute('data-vg-core'), slot).toBe(true);
    expect(nav.hasAttribute('data-expanded')).toBe(false);
    for (const el of container.querySelectorAll('nav, nav ol, nav li, nav svg')) {
      const tokens = (el.getAttribute('class') ?? '').split(' ');
      if (!el.getAttribute('class')) continue;
      expect(
        tokens.filter((t) => t === '' || /^(false|true|undefined|null)$/.test(t)),
        el.outerHTML.slice(0, 80),
      ).toEqual([]);
    }
    fireEvent.click(getByRole('button'));
    expect(nav.getAttribute('data-expanded')).toBe('');
  });
});
