import React from 'react';
import { afterEach, describe, expect, test, vi } from 'vitest';

import { Modal } from './Modal';
import { ModalService } from './ModalService';
import { OverlayStackingService } from '../OverlayStacking/OverlayStackingService';

afterEach(() => ModalService.__resetForTests());

test('viewport fitting preserves attached and detached membership while stacking is disabled', () => {
  ModalService.setCompactMode(true);
  ModalService.setCompactWindowControlsEnabled(true);
  const attached = ModalService.open(<Modal fullscreen />, { fullscreen: true });
  const detached = ModalService.open(<Modal fullscreen />, { fullscreen: true });
  ModalService.setCompactWindowBounds(detached, { x: 20, y: 20, width: 400, height: 400 });
  ModalService.fitCompactWindowToViewport(attached);
  ModalService.fitCompactWindowToViewport(detached);
  expect(ModalService.isCompactWindowDetached(attached)).toBe(false);
  expect(ModalService.isCompactWindowDetached(detached)).toBe(true);
  ModalService.setStackingEnabled(true);
  expect(ModalService.getStackedBamIds()).toContain(attached);
  expect(ModalService.getStackedBamIds()).not.toContain(detached);
});

describe('opt-in compact modal controls', () => {
  test('shared compact mode includes wrapped BAMs and future BAMs, but not ordinary dialogs', () => {
    const first = ModalService.open(<Modal fullscreen />, { fullscreen: true });
    const wrapped = ModalService.open(<div />);
    ModalService.registerFullscreen(wrapped, true);
    const dialog = ModalService.open(<Modal fullscreen={false} />);
    ModalService.setCompactMode(true);
    const added = ModalService.open(<Modal fullscreen />, { fullscreen: true });
    for (const id of [first, wrapped, added]) expect(ModalService.getModalComponent(id).isCompact).toBe(true);
    expect(ModalService.getModalComponent(dialog).isCompact).toBeFalsy();
    ModalService.setCompactMode(false);
    for (const id of [first, wrapped, added]) expect(ModalService.getModalComponent(id).isCompact).toBe(false);
  });

  test('promotion is opt-in and leaves unrelated overlays above the BAM stack', () => {
    const first = ModalService.open(<Modal fullscreen />, { fullscreen: true });
    const second = ModalService.open(<Modal fullscreen />, { fullscreen: true });
    const dialog = ModalService.open(<Modal fullscreen={false} />);
    const dialogZ = OverlayStackingService.getZIndex(dialog);
    ModalService.bringToFront(first);
    expect(ModalService.getBamIds()).toEqual([first, second]);
    ModalService.setStackingEnabled(true);
    ModalService.bringToFront(first);
    expect(ModalService.getBamIds()).toEqual([second, first]);
    expect(OverlayStackingService.getZIndex(first)).toBeLessThan(dialogZ);
    expect(OverlayStackingService.getZIndex(dialog)).toBe(dialogZ);
    ModalService.bringToFront('unknown');
    ModalService.setStackingEnabled(false);
    ModalService.bringToFront(second);
    expect(ModalService.getBamIds()).toEqual([second, first]);
  });
  test('does not inject controls or change presentation without opt-in', () => {
    const id = ModalService.open(<Modal fullscreen />, { fullscreen: true });
    const component = ModalService.getModalComponent(id);
    expect(component.props.compact).toBeUndefined();
    expect(component.props.expand).toBeUndefined();
    ModalService.compactEv(id);
    expect(component.isCompact).toBeFalsy();
  });

  test('switches all BAM instances without invoking close listeners or replacing its component', async () => {
    const id = ModalService.open(<Modal fullscreen />, { allowCompact: true });
    const otherId = ModalService.open(<Modal fullscreen />, { allowCompact: true });
    const onClose = vi.fn();
    ModalService.onModalClose(id, onClose);
    const component = ModalService.getModalComponent(id);

    component.props.compact();
    component.props.compact();
    expect(ModalService.getModalComponent(id)).toBe(component);
    expect(component.isCompact).toBe(true);
    expect(ModalService.getModalComponent(otherId).isCompact).toBe(true);
    expect(onClose).not.toHaveBeenCalled();

    component.props.expand();
    expect(component.isCompact).toBe(false);
    ModalService.compactEv(id);
    await ModalService.closeEv(id, { isOk: false });
    expect(onClose).toHaveBeenCalledExactlyOnceWith({ isOk: false });
    expect(ModalService.getModalComponent(id)).toBeUndefined();
    expect(() => {
      ModalService.compactEv(id);
      ModalService.expandEv(id);
      ModalService.compactEv(null);
      ModalService.expandEv();
    }).not.toThrow();
  });

  test('injects the same controls into wrapped content', () => {
    const id = ModalService.open(<Modal fullscreen />, { allowCompact: true, wrapInModal: true });
    const component = ModalService.getModalComponent(id);
    component.props.children.props.compact();
    expect(component.isCompact).toBe(true);
    component.props.children.props.expand();
    expect(component.isCompact).toBe(false);
  });
});

