import { PUB_SUB_EVENTS, pubSubService } from '@helpers/pub-sub';
import { PublicWidgetData } from '@stores/public-widgets-data.store';
import React from 'react';
import { afterEach, describe, expect, test, vi } from 'vitest';

import { OverlayStackingService } from '../OverlayStacking/OverlayStackingService';
import { ModalService, ModalWindowEvent } from './ModalService';

const originalWindowSize = { width: window.innerWidth, height: window.innerHeight };
const bounds = { x: 20, y: 30, width: 400, height: 300 };

const setViewport = (width: number, height: number) => {
  Object.defineProperty(window, 'innerWidth', { configurable: true, value: width });
  Object.defineProperty(window, 'innerHeight', { configurable: true, value: height });
};

let publishSpy: ReturnType<typeof vi.spyOn> | undefined;
let consoleErrorSpy: ReturnType<typeof vi.spyOn> | undefined;
let getPublicWidgetDataSpy: ReturnType<typeof vi.spyOn> | undefined;

const openWindow = (label: string, opts = {}) =>
  ModalService.open(<div data-label={label} />, {
    fullscreen: true,
    windowMetadata: { label },
    ...opts,
  });

const compactEvents = (spy: ReturnType<typeof vi.spyOn>) =>
  spy.mock.calls.filter(([event]) => event === PUB_SUB_EVENTS.reactModalCompactChange);

afterEach(() => {
  ModalService.__resetForTests();
  OverlayStackingService.__resetForTests();
  publishSpy?.mockRestore();
  consoleErrorSpy?.mockRestore();
  getPublicWidgetDataSpy?.mockRestore();
  publishSpy = undefined;
  consoleErrorSpy = undefined;
  getPublicWidgetDataSpy = undefined;
  setViewport(originalWindowSize.width, originalWindowSize.height);
});

describe('opening windowed modals', () => {
  test('registers metadata, presentation and active window after stack enforcement', async () => {
    ModalService.setStackingEnabled(true);
    ModalService.setMaxStackSize(1);
    const events: ModalWindowEvent[] = [];
    const presentations = vi.fn();
    ModalService.subscribeWindowEvents((event) => events.push(event));
    ModalService.subscribePresentation(presentations);

    const Closable: React.FC<{ close: () => void }> = () => <div />;
    const evictedClose = vi.fn(() => openWindow('reopened'));
    const evicted = ModalService.open(<Closable close={evictedClose} />, {
      fullscreen: true,
      windowMetadata: { label: 'evicted' },
    });
    const keeper = openWindow('keeper');

    await vi.waitFor(() => expect(ModalService.getWindow(evicted)).toBeUndefined());
    const ids = ModalService.getWindows().map((window) => window.id);
    expect(ids).toHaveLength(1);
    expect(ids[0]).not.toBe(evicted);
    expect(ids[0]).not.toBe(keeper);
    expect(evictedClose).toHaveBeenCalledExactlyOnceWith({ isOk: false });
    expect(events.map((event) => event.type)).toEqual(['activated', 'activated', 'closed', 'closed']);
    expect(events[1]).toMatchObject({
      type: 'activated',
      reason: 'open',
      previousWindowId: evicted,
      window: { metadata: { label: 'reopened' } },
    });
    expect(events[2]).toMatchObject({
      type: 'closed',
      wasActive: false,
      window: { id: keeper },
      activeWindow: { metadata: { label: 'reopened' } },
    });
    expect(events[3]).toMatchObject({
      type: 'closed',
      wasActive: false,
      window: { id: evicted },
      activeWindow: { metadata: { label: 'reopened' } },
    });
    expect(ModalService.getActiveWindow()?.metadata).toEqual({ label: 'reopened' });
    expect(presentations).toHaveBeenCalled();
  });

  test('pins compact controls and stored flags for wrapped and unwrapped opens', () => {
    ModalService.setCompactMode(true);
    const plain = ModalService.open(<div />, { fullscreen: true });
    const controlled = ModalService.open(<div />, { allowCompact: true });
    const wrapped = ModalService.open(<div />, { allowCompact: true, wrapInModal: true, title: 'Wrapped' });
    const wrappedWithoutControls = ModalService.open(<div />, { wrapInModal: true });
    const wrappedElement = ModalService.getModalComponent(wrapped).type(ModalService.getModalComponent(wrapped).props);

    expect(ModalService.getModalComponent(plain)).toMatchObject({
      isFullscreen: true,
      isCompact: true,
      compactManaged: true,
    });
    expect(ModalService.getModalComponent(plain).props.compact).toBeUndefined();
    expect(ModalService.getModalComponent(controlled)).toMatchObject({
      isFullscreen: false,
      isCompact: true,
      compactManaged: true,
    });
    expect(ModalService.getModalComponent(controlled).props.compact).toEqual(expect.any(Function));
    expect(ModalService.getModalComponent(controlled).props.expand).toEqual(expect.any(Function));
    expect(ModalService.getModalComponent(wrapped).props.compact).toEqual(expect.any(Function));
    expect(ModalService.getModalComponent(wrapped).props.children.props.compact).toEqual(expect.any(Function));
    expect(ModalService.getModalComponent(wrapped).props.children.props.expand).toEqual(expect.any(Function));
    expect(ModalService.getModalComponent(wrappedWithoutControls).props.compact).toBeUndefined();
    expect(ModalService.getModalComponent(wrappedWithoutControls).props.children.props.compact).toBeUndefined();
    expect(wrappedElement.props.children[0].props.closeFn).toEqual(expect.any(Function));
  });

  test('suffixes modal ids with the public widget id when present', () => {
    getPublicWidgetDataSpy = vi.spyOn(PublicWidgetData, 'getInstance').mockReturnValue({
      get: () => ({ widgetId: 'widget-123' }),
    } as any);
    const id = ModalService.open(<div />, { windowMetadata: { label: 'widget' } });
    expect(id).toMatch(/_widget-123$/);
    expect(ModalService.getWindow(id)).toEqual({ id, metadata: { label: 'widget' } });
  });
});

