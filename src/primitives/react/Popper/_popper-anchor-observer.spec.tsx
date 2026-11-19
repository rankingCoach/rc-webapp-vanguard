import { act, render } from '@testing-library/react';
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { OwnPopper } from './Popper';

/**
 * Verifier handoff 14 (DropdownMenu dark with-icons: arrow 29 → 37 in 2/10 runs): the anchor ResizeObserver delivers an
 * initial callback after observe(); when the popper's own content (lazy icons) has grown by then, re-positioning moves
 * the popper and arrow where MUI's popper.js never goes. The observer (and the font listener) re-position only when the
 * anchor's size changed; an anchor that really resizes (handoff 10) still re-positions.
 */
let anchorRect = { width: 80, height: 20 };
let floatingWidth = 140;
let roCallback: (() => void) | null = null;

class FakeRO {
  constructor(cb: () => void) {
    roCallback = cb;
  }
  observe() {}
  disconnect() {}
  unobserve() {}
}

const rect = (x: number, y: number, w: number, h: number) =>
  ({ x, y, left: x, top: y, width: w, height: h, right: x + w, bottom: y + h, toJSON: () => ({}) }) as DOMRect;

const setup = () => {
  vi.stubGlobal('ResizeObserver', FakeRO);
  const anchor = document.createElement('button');
  document.body.appendChild(anchor);
  anchor.getBoundingClientRect = () => rect(100, 100, anchorRect.width, anchorRect.height);
  const orig = HTMLElement.prototype.getBoundingClientRect;
  const ow = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetWidth');
  HTMLElement.prototype.getBoundingClientRect = function () {
    if (this.getAttribute('data-testid') === 'floating') return rect(0, 0, floatingWidth, 40);
    return orig.call(this);
  };
  const oh = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetHeight');
  Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
    configurable: true,
    get() {
      if (this === anchor) return anchorRect.width;
      return this.getAttribute?.('data-testid') === 'floating' ? floatingWidth : 0;
    },
  });
  Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
    configurable: true,
    get() {
      if (this === anchor) return anchorRect.height;
      return this.getAttribute?.('data-testid') === 'floating' ? 40 : 0;
    },
  });
  // A real viewport, so preventOverflow does not clamp everything into jsdom's 0×0 clipping rect.
  const de = document.documentElement;
  const cw = Object.getOwnPropertyDescriptor(de, 'clientWidth');
  const ch = Object.getOwnPropertyDescriptor(de, 'clientHeight');
  Object.defineProperty(de, 'clientWidth', { configurable: true, value: 1024 });
  Object.defineProperty(de, 'clientHeight', { configurable: true, value: 768 });
  return {
    anchor,
    restore: () => {
      if (cw) Object.defineProperty(de, 'clientWidth', cw);
      else delete (de as unknown as { clientWidth?: number }).clientWidth;
      if (ch) Object.defineProperty(de, 'clientHeight', ch);
      else delete (de as unknown as { clientHeight?: number }).clientHeight;
      HTMLElement.prototype.getBoundingClientRect = orig;
      if (ow) Object.defineProperty(HTMLElement.prototype, 'offsetWidth', ow);
      if (oh) Object.defineProperty(HTMLElement.prototype, 'offsetHeight', oh);
      anchor.remove();
    },
  };
};

const flush = () =>
  act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });

afterEach(() => {
  vi.unstubAllGlobals();
  anchorRect = { width: 80, height: 20 };
  floatingWidth = 140;
  roCallback = null;
});

describe('OwnPopper anchor observer', () => {
  it('content growth with an unchanged anchor does not re-position (like MUI)', async () => {
    const { anchor, restore } = setup();
    const view = render(
      <OwnPopper open anchorEl={anchor} placement="bottom" data-testid="floating">
        <div>{'menu'}</div>
      </OwnPopper>,
    );
    await flush();
    const el = view.getByTestId('floating');
    const before = el.style.transform;
    floatingWidth = 220;
    roCallback?.();
    await flush();
    expect(el.style.transform).toBe(before);
    view.unmount();
    restore();
  });

  it('an anchor that resizes re-positions (handoff 10 lazy trigger icon)', async () => {
    const { anchor, restore } = setup();
    const view = render(
      <OwnPopper open anchorEl={anchor} placement="bottom" data-testid="floating">
        <div>{'menu'}</div>
      </OwnPopper>,
    );
    await flush();
    const el = view.getByTestId('floating');
    const before = el.style.transform;
    anchorRect = { width: 120, height: 24 };
    roCallback?.();
    await flush();
    expect(el.style.transform).not.toBe(before);
    view.unmount();
    restore();
  });

  it('a web font swapping in that changes the POPPER width re-positions (verifier 1, 277bc04 tooltip 506 vs 514)', async () => {
    const { anchor, restore } = setup();
    const fonts = new EventTarget();
    Object.defineProperty(document, 'fonts', { configurable: true, value: fonts });
    const view = render(
      <OwnPopper open anchorEl={anchor} placement="bottom" data-testid="floating">
        <div>{'Edit opening times'}</div>
      </OwnPopper>,
    );
    await flush();
    const el = view.getByTestId('floating');
    const before = el.style.transform;
    floatingWidth = 220; // tooltip text re-measured with the loaded font; the icon anchor is unchanged
    fonts.dispatchEvent(new Event('loadingdone'));
    await flush();
    expect(el.style.transform).not.toBe(before);
    view.unmount();
    delete (document as unknown as { fonts?: unknown }).fonts;
    restore();
  });
});