describe('independent compact window management opt-in', () => {
  const bounds = { x: 40, y: 40, width: 400, height: 300 };
  const open = () => ModalService.open(<Modal fullscreen />, { fullscreen: true });
  test('all management APIs are inert by default, including with stacking and compact enabled', () => {
    const id = open();
    ModalService.setCompactMode(true);
    ModalService.setStackingEnabled(true);
    ModalService.setCompactWindowBounds(id, bounds);
    ModalService.stackAllCompactWindows();
    expect(ModalService.getCompactWindowBounds(id)).toBeUndefined();
    expect(ModalService.isCompactWindowDetached(id)).toBe(false);
    expect(ModalService.isCompactWindowControlsEnabled()).toBe(false);
  });
  test('detaches, rejoins, shares stack geometry and clears state when disabled', () => {
    const first = open(), second = open();
    ModalService.setCompactWindowControlsEnabled(true);
    ModalService.setCompactMode(true);
    ModalService.setStackingEnabled(true);
    const component = ModalService.getModalComponent(first);
    ModalService.setCompactWindowBounds(first, bounds);
    expect(ModalService.getStackedBamIds()).toEqual([second]);
    expect(ModalService.isCompactWindowDetached(first)).toBe(true);
    ModalService.returnCompactWindowToStack(first);
    expect(ModalService.getStackedBamIds()).toEqual([second, first]);
    ModalService.setCompactWindowBounds(first, bounds, true);
    expect(ModalService.getCompactStackBounds()).toEqual(bounds);
    expect(ModalService.getModalComponent(first)).toBe(component);
    ModalService.setCompactWindowBounds(first, bounds);
    ModalService.setCompactWindowControlsEnabled(false);
    expect(ModalService.getCompactWindowBounds(first)).toBeUndefined();
    expect(ModalService.getCompactStackBounds()).toBeUndefined();
    expect(ModalService.getStackedBamIds()).toEqual([second, first]);
    ModalService.setCompactWindowBounds(first, bounds);
    expect(ModalService.getCompactWindowBounds(first)).toBeUndefined();
  });
  test('bounds stay in viewport; fullscreen and regular dialogs cannot be moved', () => {
    const id = open();
    ModalService.setCompactWindowControlsEnabled(true);
    ModalService.setCompactWindowBounds(id, bounds);
    expect(ModalService.getCompactWindowBounds(id)).toBeUndefined();
    ModalService.setCompactMode(true);
    ModalService.setCompactWindowBounds(id, { x: -200, y: -100, width: 10000, height: 10000 });
    expect(ModalService.getCompactWindowBounds(id)).toEqual({ x: 0, y: 0, width: window.innerWidth, height: window.innerHeight });
    ModalService.stackAllCompactWindows();
    expect(ModalService.getCompactWindowBounds(id)).toBeUndefined();
    expect(ModalService.isStackingEnabled()).toBe(true);
  });
});