describe('compact state and publications', () => {
  test('publishes compact changes only when the managed state actually changes', () => {
    publishSpy = vi.spyOn(pubSubService, '$pub');
    const managed = ModalService.open(<div />, { allowCompact: true });
    const fullscreen = ModalService.open(<div />, { fullscreen: true });
    const plain = ModalService.open(<div />);

    ModalService.compact(managed);
    ModalService.compactEv(managed);
    ModalService.compact(plain);
    ModalService.expand(null);
    ModalService.expandEv();
    ModalService.expand(managed);
    ModalService.registerFullscreen(plain, true);
    ModalService.registerFullscreen(plain, true);
    ModalService.registerFullscreen(plain, false);
    ModalService.setCompactMode(true);
    ModalService.setCompactMode(true);

    expect(compactEvents(publishSpy!)).toEqual([
      [PUB_SUB_EVENTS.reactModalCompactChange, { modalId: managed, isCompact: true }],
      [PUB_SUB_EVENTS.reactModalCompactChange, { modalId: fullscreen, isCompact: true }],
      [PUB_SUB_EVENTS.reactModalCompactChange, { modalId: managed, isCompact: false }],
      [PUB_SUB_EVENTS.reactModalCompactChange, { modalId: fullscreen, isCompact: false }],
      [PUB_SUB_EVENTS.reactModalCompactChange, { modalId: managed, isCompact: true }],
      [PUB_SUB_EVENTS.reactModalCompactChange, { modalId: fullscreen, isCompact: true }],
    ]);
    expect(ModalService.getBamIds()).toEqual([fullscreen]);
    expect(ModalService.getModalComponent(managed)).toMatchObject({ isCompact: true, compactManaged: true });
  });

  test('metadata updates and failing window listeners preserve listener order', () => {
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const first = openWindow('first');
    const second = openWindow('second');
    const events: ModalWindowEvent[] = [];
    ModalService.subscribeWindowEvents(() => {
      throw new Error('boom');
    });
    ModalService.subscribeWindowEvents((event) => events.push(event));

    ModalService.setWindowMetadata(first, { label: 'first-updated' });
    ModalService.setWindowMetadata('missing', { label: 'ignored' });
    ModalService.setWindowMetadata(second, { label: 'second-updated' });

    expect(events).toEqual([
      { type: 'metadataChanged', window: { id: first, metadata: { label: 'first-updated' } }, isActive: false },
      { type: 'metadataChanged', window: { id: second, metadata: { label: 'second-updated' } }, isActive: true },
    ]);
    expect(consoleErrorSpy).toHaveBeenCalledTimes(2);
    expect(consoleErrorSpy.mock.calls[0][0]).toBe('Modal window listener failed');
  });
});

