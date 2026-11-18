import { configureStore } from '@reduxjs/toolkit';
import { act, render } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import { describe, expect, it, vi } from 'vitest';
import { FieldBinding, useFieldBinding } from './use-field-binding';

/** F1 seam: the value-write path every input repeats, with the exact current semantics. */
const sink: { b: FieldBinding | null } = { b: null };
const Probe = (props: { cfg: Parameters<typeof useFieldBinding>[0] }) => {
  sink.b = useFieldBinding(props.cfg);
  return null;
};

const setup = (cfg: Parameters<typeof useFieldBinding>[0]) => {
  const store = configureStore({
    reducer: (s: { last: unknown } = { last: null }, a: { type: string; payload?: unknown }) =>
      a.type === 'set' ? { last: a.payload } : s,
  });
  render(
    <Provider store={store}>
      <Probe cfg={cfg} />
    </Provider>,
  );
  return { store, b: sink.b as FieldBinding };
};

const set = (payload: unknown) => ({ type: 'set', payload });

describe('useFieldBinding', () => {
  it('unbound: no formconfig -> bound false, writes are no-ops', () => {
    const { b } = setup(undefined);
    expect(b.bound).toBe(false);
    expect(b.canWrite).toBe(false);
    expect(b.toStored('x')).toBe('x');
    act(() => b.write('x'));
  });

  it('scalar: toObject mapping, then setStateValue(value) dispatched', () => {
    const { b, store } = setup({
      setStateValue: set,
      valueMappers: { toObject: (v) => ({ v }) as never, toPrimitive: (v) => String(v) },
    });
    expect(b.toStored('a')).toEqual({ v: 'a' });
    act(() => b.write(b.toStored('a')));
    expect(store.getState().last).toEqual({ v: 'a' });
  });

  it('scalar transform can change or skip the value (InputNumber parse, ColorPicker invalid hex)', () => {
    const { b, store } = setup({ setStateValue: set });
    act(() => b.write('42', (v) => ({ value: parseInt(String(v), 10) })));
    expect(store.getState().last).toBe(42);
    act(() => b.write('#zz', () => ({ skip: true })));
    expect(store.getState().last).toBe(42);
  });

  it('array: setStateValueArray({el, idx}) and the scalar transform is NOT applied', () => {
    const arr = vi.fn((p: unknown) => ({ type: 'set', payload: p }));
    const { b, store } = setup({ setStateValue: set, setStateValueArray: arr, arrayPosition: 0 });
    act(() => b.write('7', (v) => ({ value: parseInt(String(v), 10) })));
    expect(arr).toHaveBeenCalledWith({ el: '7', idx: 0 });
    expect(store.getState().last).toEqual({ el: '7', idx: 0 });
  });

  it('notifyChange calls the Form callback when present', () => {
    const onChange = vi.fn();
    const { b } = setup({ _onChange: onChange });
    b.notifyChange();
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('writeScalar: always setStateValue(value), never the array branch and no mapping (CheckBox/Slider semantics)', () => {
    const arr = vi.fn();
    const { b, store } = setup({
      setStateValue: set,
      setStateValueArray: arr,
      arrayPosition: 0,
      valueMappers: { toObject: () => ({ mapped: true }) as never, toPrimitive: (v) => String(v) },
    });
    act(() => b.writeScalar(true));
    expect(arr).not.toHaveBeenCalled();
    expect(store.getState().last).toBe(true);
  });
});
