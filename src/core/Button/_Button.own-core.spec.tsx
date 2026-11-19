import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { act, fireEvent, render } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { IconNames } from '../Icon/IconNames';
import { Button, ButtonProps, ButtonSizes, ButtonTypes } from './Button';

/**
 * Button imports nothing from MUI (its hover icon swap runs on A's Grow primitive), leaves no timer or global listener
 * behind after a hover/press cycle, and its class attributes hold no junk tokens (`false`/`undefined`/`null`, empty or
 * duplicate entries).
 */
const variants: ButtonProps[] = [
  { children: 'L', icon: IconNames.add, iconLargeOnHover: true },
  { children: 'R', icon: IconNames.add, iconPosition: 'right' as const, iconLargeOnHover: true },
  { ariaLabel: 'a', icon: IconNames.add, iconLargeOnHover: true, size: ButtonSizes.small },
  { type: ButtonTypes.muted, children: 'M', icon: IconNames.add, iconLargeOnHover: true, blurred: true, onDark: true },
  { children: 'Loading', icon: IconNames.add, isLoading: true, disabled: true },
];

describe('Button own core', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('imports nothing from @mui (the hover icon swap runs on the Grow primitive)', () => {
    const source = readFileSync(join(__dirname, 'Button.tsx'), 'utf8');
    expect(source.match(/from ['"]@mui\/[^'"]+['"]/g) ?? []).toEqual([]);
    expect(source).toMatch(/primitives\/react\/Transitions\/Grow/);
  });

  it('hover/press cycle: no timer or global listener survives unmount', () => {
    // Warm-up before spying: React DOM's once-per-document listeners, and jsdom's selector engine (nwsapi), which adds
    // its own document mouseover/mouseout listeners lazily on the first selector match (getComputedStyle).
    const warm = render(<span />);
    getComputedStyle(warm.container);
    warm.unmount();
    const added: unknown[] = [];
    const removed: unknown[] = [];
    // Patch the inherited EventTarget methods once and record only calls whose `this` is document or window
    // (element listeners die with their element).
    const proto = EventTarget.prototype;
    const add = proto.addEventListener;
    const remove = proto.removeEventListener;
    const isGlobal = (t: unknown) => t === document || t === window;
    vi.spyOn(proto, 'addEventListener').mockImplementation(function (this: EventTarget, type, fn, opts) {
      if (isGlobal(this)) added.push([this, type, fn]);
      add.call(this, type, fn, opts);
    });
    vi.spyOn(proto, 'removeEventListener').mockImplementation(function (this: EventTarget, type, fn, opts) {
      if (isGlobal(this)) removed.push([this, type, fn]);
      remove.call(this, type, fn, opts);
    });
    const base = vi.getTimerCount();
    for (const props of variants) {
      const view = render(<Button {...props} />);
      const button = view.container.querySelector('button') as HTMLElement;
      fireEvent.mouseEnter(button);
      fireEvent.mouseOver(button);
      act(() => {
        vi.advanceTimersByTime(100);
      });
      fireEvent.mouseLeave(button);
      fireEvent.mouseOut(button);
      fireEvent.mouseDown(button);
      fireEvent.click(button);
      view.unmount();
    }
    expect(vi.getTimerCount()).toBe(base);
    expect(
      added.filter(([t, ty, fn]) => !removed.some(([t2, ty2, fn2]) => t === t2 && ty === ty2 && fn === fn2)),
    ).toEqual([]);
  });

  it('class attributes hold no junk tokens', () => {
    for (const props of variants) {
      const { container, unmount } = render(<Button {...props} />);
      for (const el of container.querySelectorAll('[class]')) {
        const cls = el.getAttribute('class') as string;
        const tokens = cls.split(' ').filter(Boolean);
        expect(
          tokens.filter((t) => /^(false|true|undefined|null)$/.test(t)),
          cls,
        ).toEqual([]);
        expect(new Set(tokens).size, cls).toBe(tokens.length);
      }
      unmount();
    }
  });
});