describe('overlap docking', () => {
  const bounds = { x: 0, y: 0, width: 400, height: 300 };
  const setup = () => {
    const ids = [0, 1, 2].map(() => ModalService.open(<Modal fullscreen />, { fullscreen: true }));
    ModalService.setCompactMode(true);
    ModalService.setCompactWindowControlsEnabled(true);
    return ids;
  };
  test('requires the overlap percentage, includes its boundary, and respects disabled controls', () => {
    const [source, target] = setup();
    const candidates = [{ id: target, bounds }];
    ModalService.setCompactWindowBounds(source, { ...bounds, x: 201 });
    expect(ModalService.findCompactWindowDropTarget(source, candidates)).toBeUndefined();
    ModalService.setCompactWindowBounds(source, { ...bounds, x: 200 });
    expect(ModalService.findCompactWindowDropTarget(source, candidates)?.id).toBe(target);
    ModalService.setCompactWindowDockThreshold(75);
    expect(ModalService.findCompactWindowDropTarget(source, candidates)).toBeUndefined();
    ModalService.setCompactWindowControlsEnabled(false);
    ModalService.dockCompactWindow(source, candidates);
    expect(ModalService.isStackingEnabled()).toBe(false);
  });
  test('forms a stack at the target and leaves unrelated windows floating', () => {
    const [source, target, other] = setup();
    ModalService.setCompactWindowBounds(source, { ...bounds, x: 100 });
    ModalService.setCompactWindowBounds(target, bounds);
    ModalService.dockCompactWindow(source, [{ id: target, bounds }, { id: other, bounds: { ...bounds, x: 600 } }]);
    expect(ModalService.getStackedBamIds()).toEqual([target, source]);
    expect(ModalService.getCompactStackBounds(source)).toEqual(bounds);
    expect(ModalService.isCompactWindowDetached(other)).toBe(true);
  });
});

describe('optional BAM stack maximum', () => {
  const Window = ({ close }: { close: () => void }) => <Modal fullscreen onClose={close} />;
  const open = (close = vi.fn()) => ModalService.open(<Window close={close} />, { fullscreen: true });
  test('unconfigured is unlimited; enabling a maximum keeps newest and closes backmost once', async () => {
    ModalService.setStackingEnabled(true);
    const close = vi.fn();
    const oldest = open(close), second = open(), third = open();
    expect(ModalService.getBamIds()).toHaveLength(3);
    ModalService.setMaxStackSize(3);
    const fourth = open(), fifth = open();
    await vi.waitFor(() => expect(ModalService.getBamIds()).toEqual([third, fourth, fifth]));
    expect(close).toHaveBeenCalledExactlyOnceWith({ isOk: false });
    expect(ModalService.getModalComponent(oldest)).toBeUndefined();
    expect(ModalService.getModalComponent(second)).toBeUndefined();
    ModalService.setMaxStackSize();
    open(); open();
    expect(ModalService.getBamIds()).toHaveLength(5);
  });
  test('uses current stack order and ignores ordinary dialogs and detached windows', async () => {
    ModalService.setStackingEnabled(true);
    ModalService.setCompactWindowControlsEnabled(true);
    ModalService.setCompactMode(true);
    const first = open(), second = open(), floating = open();
    const dialog = ModalService.open(<Modal />);
    ModalService.setCompactWindowBounds(floating, { x: 0, y: 0, width: 400, height: 300 });
    ModalService.bringToFront(first);
    ModalService.setMaxStackSize(2);
    const incoming = open();
    await vi.waitFor(() => expect(ModalService.getModalComponent(second)).toBeUndefined());
    expect(ModalService.getStackedBamIds()).toEqual([first, incoming]);
    expect(ModalService.getModalComponent(dialog)).toBeDefined();
    expect(ModalService.getModalComponent(floating)).toBeDefined();
    ModalService.returnCompactWindowToStack(floating);
    await vi.waitFor(() => expect(ModalService.getModalComponent(first)).toBeUndefined());
    expect(ModalService.getStackedBamIds()).toEqual([incoming, floating]);
  });
  test('does not cap when stacking is disabled; handles wrapped BAM registration and validates limits', async () => {
    ModalService.setMaxStackSize(1);
    const first = open();
    const second = open();
    expect(ModalService.getBamIds()).toHaveLength(2);
    ModalService.setStackingEnabled(true);
    await vi.waitFor(() => expect(ModalService.getModalComponent(first)).toBeUndefined());
    const wrapped = ModalService.open(<div />);
    ModalService.registerFullscreen(wrapped, true);
    await vi.waitFor(() => expect(ModalService.getModalComponent(second)).toBeUndefined());
    expect(ModalService.getStackedBamIds()).toEqual([wrapped]);
    expect(() => ModalService.setMaxStackSize(0)).toThrow(RangeError);
    expect(() => ModalService.setMaxStackSize(1.5)).toThrow(RangeError);
    ModalService.setMaxStackSize(null);
    expect(ModalService.getMaxStackSize()).toBeUndefined();
  });
});

