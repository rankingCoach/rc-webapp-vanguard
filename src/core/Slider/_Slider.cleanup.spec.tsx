import { act, fireEvent, render } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Slider } from './Slider';

/**
 * Track g: the own Slider's drag listeners (document pointermove/pointerup, touchmove/touchend), the root touchstart
 * listener and the pending focus frame never outlive it — released drags, unmount mid-drag, disable mid-drag — and
 * its parts carry the D2 DOM contract without junk class tokens.
 */
const press = (root: Element, clientX: number) =>
  act(() => {
    root.dispatchEvent(
      new MouseEvent('pointerdown', { bubbles: true, cancelable: true, clientX, clientY: 5, button: 0, buttons: 1 }),
    );
  });
const docEvent = (type: string, clientX: number) =>
  act(() => {
    document.dispatchEvent(
      new MouseEvent(type, { bubbles: true, clientX, clientY: 5, buttons: type === 'pointerup' ? 0 : 1 }),
    );
  });

describe('Slider cleanup and contract', () => {
  let added: unknown[];
  let removed: unknown[];
  beforeEach(() => {
    vi.useFakeTimers();
    const warm = render(<span />);
    getComputedStyle(warm.container); // jsdom nwsapi + React DOM once-per-document listeners
    warm.unmount();
    added = [];
    removed = [];
    const proto = EventTarget.prototype;
    const add = proto.addEventListener;
    const remove = proto.removeEventListener;
    vi.spyOn(proto, 'addEventListener').mockImplementation(function (this: EventTarget, type, fn, opts) {
      added.push([this, type, fn]);
      add.call(this, type, fn, opts);
    });
    vi.spyOn(proto, 'removeEventListener').mockImplementation(function (this: EventTarget, type, fn, opts) {
      removed.push([this, type, fn]);
      remove.call(this, type, fn, opts);
    });
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
      x: 0,
      y: 0,
      left: 0,
      top: 0,
      width: 100,
      height: 10,
      right: 100,
      bottom: 10,
      toJSON: () => ({}),
    } as DOMRect);
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });
  const live = (types: string[]) =>
    added
      .filter(
        ([t, ty, fn]) =>
          (t === document || t === window) &&
          types.includes(ty as string) &&
          !removed.some(([t2, ty2, fn2]) => t === t2 && ty === ty2 && fn === fn2),
      )
      .map(([, ty]) => ty);
  const DRAG = ['pointermove', 'pointerup', 'touchmove', 'touchend'];

  it('a released drag leaves no document listener; frame and timers settle', () => {
    const base = vi.getTimerCount();
    const view = render(<Slider value={20} min={0} max={100} />);
    const root = view.container.querySelector('.MuiSlider-root') as Element;
    press(root, 30);
    expect(live(DRAG).sort()).toEqual(['pointermove', 'pointerup']);
    docEvent('pointermove', 60);
    docEvent('pointerup', 60);
    expect(live(DRAG)).toEqual([]);
    view.unmount();
    act(() => {
      vi.runOnlyPendingTimers();
    });
    expect(vi.getTimerCount()).toBe(base);
  });

  it('unmount mid-drag removes the drag listeners and the root touchstart listener', () => {
    const view = render(<Slider value={20} min={0} max={100} />);
    const root = view.container.querySelector('.MuiSlider-root') as Element;
    press(root, 30);
    view.unmount();
    expect(live(DRAG)).toEqual([]);
    const touchStart = added.filter(([t, ty]) => t === root && ty === 'touchstart');
    expect(touchStart.length).toBe(1);
    expect(
      removed.some(([t, ty, fn]) => t === root && ty === 'touchstart' && fn === (touchStart[0] as unknown[])[2]),
    ).toBe(true);
  });

  it('touch drag: touchend removes touchmove/touchend; disabling mid-drag stops listening', () => {
    const view = render(<Slider value={20} min={0} max={100} />);
    const root = view.container.querySelector('.MuiSlider-root') as Element;
    fireEvent.touchStart(root, { changedTouches: [{ identifier: 1, clientX: 30, clientY: 5 }] });
    expect(live(DRAG).sort()).toEqual(['touchend', 'touchmove']);
    fireEvent.touchEnd(document, { changedTouches: [{ identifier: 1, clientX: 30, clientY: 5 }] });
    expect(live(DRAG)).toEqual([]);
    press(root, 40);
    view.rerender(<Slider value={20} min={0} max={100} disabled />);
    expect(live(DRAG)).toEqual([]);
    view.unmount();
  });

  it('parts carry the own-core marker, slots and state; no junk class tokens', () => {
    const { container } = render(
      <Slider
        value={[20, 60]}
        min={0}
        max={100}
        valueLabelDisplay="on"
        marks={[{ value: 50, label: 'mid' }]}
        disabled
      />,
    );
    const root = container.querySelector('.MuiSlider-root') as HTMLElement;
    expect(root.getAttribute('data-slot')).toBe('slider');
    expect(root.getAttribute('data-disabled')).toBe('');
    for (const slot of [
      'slider-rail',
      'slider-track',
      'slider-mark',
      'slider-mark-label',
      'slider-thumb',
      'slider-value-label',
    ])
      expect(container.querySelector(`[data-slot="${slot}"]`)?.hasAttribute('data-vg-core'), slot).toBe(true);
    for (const el of container.querySelectorAll('.MuiSlider-root, .MuiSlider-root span')) {
      const c = el.getAttribute('class') ?? '';
      expect(c, c).not.toMatch(/(^|\s)(false|true|undefined|null|NaN)(\s|$)|\s{2,}|^\s|\s$/);
    }
  });
});
