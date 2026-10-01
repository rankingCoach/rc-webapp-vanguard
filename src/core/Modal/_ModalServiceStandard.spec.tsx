import { PUB_SUB_EVENTS, pubSubService } from '@helpers/pub-sub';
import React from 'react';
import { afterEach, describe, expect, test, vi } from 'vitest';

import { PhotoCarouselModal } from '../CustomModals/PhotoCarouselModal/PhotoCarouselModal';
import { AcceptModal } from '../StandardModals/AcceptModal/AcceptModal';
import { ConfirmModal } from '../StandardModals/ConfirmModal/ConfirmModal';
import { ErrorModal } from '../StandardModals/ErrorModal/ErrorModal';
import { LoadingModal } from '../StandardModals/LoadingModal/LoadingModal';
import { ModalService } from './ModalService';

afterEach(() => {
  ModalService.__resetForTests();
  vi.restoreAllMocks();
});

describe('on()', () => {
  test('registers a document listener that forwards event.detail to the callback', () => {
    const add = vi.spyOn(document, 'addEventListener');
    const cb = vi.fn();
    ModalService.on('my-event', cb);
    expect(add).toHaveBeenCalledWith('my-event', expect.any(Function));
    const handler = add.mock.calls[0][1] as (e: Event) => void;
    const detail = { foo: 'bar' };
    handler({ detail } as any);
    expect(cb).toHaveBeenCalledWith(detail);
  });
});

describe('onModalClose / cleanModalClose', () => {
  test('cleanModalClose removes queued callbacks so a subsequent close does not invoke them', async () => {
    const id = ModalService.open(<div />);
    const cb = vi.fn();
    ModalService.onModalClose(id, cb);
    ModalService.cleanModalClose(id);
    await ModalService.closeEv(id, { isOk: true });
    expect(cb).not.toHaveBeenCalled();
  });

  test('cleanModalClose on an id with no listeners never throws', () => {
    expect(() => ModalService.cleanModalClose('unknown')).not.toThrow();
  });
});

describe('openConfirmModal', () => {
  test('options-object overload opens a ConfirmModal with the given fields and tracks it as the confirm modal', () => {
    const closeFn = vi.fn();
    const modalId = ModalService.openConfirmModal({
      closeFn,
      title: 'Delete item',
      message: 'Are you sure?',
      positiveCtaText: 'Yes',
      negativeCtaText: 'No',
    });
    const component = ModalService.getModalComponent(modalId);
    expect(component.type).toBe(ConfirmModal);
    expect(component.props.title).toBe('Delete item');
    expect(component.props.message).toBe('Are you sure?');
    expect(component.props.positiveCtaText).toBe('Yes');
    expect(component.props.negativeCtaText).toBe('No');
    // closeConfirmModal targets the id captured internally, not the returned id.
    ModalService.closeConfirmModal();
  });

  test('deprecated positional overload maps every positional argument into the same fields', () => {
    const closeFn = vi.fn();
    const customNegativeFn = vi.fn();
    const modalId = ModalService.openConfirmModal(
      closeFn,
      'Positional title',
      'Positional message',
      'Positive',
      'Negative',
      'warning',
      'icon-warning' as any,
      { a: '1' },
      true,
      customNegativeFn,
      true,
    );
    const component = ModalService.getModalComponent(modalId);
    expect(component.props.title).toBe('Positional title');
    expect(component.props.message).toBe('Positional message');
    expect(component.props.positiveCtaText).toBe('Positive');
    expect(component.props.negativeCtaText).toBe('Negative');
    expect(component.props.headerType).toBe('warning');
    expect(component.props.positiveIconLeft).toBe('icon-warning');
    expect(component.props.replacements).toEqual({ a: '1' });
    expect(component.props.hideHeaderCloseBtn).toBe(true);
    expect(component.props.customNegativeFn).toBe(customNegativeFn);
    // NOTE: hideNegativeBtn is accepted as an option/positional param but is never
    // forwarded to ConfirmModal's props by openConfirmModal (dropped on the floor) — see report.
  });

  test('deprecated overload applies documented defaults when optional args are omitted', () => {
    const closeFn = vi.fn();
    const modalId = ModalService.openConfirmModal(closeFn);
    const component = ModalService.getModalComponent(modalId);
    expect(component.props.title).toBe('');
    expect(component.props.message).toBe('');
    expect(component.props.positiveCtaText).toBe('');
    expect(component.props.negativeCtaText).toBe('');
    expect(component.props.headerType).toBe('default');
  });

  test('closeConfirmModal resolves via the promise-based close lifecycle and clears the tracked id', async () => {
    const modalId = ModalService.openConfirmModal({
      closeFn: () => {},
    });
    const spy = vi.spyOn(pubSubService, '$pub');
    ModalService.closeConfirmModal();
    await vi.waitFor(() => expect(ModalService.getModalComponent(modalId)).toBeUndefined());
    expect(spy).toHaveBeenCalledWith(PUB_SUB_EVENTS.reactModalClose, { modalId });
    // closeConfirmModal only fires the service-level close event; the component's own
    // close prop (which resolves closeFn) is invoked by the consumer, not by closeConfirmModal.
    ModalService.closeConfirmModal();
  });

  test('closeConfirmModal with no confirm modal open resolves without throwing', async () => {
    await expect(ModalService.closeEv(null)).resolves.toBeUndefined();
    expect(() => ModalService.closeConfirmModal()).not.toThrow();
  });
});

