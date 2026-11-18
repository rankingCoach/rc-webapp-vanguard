import { useFormConfig } from '@custom-hooks/useFormConfig';
import { ReduxGenerator, withInitialState } from '@helpers/redux-common';
import { combineReducers, configureStore, createSlice } from '@reduxjs/toolkit';
import userEvent from '@testing-library/user-event';
import { CheckBox } from '@vanguard/CheckBox/CheckBox';
import { Form, FormStatus } from '@vanguard/Form/Form';
import React from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '../../../test-utils/test-utils';

/** F0: CheckBox inside Form (current behaviour). */
type State = { agree: boolean };
const initialState = withInitialState<State>({ agree: false });
const G = new ReduxGenerator<typeof initialState>();
const slice = createSlice({ name: 'f0c', initialState, reducers: { ...G.genAll(initialState) } });

const Harness = (props: { calls: FormStatus<State>[] }) => {
  const api = useFormConfig<State>({
    slice: slice.actions,
    reducer: ((s: { f0: State }) => s.f0) as never,
    inputs: { agree: { fieldType: 'Checkbox' } },
  });
  return (
    <Form config={api.formConfig} onChange={(s) => props.calls.push(s as FormStatus<State>)}>
      <CheckBox formconfig={api.formConfig.agree} label="Agree" />
    </Form>
  );
};

describe('F0 CheckBox in Form', () => {
  it('[quirk] toggling dispatches setStateValue(!checked) to the store, but the Form status never reports it', async () => {
    const user = userEvent.setup();
    const store = configureStore({ reducer: combineReducers({ f0: slice.reducer }) });
    const calls: FormStatus<State>[] = [];
    render(<Harness calls={calls} />, { customStore: store });
    const mountCalls = calls.length;
    await user.click(screen.getByRole('checkbox'));
    expect(store.getState().f0.agree).toBe(true);
    expect(calls.length).toBe(mountCalls);
  });
});
