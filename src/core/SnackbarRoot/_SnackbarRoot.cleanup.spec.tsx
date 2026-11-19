import { act, render } from '@testing-library/react';
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

/**
 * snackbarService is the consumer path (reachability map): service open → slide in → auto-hide → close → unmount,
 * and a second snackbar replacing an open one, leave no timer, document/window listener or DOM behind.
 * The pub-sub observer lifecycle is covered in _SnackbarRoot.mui.spec.tsx.
 */
type Key = string;
const live = new Map<Key, number>();
const origAdd = EventTarget.prototype.addEventListener;
const origRemove = EventTarget.prototype.removeEventListener;
const winAdd = window.addEventListener;
const winRemove = window.removeEventListener;
const keyOf = (target: EventTarget, type: string, fn: unknown) => {
  const holder = fn as { __leakId?: number };
  holder.__leakId ??= Math.random();
  const name = target === window ? 'window' : target === document ? 'document' : 'node';
  return `${name}:${type}:${holder.__leakId}`;
};
const track = () => {
  live.clear();
  const add = function (this: EventTarget, type: string, fn: unknown, opts?: unknown) {
    if (fn) live.set(keyOf(this, type, fn), (live.get(keyOf(this, type, fn)) ?? 0) + 1);
    return (this === window ? winAdd : origAdd).call(this, type, fn as EventListener, opts as AddEventListenerOptions);
  };
  const remove = function (this: EventTarget, type: string, fn: unknown, opts?: unknown) {
    if (fn) live.set(keyOf(this, type, fn), (live.get(keyOf(this, type, fn)) ?? 0) - 1);
    return (this === window ? winRemove : origRemove).call(
      this,
      type,
      fn as EventListener,
      opts as EventListenerOptions,
    );
  };
  EventTarget.prototype.addEventListener = add as typeof origAdd;
  EventTarget.prototype.removeEventListener = remove as typeof origRemove;
  window.addEventListener = add as typeof winAdd;
  window.removeEventListener = remove as typeof winRemove;
};
const leftovers = () => ({
  listeners: [...live.entries()]
    .filter(([k, n]) => n > 0 && /^(window|document):/.test(k))
    .map(([k]) => k.split(':').slice(0, 2).join(':')),
  timers: vi.getTimerCount(),
  snackbars: document.querySelectorAll('.MuiSnackbar-root').length,
});

afterEach(() => {
  EventTarget.prototype.addEventListener = origAdd;
  EventTarget.prototype.removeEventListener = origRemove;
  window.addEventListener = winAdd;
  window.removeEventListener = winRemove;
  vi.useRealTimers();
});

const mount = async () => {
  vi.resetModules();
  vi.useFakeTimers();
  const { snackbarService } = await import('./SnackBarService');
  const { SnackbarRoot } = await import('./SnackbarRoot');
  // Warm-up (React's once-per-document listeners; jsdom's nwsapi installs document mouseover/mouseout on its first
  // computed-style match), then track.
  const warm = render(<div />);
  getComputedStyle(warm.container);
  warm.unmount();
  track();
  const view = render(<SnackbarRoot />);
  return { snackbarService, view };
};

const advance = (ms: number) =>
  act(() => {
    vi.advanceTimersByTime(ms);
  });

describe('SnackbarRoot (own core) releases its resources', () => {
  it('service open → auto-hide → onClose → exit → unmount', async () => {
    const { snackbarService, view } = await mount();
    const onClose = vi.fn();
    act(() => {
      snackbarService.openSuccessSnackbar('Copied to clipboard', onClose);
    });
    advance(0);
    advance(400);
    expect(document.querySelectorAll('.MuiSnackbar-root').length).toBe(1);
    advance(3000);
    expect(onClose).toHaveBeenCalledTimes(1);
    advance(1000);
    expect(leftovers()).toEqual({ listeners: [], timers: 0, snackbars: 0 });
    view.unmount();
    advance(1000);
    expect(leftovers()).toEqual({ listeners: [], timers: 0, snackbars: 0 });
  });

  it('a second snackbar replacing an open one, then unmount while open', async () => {
    const { snackbarService, view } = await mount();
    act(() => {
      snackbarService.openSuccessSnackbar('First');
    });
    advance(500);
    act(() => {
      snackbarService.openErrorSnackbar('Second');
    });
    advance(0);
    advance(400);
    expect(document.querySelector('.MuiSnackbar-root')?.textContent).toContain('Second');
    view.unmount();
    advance(1000);
    expect(leftovers()).toEqual({ listeners: [], timers: 0, snackbars: 0 });
  });
});
