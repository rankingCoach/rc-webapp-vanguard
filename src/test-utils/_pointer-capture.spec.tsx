import '@testing-library/jest-dom/vitest';

import { act, render } from '@testing-library/react';
import { Slider } from '@vanguard/Slider/Slider';
import React from 'react';
import { expect, test, vi } from 'vitest';

import { installPointerCapture } from './pointer-capture';

test('jsdom pointer capture tracks each element and pointer until release', () => {
  const first = document.createElement('div');
  const second = document.createElement('div');
  expect(typeof first.hasPointerCapture).toBe('function');
  expect(typeof first.setPointerCapture).toBe('function');
  expect(typeof first.releasePointerCapture).toBe('function');
  expect(first.hasPointerCapture(7)).toBe(false);
  first.setPointerCapture(7);
  first.setPointerCapture(8);
  expect(first.hasPointerCapture(7)).toBe(true);
  expect(first.hasPointerCapture(8)).toBe(true);
  expect(second.hasPointerCapture(7)).toBe(false);
  first.releasePointerCapture(7);
  expect(first.hasPointerCapture(7)).toBe(false);
  expect(first.hasPointerCapture(8)).toBe(true);
  first.releasePointerCapture(8);
  expect(first.hasPointerCapture(8)).toBe(false);
});

test('pointer capture installation preserves existing native methods', () => {
  const hasPointerCapture = vi.fn((_pointerId: number) => false);
  const setPointerCapture = vi.fn((_pointerId: number) => undefined);
  const releasePointerCapture = vi.fn((_pointerId: number) => undefined);
  const native = { hasPointerCapture, setPointerCapture, releasePointerCapture };
  installPointerCapture(native);
  expect(native.hasPointerCapture).toBe(hasPointerCapture);
  expect(native.setPointerCapture).toBe(setPointerCapture);
  expect(native.releasePointerCapture).toBe(releasePointerCapture);
});

test('Slider pointer drag commits with zero uncaught capture errors', () => {
  const errors: unknown[] = [];
  const onError = (event: ErrorEvent) => {
    errors.push(event.error);
  };
  window.addEventListener('error', onError);
  try {
    const onChangeCommitted = vi.fn();
    const { container } = render(<Slider value={50} min={0} max={100} onChangeCommitted={onChangeCommitted} />);
    const root = container.querySelector('.MuiSlider-root') as HTMLElement;
    root.getBoundingClientRect = () => new DOMRect(0, 0, 100, 10);
    const pointer = (type: string, target: EventTarget, x: number) => {
      const event = new MouseEvent(type, {
        bubbles: true,
        cancelable: true,
        clientX: x,
        clientY: 5,
        button: 0,
        buttons: type === 'pointerup' ? 0 : 1,
      });
      Object.defineProperties(event, { pointerId: { value: 1 }, pointerType: { value: 'mouse' } });
      act(() => {
        target.dispatchEvent(event);
      });
    };
    pointer('pointerdown', root, 30);
    pointer('pointermove', document, 70);
    pointer('pointerup', document, 70);
    expect(errors).toEqual([]);
    expect(onChangeCommitted).toHaveBeenLastCalledWith(expect.anything(), 70);
  } finally {
    window.removeEventListener('error', onError);
  }
});