describe('openAcceptModal', () => {
  test('options-object overload opens an AcceptModal with the given fields', () => {
    const closeFn = vi.fn();
    const modalId = ModalService.openAcceptModal({
      closeFn,
      title: 'Accepted',
      message: 'Thanks',
      positiveCtaText: 'OK',
      headerType: 'success',
    });
    const component = ModalService.getModalComponent(modalId);
    expect(component.type).toBe(AcceptModal);
    expect(component.props.title).toBe('Accepted');
    expect(component.props.message).toBe('Thanks');
    expect(component.props.positiveCtaText).toBe('OK');
    expect(component.props.headerType).toBe('success');
  });

  test('deprecated positional overload maps every positional argument into the same fields', () => {
    const closeFn = vi.fn();
    const modalId = ModalService.openAcceptModal(
      closeFn,
      'Positional title',
      'Positional message',
      'warning',
      'Positive',
      { x: '1' },
      true,
    );
    const component = ModalService.getModalComponent(modalId);
    expect(component.props.title).toBe('Positional title');
    expect(component.props.message).toBe('Positional message');
    expect(component.props.headerType).toBe('warning');
    expect(component.props.positiveCtaText).toBe('Positive');
    expect(component.props.replacements).toEqual({ x: '1' });
    expect(component.props.hideHeaderCloseBtn).toBe(true);
  });

  test('deprecated overload applies documented defaults when optional args are omitted', () => {
    const closeFn = vi.fn();
    const modalId = ModalService.openAcceptModal(closeFn);
    const component = ModalService.getModalComponent(modalId);
    expect(component.props.title).toBe('');
    expect(component.props.message).toBe('');
    expect(component.props.headerType).toBe('default');
    expect(component.props.positiveCtaText).toBe('');
  });

  test('openAcceptModal also updates the shared confirmModalId tracked by closeConfirmModal', async () => {
    ModalService.openAcceptModal({ closeFn: vi.fn() });
    const spy = vi.spyOn(pubSubService, '$pub');
    ModalService.closeConfirmModal();
    await vi.waitFor(() => expect(spy).toHaveBeenCalledWith(PUB_SUB_EVENTS.reactModalClose, expect.any(Object)));
  });
});

describe('openLoadingModal / closeLoadingModal', () => {
  test('options-object overload opens a LoadingModal with fixed presentation opts', () => {
    const modalId = ModalService.openLoadingModal({
      title: 'Loading title',
      message: 'Please wait',
      loadingAnimation: 'rocket',
      headerTitle: 'Header',
    });
    const component = ModalService.getModalComponent(modalId);
    expect(component.type).toBe(LoadingModal);
    expect(component.props.title).toBe('Loading title');
    expect(component.props.message).toBe('Please wait');
    expect(component.props.loadingAnimation).toBe('rocket');
    expect(component.props.headerTitle).toBe('Header');
    expect(component.props.fullscreen).toBe(false);
    expect(component.props.maxWidth).toBe('650px');
    expect(component.props.modalPosition).toBe('center');
    expect(component.props.backgroundColor).toBe('var(--n000)');
  });

  test('deprecated positional overload maps every positional argument', () => {
    const modalId = ModalService.openLoadingModal('T', 'M', 'ai', 'H');
    const component = ModalService.getModalComponent(modalId);
    expect(component.props.title).toBe('T');
    expect(component.props.message).toBe('M');
    expect(component.props.loadingAnimation).toBe('ai');
    expect(component.props.headerTitle).toBe('H');
  });

  test('default loadingAnimation is "default" when omitted', () => {
    const modalId = ModalService.openLoadingModal();
    expect(ModalService.getModalComponent(modalId).props.loadingAnimation).toBe('default');
  });

  test('closeLoadingModal closes the tracked loading modal and clears the id, idempotently', async () => {
    const modalId = ModalService.openLoadingModal();
    ModalService.closeLoadingModal();
    await vi.waitFor(() => expect(ModalService.getModalComponent(modalId)).toBeUndefined());
    expect(() => ModalService.closeLoadingModal()).not.toThrow();
  });
});

