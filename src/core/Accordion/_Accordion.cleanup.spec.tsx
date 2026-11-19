import { act, fireEvent, render } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Accordion } from './Accordion';

/**
 * Track g: the own Accordion leaves no timer and no document/window listener behind when unmounted mid-transition
 * (Collapse timeout 'auto', ButtonBase focus/press handlers), and carries the D2 DOM contract on its parts.
 */
const props = { accordionId: 'acc', summaryChildren: <span>S</span>, detailsChildren: <p>D</p> };

describe('Accordion cleanup and contract', () => {
  let restore: () => void;
  beforeEach(() => {
    vi.useFakeTimers();
    const spy = vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockImplementation(function (this: HTMLElement) {
      return this.classList.contains('MuiCollapse-wrapper') ? 120 : 0;
    });
    restore = () => spy.mockRestore();
  });
  afterEach(() => {
    restore();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('unmounting while expanding or collapsing leaves no pending timer', () => {
    const base = vi.getTimerCount();
    const view = render(<Accordion {...props} />);
    fireEvent.click(view.getByRole('button'));
    expect(vi.getTimerCount()).toBeGreaterThan(base);
    view.unmount();
    expect(vi.getTimerCount()).toBe(base);

    const v2 = render(<Accordion {...props} expanded />);
    fireEvent.click(v2.getByRole('button'));
    expect(vi.getTimerCount()).toBeGreaterThan(base);
    v2.unmount();
    expect(vi.getTimerCount()).toBe(base);
  });

  it('adds no document or window listener that outlives it', () => {
    const added: unknown[] = [];
    const removed: unknown[] = [];
    for (const target of [document, window]) {
      const add = target.addEventListener.bind(target);
      const remove = target.removeEventListener.bind(target);
      vi.spyOn(target, 'addEventListener').mockImplementation((type, fn, opts) => {
        added.push([target, type, fn]);
        add(type, fn, opts);
      });
      vi.spyOn(target, 'removeEventListener').mockImplementation((type, fn, opts) => {
        removed.push([target, type, fn]);
        remove(type, fn, opts);
      });
    }
    const view = render(<Accordion {...props} />);
    const button = view.getByRole('button');
    act(() => button.focus());
    fireEvent.keyDown(button, { key: 'Enter' });
    fireEvent.click(button);
    fireEvent.keyUp(button, { key: 'Enter' });
    fireEvent.mouseDown(button);
    fireEvent.mouseUp(button);
    view.unmount();
    const leaked = added.filter(
      ([t, type, fn]) => !removed.some(([t2, type2, fn2]) => t === t2 && type === type2 && fn === fn2),
    );
    expect(leaked).toEqual([]);
  });

  it('parts carry the own-core marker, slots and the open/variant state', () => {
    const { container, rerender } = render(<Accordion {...props} variant={'outlined'} />);
    const root = container.firstElementChild as HTMLElement;
    const slot = (name: string) => container.querySelector(`[data-slot="${name}"]`) as HTMLElement;
    for (const name of [
      'accordion',
      'accordion-heading',
      'accordion-summary',
      'accordion-summary-content',
      'accordion-icon',
      'collapse',
      'accordion-region',
      'accordion-details',
    ])
      expect(slot(name)?.hasAttribute('data-vg-core'), name).toBe(true);
    expect(slot('accordion')).toBe(root);
    expect(root.getAttribute('data-variant')).toBe('outlined');
    expect(root.hasAttribute('data-open')).toBe(false);
    rerender(<Accordion {...props} expanded />);
    expect(root.getAttribute('data-variant')).toBe('elevation');
    expect(root.getAttribute('data-open')).toBe('');
  });
});