describe('dropping an entire stack', () => {
  test('ignores its own members and merges at the destination without losing stack members', () => {
    ModalService.setCompactWindowControlsEnabled(true);
    ModalService.setCompactMode(true);
    ModalService.setStackingEnabled(true);
    const ids = [0, 1, 2, 3].map(() => ModalService.open(<Modal />, { fullscreen: true }));
    const [back, front, target, unrelated] = ids;
    const bounds = { x: 0, y: 0, width: 400, height: 400 };
    ModalService.setCompactWindowBounds(target, bounds);
    ModalService.setCompactWindowBounds(unrelated, { ...bounds, x: 600 });
    ModalService.setCompactWindowBounds(front, bounds, true);
    const candidates = [{ id: back, bounds }, { id: front, bounds }, { id: target, bounds }];
    expect(ModalService.findCompactWindowDropTarget(front, candidates.slice(0, 2), true)).toBeUndefined();
    expect(ModalService.findCompactWindowDropTarget(front, candidates, true)?.id).toBe(target);
    ModalService.dockCompactWindow(front, candidates, true);
    expect(ModalService.getStackedBamIds()).toEqual([target, back, front]);
    expect(ModalService.getCompactStackBounds(front)).toEqual(bounds);
    expect(ModalService.isCompactWindowDetached(unrelated)).toBe(true);
    expect(ModalService.getBamIds()).toHaveLength(4);
  });
  test('applies the configured cap after merging a stack', async () => {
    ModalService.setCompactWindowControlsEnabled(true);
    ModalService.setCompactMode(true);
    ModalService.setStackingEnabled(true);
    const [back, front, target] = [0, 1, 2].map(() => ModalService.open(<Modal />, { fullscreen: true }));
    const bounds = { x: 0, y: 0, width: 400, height: 400 };
    ModalService.setCompactWindowBounds(target, bounds);
    ModalService.setMaxStackSize(2);
    ModalService.setCompactWindowBounds(front, bounds, true);
    ModalService.dockCompactWindow(front, [{ id: target, bounds }], true);
    await vi.waitFor(() => expect(ModalService.getModalComponent(target)).toBeUndefined());
    expect(ModalService.getStackedBamIds()).toEqual([back, front]);
  });
});

describe('preserving the remaining stack during extraction', () => {
  test('docking an extracted middle BAM onto a floating BAM must not dissolve its previous stack', () => {
    ModalService.setCompactWindowControlsEnabled(true);
    ModalService.setCompactMode(true);
    ModalService.setStackingEnabled(true);
    const [back, middle, front, floating] = [0, 1, 2, 3].map(() => ModalService.open(<Modal />, { fullscreen: true }));
    const bounds = { x: 0, y: 0, width: 400, height: 400 };
    const stackBounds = { x: 550, y: 20, width: 420, height: 500 };
    ModalService.setCompactWindowBounds(front, stackBounds, true);
    ModalService.setCompactWindowBounds(floating, bounds);
    ModalService.setCompactWindowBounds(middle, bounds);
    ModalService.focusCompactWindow(middle);
    ModalService.dockCompactWindow(middle, [
      { id: floating, bounds },
      { id: back, bounds: { ...bounds, x: 600 } },
      { id: front, bounds: { ...bounds, x: 600 } },
    ]);
    expect(ModalService.isCompactWindowDetached(back)).toBe(false);
    expect(ModalService.isCompactWindowDetached(front)).toBe(false);
    expect(ModalService.getCompactStackBounds()).toEqual(stackBounds);
    expect(ModalService.getStackedBamIds(front)).toEqual([back, front]);
    expect(ModalService.getStackedBamIds(middle)).toEqual([floating, middle]);
    expect(ModalService.getCompactStackBounds(middle)).toEqual(bounds);
  });
});