describe('openPhotoGalleryModal', () => {
  test('opens a PhotoCarouselModal with the gallery, default item and fixed centered non-wrapped opts', () => {
    const gallery = [{ uuid: 'a' } as any, { uuid: 'b' } as any];
    const modalId = ModalService.openPhotoGalleryModal(gallery, gallery[1]);
    const component = ModalService.getModalComponent(modalId);
    expect(component.type).toBe(PhotoCarouselModal);
    expect(component.props.gallery).toBe(gallery);
    expect(component.props.defaultMediaItem).toBe(gallery[1]);
    expect(component.props.modalPosition).toBe('center');
    expect(component.props.maxWidth).toBe('996px');
    expect(component.props.width).toBe('100%');
    expect(component.props.wrapInModal).toBe(false);
  });

  test('idx is optional', () => {
    const gallery = [{ uuid: 'a' } as any];
    const modalId = ModalService.openPhotoGalleryModal(gallery);
    expect(ModalService.getModalComponent(modalId).props.defaultMediaItem).toBeUndefined();
  });
});

describe('openSlide', () => {
  test('forces the slide animation and publishes it on open, overriding any caller-supplied animation', () => {
    const spy = vi.spyOn(pubSubService, '$pub');
    const modalId = ModalService.openSlide(<div />, { animation: 'grow' } as any);
    expect(spy).toHaveBeenCalledWith(PUB_SUB_EVENTS.reactModalOpen, { modalId, animation: 'slide' });
    expect(ModalService.getModalComponent(modalId).props.animation).toBe('slide');
  });

  test('merges through any other opts unrelated to animation', () => {
    const modalId = ModalService.openSlide(<div />, { title: 'Slide title', fullscreen: true });
    const component = ModalService.getModalComponent(modalId);
    expect(component.props.title).toBe('Slide title');
    expect(component.props.fullscreen).toBe(true);
    expect(component.props.animation).toBe('slide');
  });
});