describe('compact window geometry and docking guards', () => {
  const setup = () => {
    ModalService.setCompactWindowControlsEnabled(true);
    ModalService.setCompactMode(true);
    return [openWindow('a'), openWindow('b'), openWindow('c')];
  };

  test('clamps bounds, ignores non-finite bounds and fits stacks to the viewport', () => {
    setViewport(300, 200);
    const [first, second] = setup();
    ModalService.setCompactWindowBounds(first, { x: -10, y: 999, width: 20, height: 999 });
    expect(ModalService.getCompactWindowBounds(first)).toEqual({ x: 0, y: 0, width: 300, height: 200 });
    ModalService.setCompactWindowBounds(first, { ...bounds, x: Number.NaN });
    expect(ModalService.getCompactWindowBounds(first)).toEqual({ x: 0, y: 0, width: 300, height: 200 });

    setViewport(1000, 800);
    ModalService.returnCompactWindowToStack(first);
    ModalService.setCompactWindowBounds(second, { x: 900, y: 700, width: 500, height: 500 }, true);
    ModalService.fitCompactWindowToViewport(second);
    expect(ModalService.getCompactStackBounds(second)).toEqual({ x: 500, y: 300, width: 500, height: 500 });
    ModalService.fitCompactWindowToViewport('unknown');
  });

  test('invalid dock thresholds are ignored and grouping requires attached stacking', () => {
    const [source, target, detached] = setup();
    const top = openWindow('top');
    const candidates = [
      { id: target, bounds },
      { id: detached, bounds: { ...bounds, x: 600 } },
      { id: top, bounds },
    ];
    ModalService.setCompactWindowBounds(source, { ...bounds, x: 219 });
    ModalService.setCompactWindowBounds(target, bounds);
    ModalService.setCompactWindowDockThreshold(0);
    ModalService.setCompactWindowDockThreshold(101);
    ModalService.setCompactWindowDockThreshold(Number.NaN);
    expect(ModalService.findCompactWindowDropTarget(source, candidates)?.id).toBe(top);
    ModalService.setCompactWindowDockThreshold(51);
    expect(ModalService.findCompactWindowDropTarget(source, candidates)).toBeUndefined();

    ModalService.setCompactWindowBounds(detached, bounds);
    expect(ModalService.findCompactWindowDropTarget(detached, candidates, true)).toBeUndefined();
    ModalService.returnCompactWindowToStack(detached);
    ModalService.setStackingEnabled(false);
    expect(ModalService.findCompactWindowDropTarget(detached, candidates, true)).toBeUndefined();
  });

  test('docking while stacking is disabled preserves unrelated floating candidates', () => {
    const [source, target, unrelated] = setup();
    ModalService.setCompactWindowBounds(source, { ...bounds, x: 40 });
    ModalService.dockCompactWindow(source, [
      { id: target, bounds },
      { id: unrelated, bounds: { ...bounds, x: 700 } },
    ]);
    expect(ModalService.isStackingEnabled()).toBe(true);
    expect(ModalService.getStackedBamIds(source)).toEqual([target, source]);
    expect(ModalService.getCompactStackBounds(source)).toEqual(bounds);
    expect(ModalService.getCompactWindowBounds(unrelated)).toEqual({ ...bounds, x: 700 });
  });
});

describe('focus, active removal and stack limits', () => {
  test('focuses compact groups, ignores no-op focus, and reports close replacement order', async () => {
    const events: ModalWindowEvent[] = [];
    ModalService.subscribeWindowEvents((event) => events.push(event));
    ModalService.setStackingEnabled(true);
    ModalService.setCompactWindowControlsEnabled(true);
    ModalService.setCompactMode(true);
    const first = openWindow('first');
    const second = openWindow('second');
    const third = openWindow('third');
    const zBefore = OverlayStackingService.getZIndex(second);

    ModalService.bringToFront(second);
    ModalService.bringToFront(second);
    expect(OverlayStackingService.getZIndex(second)).toBeGreaterThan(zBefore);
    await ModalService.closeEv(second);
    await ModalService.closeEv(first);

    expect(events.map((event) => event.type)).toEqual([
      'activated',
      'activated',
      'activated',
      'activated',
      'closed',
      'activated',
      'closed',
    ]);
    expect(events[3]).toMatchObject({
      type: 'activated',
      reason: 'focus',
      previousWindowId: third,
      window: { id: second },
    });
    expect(events[4]).toMatchObject({
      type: 'closed',
      wasActive: true,
      window: { id: second },
      activeWindow: { id: third },
    });
    expect(events[5]).toMatchObject({
      type: 'activated',
      reason: 'close',
      previousWindowId: second,
      window: { id: third },
    });
    expect(events[6]).toMatchObject({
      type: 'closed',
      wasActive: false,
      window: { id: first },
      activeWindow: { id: third },
    });
  });

  test('validates and resets maximum stack size through every public reset value', () => {
    expect(() => ModalService.setMaxStackSize(0)).toThrow(RangeError);
    expect(() => ModalService.setMaxStackSize(1.5)).toThrow(RangeError);
    ModalService.setMaxStackSize(1);
    expect(ModalService.getMaxStackSize()).toBe(1);
    ModalService.setMaxStackSize(null);
    expect(ModalService.getMaxStackSize()).toBeUndefined();
    ModalService.setMaxStackSize(1);
    ModalService.setMaxStackSize(undefined);
    expect(ModalService.getMaxStackSize()).toBeUndefined();
  });

  test('interaction state is owner-scoped and cleared by owner removal or disabled controls', async () => {
    const presentations = vi.fn();
    ModalService.subscribePresentation(presentations);
    const first = openWindow('first');
    const second = openWindow('second');

    ModalService.setCompactWindowInteracting(true, first);
    expect(ModalService.isCompactWindowInteracting()).toBe(false);
    ModalService.setCompactWindowControlsEnabled(true);
    ModalService.setCompactWindowInteracting(true, first);
    ModalService.setCompactWindowInteracting(true, second);
    ModalService.setCompactWindowInteracting(false, first);
    expect(ModalService.isCompactWindowInteracting()).toBe(true);
    await ModalService.closeEv(second);
    expect(ModalService.isCompactWindowInteracting()).toBe(false);
    ModalService.setCompactWindowInteracting(true);
    ModalService.setCompactWindowControlsEnabled(false);
    expect(ModalService.isCompactWindowInteracting()).toBe(false);
    expect(presentations).toHaveBeenCalled();
    expect(ModalService.getPresentationRevision()).toBeGreaterThan(0);
  });
});
