import { describe, expect, it, vi } from 'vitest';
import { createFormStore } from './form-store';

describe('createFormStore (F4, framework-free)', () => {
  it('starts from the initial values and notifies subscribers on set', () => {
    const store = createFormStore({ name: 'a', count: 1 });
    const listener = vi.fn();
    const off = store.subscribe(listener);
    store.set('name', 'b');
    expect(store.getSnapshot()).toEqual({ name: 'b', count: 1 });
    expect(listener).toHaveBeenCalledTimes(1);
    off();
    store.set('count', 2);
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('keeps the snapshot identity when a value does not change', () => {
    const store = createFormStore({ name: 'a' });
    const before = store.getSnapshot();
    store.set('name', 'a');
    expect(store.getSnapshot()).toBe(before);
  });

  it('writes one element of an array field', () => {
    const store = createFormStore({ items: ['x', 'y', 'z'] });
    store.setAt('items', 1, 'Y');
    expect(store.getSnapshot().items).toEqual(['x', 'Y', 'z']);
  });

  it('reset restores the initial values', () => {
    const store = createFormStore({ name: 'a' });
    store.set('name', 'b');
    store.reset();
    expect(store.getSnapshot()).toEqual({ name: 'a' });
  });
});
