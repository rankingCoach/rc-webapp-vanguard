import React from 'react';
import { describe, expect, it, beforeEach } from 'vitest';

import { MODAL_BASE_Z_INDEX, ModalService } from './ModalService';

describe('ModalService.getTopmostModalZIndex', () => {
  beforeEach(() => {
    ModalService.__resetForTests();
  });

  it('returns the stacking floor (MODAL_BASE_Z_INDEX) when no modal is open', () => {
    expect(ModalService.getTopmostModalZIndex()).toBe(MODAL_BASE_Z_INDEX);
  });

  it('returns BASE + 1 after opening the first modal', () => {
    ModalService.open(React.createElement('div'));
    expect(ModalService.getTopmostModalZIndex()).toBe(MODAL_BASE_Z_INDEX + 1);
  });

  it('increments with each newly opened modal', () => {
    ModalService.open(React.createElement('div'));
    ModalService.open(React.createElement('div'));
    ModalService.open(React.createElement('div'));
    expect(ModalService.getTopmostModalZIndex()).toBe(MODAL_BASE_Z_INDEX + 3);
  });

  it('keeps reporting the highest order even when an earlier modal is removed', () => {
    const idA = ModalService.open(React.createElement('div'));
    ModalService.open(React.createElement('div'));
    const idC = ModalService.open(React.createElement('div'));
    expect(ModalService.getTopmostModalZIndex()).toBe(MODAL_BASE_Z_INDEX + 3);

    ModalService.removeModalComponent(idA);
    expect(ModalService.getTopmostModalZIndex()).toBe(MODAL_BASE_Z_INDEX + 3);

    ModalService.removeModalComponent(idC);
    expect(ModalService.getTopmostModalZIndex()).toBe(MODAL_BASE_Z_INDEX + 2);
  });

  it('falls back to the stacking floor once all modals are removed', () => {
    const idA = ModalService.open(React.createElement('div'));
    const idB = ModalService.open(React.createElement('div'));
    ModalService.removeModalComponent(idA);
    ModalService.removeModalComponent(idB);
    expect(ModalService.getTopmostModalZIndex()).toBe(MODAL_BASE_Z_INDEX);
  });

  it('reuses freed orders — reopening after a full close starts back at 1', () => {
    const idA = ModalService.open(React.createElement('div'));
    ModalService.removeModalComponent(idA);
    expect(ModalService.getTopmostModalZIndex()).toBe(MODAL_BASE_Z_INDEX);

    ModalService.open(React.createElement('div'));
    expect(ModalService.getTopmostModalZIndex()).toBe(MODAL_BASE_Z_INDEX + 1);
  });

  it('reuses the slot freed by a non-topmost modal — orders are compacted upward', () => {
    const idA = ModalService.open(React.createElement('div'));
    ModalService.open(React.createElement('div'));
    ModalService.open(React.createElement('div'));
    expect(ModalService.getTopmostModalZIndex()).toBe(MODAL_BASE_Z_INDEX + 3);

    ModalService.removeModalComponent(idA);
    expect(ModalService.getTopmostModalZIndex()).toBe(MODAL_BASE_Z_INDEX + 3);

    ModalService.open(React.createElement('div'));
    expect(ModalService.getTopmostModalZIndex()).toBe(MODAL_BASE_Z_INDEX + 4);
  });

  it('counts tracked modals (confirm/accept/loading) the same as plain ones', () => {
    const plainId = ModalService.open(React.createElement('div'));
    ModalService.openConfirmModal({ closeFn: () => {}, message: 'x' });
    expect(ModalService.getTopmostModalZIndex()).toBe(MODAL_BASE_Z_INDEX + 2);

    // Force-remove without going through the async closeEv (setTimeout) for a sync assertion.
    const confirmId = Array.from((ModalService as any).modalOrder.keys()).find(
      (id) => id !== plainId,
    ) as string;
    ModalService.removeModalComponent(confirmId);
    expect(ModalService.getTopmostModalZIndex()).toBe(MODAL_BASE_Z_INDEX + 1);
  });

  it('handles a deep stack (10 modals) without gaps', () => {
    const ids: string[] = [];
    for (let i = 0; i < 10; i++) ids.push(ModalService.open(React.createElement('div')));
    expect(ModalService.getTopmostModalZIndex()).toBe(MODAL_BASE_Z_INDEX + 10);

    for (let i = 10; i >= 1; i--) {
      expect(ModalService.getTopmostModalZIndex()).toBe(MODAL_BASE_Z_INDEX + i);
      ModalService.removeModalComponent(ids[i - 1]);
    }
    expect(ModalService.getTopmostModalZIndex()).toBe(MODAL_BASE_Z_INDEX);
  });

  it('reopening after closing topmost reuses the freed slot', () => {
    ModalService.open(React.createElement('div'));
    ModalService.open(React.createElement('div'));
    const idC = ModalService.open(React.createElement('div'));
    expect(ModalService.getTopmostModalZIndex()).toBe(MODAL_BASE_Z_INDEX + 3);

    ModalService.removeModalComponent(idC);
    expect(ModalService.getTopmostModalZIndex()).toBe(MODAL_BASE_Z_INDEX + 2);

    ModalService.open(React.createElement('div'));
    expect(ModalService.getTopmostModalZIndex()).toBe(MODAL_BASE_Z_INDEX + 3);
  });
});

describe('ModalService.registerPopover', () => {
  beforeEach(() => {
    ModalService.__resetForTests();
  });

  it('places the popover at BASE + 1 when no modal is open', () => {
    expect(ModalService.registerPopover('p1')).toBe(MODAL_BASE_Z_INDEX + 1);
  });

  it('places the popover above the topmost modal', () => {
    ModalService.open(React.createElement('div')); // order 1
    expect(ModalService.registerPopover('p1')).toBe(MODAL_BASE_Z_INDEX + 2);
  });

  it('a modal opened after a popover lands above the popover (covers the stale popover)', () => {
    ModalService.open(React.createElement('div')); // host, order 1
    ModalService.registerPopover('p1'); // order 2
    const overlay = ModalService.open(React.createElement('div')); // should be order 3
    expect(ModalService.getModalOrder(overlay)).toBe(3);
  });

  it('unregisterPopover frees the slot so the next opener reuses the order', () => {
    ModalService.registerPopover('p1'); // order 1
    ModalService.unregisterPopover('p1');
    ModalService.open(React.createElement('div')); // order 1 again
    expect(ModalService.getTopmostModalZIndex()).toBe(MODAL_BASE_Z_INDEX + 1);
  });
});

describe('ModalService.getModalOrder', () => {
  beforeEach(() => {
    ModalService.__resetForTests();
  });

  it('returns 0 for an unknown id', () => {
    expect(ModalService.getModalOrder('nope')).toBe(0);
  });

  it('returns the assigned order for an open modal', () => {
    const id = ModalService.open(React.createElement('div'));
    expect(ModalService.getModalOrder(id)).toBe(1);
  });

  it('returns 0 after the modal is removed', () => {
    const id = ModalService.open(React.createElement('div'));
    ModalService.removeModalComponent(id);
    expect(ModalService.getModalOrder(id)).toBe(0);
  });
});
