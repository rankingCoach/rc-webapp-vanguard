import React from 'react';
import { afterEach, describe, expect, test, vi } from 'vitest';

import { Modal } from './Modal';
import { ModalService } from './ModalService';

afterEach(() => ModalService.__resetForTests());

describe('opt-in compact modal controls', () => {
  test('does not inject controls or change presentation without opt-in', () => {
    const id = ModalService.open(<Modal fullscreen />);
    const component = ModalService.getModalComponent(id);
    expect(component.props.compact).toBeUndefined();
    expect(component.props.expand).toBeUndefined();
    ModalService.compactEv(id);
    expect(component.isCompact).toBeUndefined();
  });

  test('switches a single instance without invoking close listeners or replacing its component', async () => {
    const id = ModalService.open(<Modal fullscreen />, { allowCompact: true });
    const otherId = ModalService.open(<Modal fullscreen />, { allowCompact: true });
    const onClose = vi.fn();
    ModalService.onModalClose(id, onClose);
    const component = ModalService.getModalComponent(id);

    component.props.compact();
    component.props.compact();
    expect(ModalService.getModalComponent(id)).toBe(component);
    expect(component.isCompact).toBe(true);
    expect(ModalService.getModalComponent(otherId).isCompact).toBeUndefined();
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