describe('openErrorModal / closeErrorModal', () => {
  // NOTE (behavior worth flagging): openErrorModal is declared to return nothing (no
  // `return` statement in its body, ModalService.tsx around the openErrorModal arrow
  // function) even though every other openXModal helper returns the new modal id.
  // Its result is always `undefined`. We recover the id via the reactModalOpen pub-sub
  // event, which does carry it.
  const openAndCaptureId = (options: Parameters<typeof ModalService.openErrorModal>[0]) => {
    const spy = vi.spyOn(pubSubService, '$pub');
    const result = ModalService.openErrorModal(options);
    expect(result).toBeUndefined();
    const openCall = spy.mock.calls.find(([event]) => event === PUB_SUB_EVENTS.reactModalOpen);
    return (openCall?.[1] as { modalId: string }).modalId;
  };

  test('opens an ErrorModal with the given fields and wires close to call onClose', () => {
    const onClose = vi.fn();
    const modalId = openAndCaptureId({
      source: 'my-source',
      message: 'Something broke',
      title: 'Oops',
      onClose,
      replacements: { code: '1' },
      errorCodes: ['E1', 'E2'],
    });
    const component = ModalService.getModalComponent(modalId);
    expect(component.type).toBe(ErrorModal);
    expect(component.props.source).toBe('my-source');
    expect(component.props.message).toBe('Something broke');
    expect(component.props.title).toBe('Oops');
    expect(component.props.replacements).toEqual({ code: '1' });
    expect(component.props.errorCodes).toEqual(['E1', 'E2']);
    component.props.close();
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test('close is safe to call when onClose is omitted', () => {
    const modalId = openAndCaptureId({ source: 'src' });
    const component = ModalService.getModalComponent(modalId);
    expect(() => component.props.close()).not.toThrow();
  });

  test('closeErrorModal closes the tracked error modal and clears the id, idempotently', async () => {
    const modalId = openAndCaptureId({ source: 'src' });
    ModalService.closeErrorModal();
    await vi.waitFor(() => expect(ModalService.getModalComponent(modalId)).toBeUndefined());
    expect(() => ModalService.closeErrorModal()).not.toThrow();
  });
});

describe('closeAllModals', () => {
  test('closes every currently open modal via the same close lifecycle', async () => {
    const a = ModalService.open(<div />);
    const b = ModalService.open(<div />);
    const c = ModalService.open(<div />);
    ModalService.closeAllModals();
    await vi.waitFor(() => {
      expect(ModalService.getModalComponent(a)).toBeUndefined();
      expect(ModalService.getModalComponent(b)).toBeUndefined();
      expect(ModalService.getModalComponent(c)).toBeUndefined();
    });
  });

  test('no-op when nothing is open', () => {
    expect(() => ModalService.closeAllModals()).not.toThrow();
  });
});

describe('closeEv', () => {
  test('with no modalId resolves undefined synchronously (immediately, no timer)', async () => {
    const result = await ModalService.closeEv();
    expect(result).toBeUndefined();
  });

  test('with a modalId: publishes close, invokes queued callbacks with the response, cleans listeners, removes the component, and resolves the stored data', async () => {
    const modalId = ModalService.open(<div />);
    const cb1 = vi.fn();
    const cb2 = vi.fn();
    const data = { some: 'data' };
    ModalService.onModalClose(modalId, cb1, data);
    ModalService.onModalClose(modalId, cb2);
    const spy = vi.spyOn(pubSubService, '$pub');
    const response = { isOk: true, data: 42 };

    const resultPromise = ModalService.closeEv(modalId, response);
    // The implementation defers work via setTimeout(0); nothing has happened synchronously yet.
    expect(ModalService.getModalComponent(modalId)).toBeDefined();

    const result = await resultPromise;
    expect(spy).toHaveBeenCalledWith(PUB_SUB_EVENTS.reactModalClose, { modalId });
    expect(cb1).toHaveBeenCalledWith(response);
    expect(cb2).toHaveBeenCalledWith(response);
    expect(ModalService.getModalComponent(modalId)).toBeUndefined();
    expect(result).toBe(data);
  });

  test('closing an id with no registered listeners resolves undefined and does not throw', async () => {
    const modalId = ModalService.open(<div />);
    const result = await ModalService.closeEv(modalId);
    expect(result).toBeUndefined();
  });

  test('closing an unknown id still publishes the close event and resolves undefined', async () => {
    const spy = vi.spyOn(pubSubService, '$pub');
    const result = await ModalService.closeEv('never-opened');
    expect(spy).toHaveBeenCalledWith(PUB_SUB_EVENTS.reactModalClose, { modalId: 'never-opened' });
    expect(result).toBeUndefined();
  });
});

describe('WrapperModal render path (wrapInModal: true)', () => {
  test('wraps a valid element, cloning modalId/close/compactControls onto it and rendering title/message via ModalHeader', () => {
    const Inner: React.FC<any> = () => <div />;
    const modalId = ModalService.open(<Inner original />, {
      wrapInModal: true,
      title: 'Wrapped title',
      message: 'Wrapped message',
      padding: '10px',
      type: 'warning',
    });
    const component = ModalService.getModalComponent(modalId);
    // The stored top-level component is now the WrapperModal, not Inner.
    expect(component.type).not.toBe(Inner);
    expect(component.props.title).toBe('Wrapped title');
    expect(component.props.message).toBe('Wrapped message');
    expect(component.props.padding).toBe('10px');
    expect(component.props.headerType).toBe('warning');

    const child = component.props.children;
    expect(React.isValidElement(child)).toBe(true);
    expect((child as any).type).toBe(Inner);
    expect((child as any).props.original).toBe(true);
    expect((child as any).props.modalId).toBe(modalId);
    expect(typeof (child as any).props.close).toBe('function');
  });

  test('injects compact/expand controls onto the cloned child only when allowCompact is set', () => {
    const Inner: React.FC<any> = () => <div />;
    const modalId = ModalService.open(<Inner />, { wrapInModal: true, allowCompact: true });
    const component = ModalService.getModalComponent(modalId);
    const child = component.props.children as any;
    expect(typeof child.props.compact).toBe('function');
    expect(typeof child.props.expand).toBe('function');
    child.props.compact();
    expect(ModalService.getModalComponent(modalId).isCompact).toBe(true);
  });

  test('passes through a non-element child unchanged (e.g. a string) instead of cloning', () => {
    const modalId = ModalService.open('plain text' as any, { wrapInModal: true });
    const component = ModalService.getModalComponent(modalId);
    expect(component.props.children).toBe('plain text');
  });
});
