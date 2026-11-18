import { afterEach, describe, expect, it } from 'vitest';
import { isMouseEventInsideElement } from './hit-test';

afterEach(() => {
  document.body.innerHTML = '';
});

const ev = (target: Element, clientX = 0, clientY = 0) => {
  const e = new MouseEvent('mouseup', { clientX, clientY, bubbles: true });
  Object.defineProperty(e, 'target', { value: target });
  Object.defineProperty(e, 'composedPath', { value: () => [] });
  return e;
};

describe('isMouseEventInsideElement (MUI SelectInput parity)', () => {
  it('a synthetic event targeting a descendant counts as inside even at (0,0)', () => {
    const el = document.createElement('div');
    const child = document.createElement('span');
    el.appendChild(child);
    document.body.appendChild(el);
    el.getBoundingClientRect = () =>
      ({ left: 100, top: 100, right: 200, bottom: 150, width: 100, height: 50 }) as DOMRect;
    expect(isMouseEventInsideElement(ev(child), el)).toBe(true);
  });

  it('outside target: geometric test with the boundary offset; zero-size rect is outside', () => {
    const el = document.createElement('div');
    const other = document.createElement('div');
    document.body.append(el, other);
    el.getBoundingClientRect = () =>
      ({ left: 100, top: 100, right: 200, bottom: 150, width: 100, height: 50 }) as DOMRect;
    expect(isMouseEventInsideElement(ev(other, 150, 120), el)).toBe(true);
    expect(isMouseEventInsideElement(ev(other, 10, 10), el)).toBe(false);
    el.getBoundingClientRect = () => ({ left: 0, top: 0, right: 0, bottom: 0, width: 0, height: 0 }) as DOMRect;
    expect(isMouseEventInsideElement(ev(other, 0, 0), el)).toBe(false);
    expect(isMouseEventInsideElement(ev(other), null)).toBe(false);
  });
});
