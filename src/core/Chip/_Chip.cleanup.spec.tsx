import { act, fireEvent, render } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Chip } from './Chip';

/**
 * Track g: the own Chip leaves no timer (ButtonBase ripple) and no document/window listener behind after press,
 * keyboard and unmount, and carries the D2 DOM contract.
 */
describe('Chip cleanup and contract', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('pressing and unmounting a clickable chip leaves no timer and no global listener', () => {
    // React DOM adds its once-per-document `selectionchange` listener when the first root is created: create one
    // before spying so the check sees only what the Chip adds.
    render(<span />).unmount();
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
    const base = vi.getTimerCount();
    for (const props of [{ onClick: () => {} }, { onDelete: () => {} }, { onClick: () => {}, onDelete: () => {} }]) {
      const view = render(<Chip label="x" {...props} />);
      const root = view.getByTestId('chip');
      act(() => root.focus());
      fireEvent.mouseDown(root);
      fireEvent.mouseUp(root);
      fireEvent.click(root);
      fireEvent.keyDown(root, { key: 'Backspace' });
      fireEvent.keyUp(root, { key: 'Backspace' });
      view.unmount();
    }
    act(() => {
      vi.runOnlyPendingTimers();
    });
    expect(vi.getTimerCount()).toBe(base);
    const leaked = added.filter(
      ([t, type, fn]) => !removed.some(([t2, type2, fn2]) => t === t2 && type === type2 && fn === fn2),
    );
    expect(leaked).toEqual([]);
  });

  it('parts carry the own-core marker, slots and state attributes', () => {
    const { getByTestId, rerender } = render(
      <Chip label="x" size="small" variant="outlined" onDelete={() => {}} disabled />,
    );
    const root = getByTestId('chip');
    expect(root.hasAttribute('data-vg-core')).toBe(true);
    expect(root.getAttribute('data-slot')).toBe('chip');
    expect(root.getAttribute('data-size')).toBe('small');
    expect(root.getAttribute('data-variant')).toBe('outlined');
    expect(root.getAttribute('data-disabled')).toBe('');
    expect(root.querySelector('[data-slot="chip-label"]')?.hasAttribute('data-vg-core')).toBe(true);
    expect(root.querySelector('[data-slot="chip-delete"]')?.hasAttribute('data-vg-core')).toBe(true);
    rerender(<Chip label="x" data-slot="consumer-slot" />);
    expect(getByTestId('chip').hasAttribute('data-disabled')).toBe(false);
  });
});
