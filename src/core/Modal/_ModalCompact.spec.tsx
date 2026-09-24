import React from 'react';
import { afterEach, describe, expect, test, vi } from 'vitest';

import { Modal } from './Modal';
import { ModalService } from './ModalService';
import { OverlayStackingService } from '../OverlayStacking/OverlayStackingService';

afterEach(() => ModalService.__resetForTests());

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
