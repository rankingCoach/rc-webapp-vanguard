import { configureStore, createSlice } from '@reduxjs/toolkit';
import { act, render } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import { describe, expect, it, vi } from 'vitest';
import { useLegacyDispatch } from './use-legacy-dispatch';

const slice = createSlice({
  name: 'f',
  initialState: { v: '' },
  reducers: { setV: (s, a: { payload: string }) => ({ ...s, v: a.payload }) },
});

const sink: { emit: ReturnType<typeof useLegacyDispatch> } = { emit: () => undefined };

const Probe = () => {
  sink.emit = useLegacyDispatch();
  return null;
};

const setup = () => {
  const store = configureStore({ reducer: slice.reducer });
  render(
    <Provider store={store}>
      <Probe />
    </Provider>,
  );
  return { store, emit: (r: unknown) => act(() => sink.emit(r)) };
};

const looseSink: { emit: (r: unknown) => void } = { emit: () => undefined };
const Loose = () => {
  looseSink.emit = useLegacyDispatch();
  return null;
};

describe('useLegacyDispatch (D9 single dispatch shim)', () => {
  it('dispatches an action object returned by a consumer action creator', () => {
    const { store, emit } = setup();
    emit(slice.actions.setV('a'));
    expect(store.getState().v).toBe('a');
  });

  it('dispatches a thunk (function) result', () => {
    const { store, emit } = setup();
    emit((dispatch: (a: unknown) => void) => dispatch(slice.actions.setV('thunk')));
    expect(store.getState().v).toBe('thunk');
  });

  it('a plain callback returning nothing dispatches nothing (and does not throw)', () => {
    const { store, emit } = setup();
    const spy = vi.spyOn(store, 'dispatch');
    emit(undefined);
    expect(spy).not.toHaveBeenCalled();
  });

  it('without a react-redux Provider: renders (no throw) and drops results with a dev warning', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    expect(() => render(<Loose />)).not.toThrow();
    act(() => looseSink.emit({ type: 'x' }));
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });
});
