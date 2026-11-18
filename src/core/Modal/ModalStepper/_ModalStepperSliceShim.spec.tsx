import { configureStore, createSlice } from '@reduxjs/toolkit';
import { ComponentContainer } from '@vanguard/ComponentContainer/ComponentContainer';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render } from '../../../../test-utils/test-utils';
import { ModalStepper, Step } from './ModalStepper';

/**
 * D9/D11: ModalStepper's `slice.setStep` goes through the single dispatch shim. Action-returning setters (rc-webapp's
 * 5 wizards) still update their store; a plain callback that returns nothing is called and dispatches nothing.
 */
const steps: Step[] = [
  { name: 'first', component: <ComponentContainer>{'First'}</ComponentContainer> },
  { name: 'second', component: <ComponentContainer>{'Second'}</ComponentContainer> },
];

describe('ModalStepper slice step sync through the dispatch shim', () => {
  it('an action-returning slice.setStep updates the store with the active step (including step 0)', () => {
    const slice = createSlice({
      name: 'wizard',
      initialState: { step: '' },
      reducers: { setStep: (s, a: { payload: string }) => ({ ...s, step: a.payload }) },
    });
    const store = configureStore({ reducer: slice.reducer });
    render(<ModalStepper steps={steps} activeStep={0} slice={slice.actions as never} />, { customStore: store });
    expect(store.getState().step).toBe('first');
  });

  it('a plain-callback slice.setStep is called with the step name and nothing is dispatched', () => {
    const setStep = vi.fn();
    const store = configureStore({ reducer: (s: { n: number } = { n: 0 }) => s });
    const spy = vi.spyOn(store, 'dispatch');
    render(<ModalStepper steps={steps} activeStep="second" slice={{ setStep } as never} />, { customStore: store });
    expect(setStep).toHaveBeenCalledWith('second');
    // The test wrapper's redux-persist gate dispatches persist/* on mount; nothing else may be dispatched.
    const own = spy.mock.calls.filter(([a]) => !String((a as { type?: string })?.type).startsWith('persist/'));
    expect(own).toHaveLength(0);
  });
});