describe('independent compact stacks', () => {
  const original = { x: 540, y: 20, width: 420, height: 500 };
  const separate = { x: 20, y: 20, width: 400, height: 500 };
  const setup = () => {
    ModalService.setCompactWindowControlsEnabled(true);
    ModalService.setCompactMode(true);
    ModalService.setStackingEnabled(true);
    const ids = [0, 1, 2, 3].map(() => ModalService.open(<Modal />, { fullscreen: true }));
    const [a, b, c, d] = ids;
    ModalService.setCompactWindowBounds(b, original, true);
    ModalService.setCompactWindowBounds(c, separate);
    ModalService.setCompactWindowBounds(d, separate);
    ModalService.dockCompactWindow(d, [{ id: c, bounds: separate }]);
    return { a, b, c, d };
  };
  test('move, resize, focus and close affect only the selected stack', async () => {
    const { a, b, c, d } = setup();
    expect(ModalService.getStackedBamIds(b)).toEqual([a, b]);
    expect(ModalService.getStackedBamIds(d)).toEqual([c, d]);
    const resized = { x: 10, y: 40, width: 450, height: 450 };
    ModalService.setCompactWindowBounds(d, resized, true);
    expect(ModalService.getCompactStackBounds(c)).toEqual(resized);
    expect(ModalService.getCompactStackBounds(b)).toEqual(original);
    ModalService.bringToFront(c);
    expect(ModalService.getStackedBamIds(c)).toEqual([d, c]);
    expect(ModalService.getStackedBamIds(b)).toEqual([a, b]);
    await ModalService.closeEv(c);
    expect(ModalService.getStackedBamIds(d)).toEqual([d]);
    expect(ModalService.getCompactStackBounds(d)).toEqual(resized);
    ModalService.stackAllCompactWindows();
    expect(ModalService.getStackedBamIds(b)).toHaveLength(3);
    expect(ModalService.getCompactStackBounds(d)).toEqual(original);
  });
  test('maximum applies per stack and disabling window controls restores one stack', async () => {
    const { a, b, c, d } = setup();
    ModalService.setMaxStackSize(2);
    expect(ModalService.getBamIds()).toHaveLength(4);
    const added = ModalService.open(<Modal />, { fullscreen: true });
    await vi.waitFor(() => expect(ModalService.getModalComponent(a)).toBeUndefined());
    expect(ModalService.getStackedBamIds(b)).toEqual([b, added]);
    expect(ModalService.getStackedBamIds(d)).toEqual([c, d]);
    ModalService.setMaxStackSize();
    ModalService.setCompactWindowControlsEnabled(false);
    expect(ModalService.getStackedBamIds(d)).toHaveLength(4);
    expect(ModalService.getCompactStackBounds(d)).toBeUndefined();
  });
  test('dragging a stack onto a different stack merges only those groups in order', () => {
    const { a, b, c, d } = setup();
    ModalService.setCompactWindowBounds(b, separate, true);
    ModalService.dockCompactWindow(b, [{ id: d, bounds: separate }], true);
    expect(ModalService.getStackedBamIds(d)).toEqual([c, d, a, b]);
    expect(ModalService.getStackedBamIds(a)).toEqual([c, d, a, b]);
    expect(ModalService.getCompactStackBounds(a)).toEqual(separate);
  });
});
