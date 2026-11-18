import { afterEach, describe, expect, it } from 'vitest';
import { ROVING_ITEM_ATTR, rovingFocusKeyDown } from './roving-focus';

const setup = (disabled: number[] = []) => {
  const container = document.createElement('div');
  const items = [0, 1, 2].map((i) => {
    const b = document.createElement('button');
    b.textContent = String(i);
    b.setAttribute(ROVING_ITEM_ATTR, '');
    if (disabled.includes(i)) b.disabled = true;
    container.appendChild(b);
    return b;
  });
  const input = document.createElement('input');
  container.appendChild(input);
  document.body.appendChild(container);
  return { container, items, input };
};

const key = (k: string, target: HTMLElement, init: Partial<KeyboardEventInit> = {}) => {
  const e = new KeyboardEvent('keydown', { key: k, cancelable: true, ...init });
  Object.defineProperty(e, 'target', { value: target });
  return e;
};

afterEach(() => {
  document.body.innerHTML = '';
});

describe('rovingFocusKeyDown', () => {
  it('moves to next/previous with wrap and prevents default', () => {
    const { container, items } = setup();
    items[2].focus();
    const e = key('ArrowRight', items[2]);
    rovingFocusKeyDown(e, { container, orientation: 'horizontal' });
    expect(document.activeElement).toBe(items[0]);
    expect(e.defaultPrevented).toBe(true);
    rovingFocusKeyDown(key('ArrowLeft', items[0]), { container, orientation: 'horizontal' });
    expect(document.activeElement).toBe(items[2]);
  });

  it('Home/End, skips disabled, ignores modifiers and cross-axis keys', () => {
    const { container, items } = setup([1]);
    const o = { container, orientation: 'horizontal' as const };
    items[0].focus();
    rovingFocusKeyDown(key('ArrowRight', items[0]), o);
    expect(document.activeElement).toBe(items[2]);
    rovingFocusKeyDown(key('Home', items[2]), o);
    expect(document.activeElement).toBe(items[0]);
    rovingFocusKeyDown(key('End', items[0]), o);
    expect(document.activeElement).toBe(items[2]);
    rovingFocusKeyDown(key('ArrowLeft', items[2], { shiftKey: true }), o);
    expect(document.activeElement).toBe(items[2]);
    const cross = key('ArrowDown', items[2]);
    rovingFocusKeyDown(cross, o);
    expect(document.activeElement).toBe(items[2]);
    expect(cross.defaultPrevented).toBe(false);
  });

  it('rtl flips horizontal arrows; prevented events are ignored', () => {
    const { container, items } = setup();
    items[0].focus();
    rovingFocusKeyDown(key('ArrowLeft', items[0]), { container, orientation: 'horizontal', rtl: true });
    expect(document.activeElement).toBe(items[1]);
    const prevented = key('ArrowRight', items[1]);
    prevented.preventDefault();
    rovingFocusKeyDown(prevented, { container, orientation: 'horizontal' });
    expect(document.activeElement).toBe(items[1]);
  });

  it('leaves events from non-item descendants alone (no focus move, no preventDefault)', () => {
    const { container, input } = setup();
    input.focus();
    const e = key('ArrowRight', input);
    rovingFocusKeyDown(e, { container, orientation: 'horizontal' });
    expect(document.activeElement).toBe(input);
    expect(e.defaultPrevented).toBe(false);
  });
});
