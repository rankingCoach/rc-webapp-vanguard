import React from 'react';
import { afterEach, expect, test, vi } from 'vitest';
import { ModalService, ModalWindowEvent } from './ModalService';

afterEach(() => ModalService.__resetForTests());

const openWindow = (route: string) => ModalService.open(<div />, {
  fullscreen: true, windowMetadata: { route, projectId: 42 },
});

test('metadata opts in; open and focus emit once, geometry and presentation do not', () => {
  const events: ModalWindowEvent[] = [];
  const unsubscribe = ModalService.subscribeWindowEvents((event) => events.push(event));
  ModalService.open(<div />, { fullscreen: true });
  expect(events).toEqual([]);
  const first = openWindow('/first');
  const second = openWindow('/second');
  expect(events.map((event) => event.type)).toEqual(['activated', 'activated']);
  ModalService.setStackingEnabled(true);
  ModalService.bringToFront(first);
  ModalService.bringToFront(first);
  expect(events).toHaveLength(3);
  expect(events[2]).toMatchObject({ type: 'activated', reason: 'focus', previousWindowId: second, window: { id: first } });
  ModalService.setCompactMode(true);
  ModalService.setCompactWindowControlsEnabled(true);
  ModalService.setCompactWindowBounds(first, { x: 10, y: 10, width: 350, height: 300 });
  ModalService.focusCompactWindow(first);
  ModalService.setCompactWindowInteracting(true);
  ModalService.setCompactWindowInteracting(false);
  ModalService.stackAllCompactWindows();
  expect(events).toHaveLength(3);
  expect(ModalService.getWindows()).toHaveLength(2);
  unsubscribe();
  ModalService.bringToFront(second);
  expect(events).toHaveLength(3);
});

test('close events preserve metadata, distinguish background close and identify the replacement', async () => {
  const first = openWindow('/first');
  const second = openWindow('/second');
  const third = openWindow('/third');
  const events: ModalWindowEvent[] = [];
  ModalService.subscribeWindowEvents((event) => events.push(event));
  await ModalService.closeEv(second);
  expect(events).toHaveLength(1);
  expect(events[0]).toMatchObject({ type: 'closed', wasActive: false, window: { id: second, metadata: { route: '/second' } }, activeWindow: { id: third } });
  await ModalService.closeEv(third);
  expect(events[1]).toMatchObject({ type: 'closed', wasActive: true, activeWindow: { id: first } });
  expect(events[2]).toMatchObject({ type: 'activated', reason: 'close', window: { id: first } });
  expect(ModalService.getActiveWindow()?.id).toBe(first);
  await ModalService.closeEv(first);
  expect(events[3]).toMatchObject({ type: 'closed', wasActive: true, activeWindow: null });
  await ModalService.closeEv(first);
  expect(events).toHaveLength(4);
  expect(ModalService.getWindows()).toEqual([]);
  expect(ModalService.getActiveWindow()).toBeNull();
});

test('metadata replacement is explicit and background changes never activate a window', () => {
  const metadata = { route: '/first' };
  const first = ModalService.open(<div />, { windowMetadata: metadata });
  metadata.route = '/mutated';
  expect(ModalService.getWindow(first)?.metadata.route).toBe('/first');
  const second = openWindow('/second');
  const listener = vi.fn();
  ModalService.subscribeWindowEvents(listener);
  ModalService.setWindowMetadata(first, { route: '/updated' });
  expect(listener).toHaveBeenCalledWith({ type: 'metadataChanged', window: { id: first, metadata: { route: '/updated' } }, isActive: false });
  expect(ModalService.getActiveWindow()?.id).toBe(second);
  ModalService.setWindowMetadata('missing', {});
  expect(listener).toHaveBeenCalledTimes(1);
});

test('stack-limit eviction and closeAll use the same close lifecycle', async () => {
  ModalService.setStackingEnabled(true);
  ModalService.setMaxStackSize(1);
  const first = openWindow('/first');
  const listener = vi.fn();
  ModalService.subscribeWindowEvents(listener);
  const second = openWindow('/second');
  await vi.waitFor(() => expect(ModalService.getWindow(first)).toBeUndefined());
  expect(listener).toHaveBeenCalledWith(expect.objectContaining({ type: 'closed', wasActive: false, window: expect.objectContaining({ id: first }) }));
  ModalService.closeAllModals();
  await vi.waitFor(() => expect(ModalService.getActiveWindow()).toBeNull());
  expect(listener).toHaveBeenCalledWith(expect.objectContaining({ type: 'closed', window: expect.objectContaining({ id: second }) }));
});

test('a failing subscriber cannot prevent opening, closing, or notifying other consumers', async () => {
  const error = vi.spyOn(console, 'error').mockImplementation(() => {});
  try {
    ModalService.subscribeWindowEvents(() => { throw new Error('Consumer failure'); });
    const listener = vi.fn();
    ModalService.subscribeWindowEvents(listener);
    const id = openWindow('/safe');
    expect(ModalService.getActiveWindow()?.id).toBe(id);
    await ModalService.closeEv(id);
    expect(ModalService.getWindow(id)).toBeUndefined();
    expect(listener.mock.calls.map(([event]) => event.type)).toEqual(['activated', 'closed']);
  } finally {
    error.mockRestore();
  }
});
