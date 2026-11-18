import { useFormConfig } from '@custom-hooks/useFormConfig';
import { ReduxGenerator, withInitialState } from '@helpers/redux-common';
import { combineReducers, configureStore, createSlice } from '@reduxjs/toolkit';
import userEvent from '@testing-library/user-event';
import { CheckBox } from '@vanguard/CheckBox/CheckBox';
import { Form, FormStatus } from '@vanguard/Form/Form';
import { Slider } from '@vanguard/Slider/Slider';
import React from 'react';
import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '../../../test-utils/test-utils';

/**
 * F3 `field` path for CheckBox and Slider. Unlike their legacy formconfig path (pinned in F0 / left as a known bug),
 * on the `field` path CheckBox reports to the Form status and Slider stores its value.
 */
type State = { agree: boolean; volume: number };
const initialState = withInitialState<State>({ agree: false, volume: 10 });
const G = new ReduxGenerator<typeof initialState>();
const slice = createSlice({ name: 'f3i', initialState, reducers: { ...G.genAll(initialState) } });
const reducer = ((s: { f: State }) => s.f) as never;

const Harness = (props: { calls: FormStatus<unknown>[]; children: React.ReactNode }) => {
  const api = useFormConfig<State>({
    slice: slice.actions,
    reducer,
    inputs: { agree: { fieldType: 'Checkbox' }, volume: { fieldType: 'Slider' } },
  });
  return (
    <Form config={api.formConfig} onChange={(s) => props.calls.push(s)}>
      <div>{props.children}</div>
    </Form>
  );
};

const mkStore = () => configureStore({ reducer: combineReducers({ f: slice.reducer }) });

describe('F3 field path: CheckBox and Slider', () => {
  it('CheckBox bound with field stores its value AND reports to the Form status', async () => {
    const user = userEvent.setup();
    const store = mkStore();
    const calls: FormStatus<unknown>[] = [];
    render(
      <Harness calls={calls}>
        <CheckBox field="agree" label="Agree" />
      </Harness>,
      { customStore: store },
    );
    const before = calls.length;
    await user.click(screen.getByRole('checkbox'));
    expect(store.getState().f.agree).toBe(true);
    expect(calls.length).toBeGreaterThan(before);
    expect(calls.at(-1)?.currentConfig?.stateFieldName).toBe('agree');
  });

  it('Slider bound with field stores the changed value and reports it', () => {
    const store = mkStore();
    const calls: FormStatus<unknown>[] = [];
    render(
      <Harness calls={calls}>
        <Slider field="volume" value={10} min={0} max={100} />
      </Harness>,
      { customStore: store },
    );
    fireEvent.change(screen.getByRole('slider'), { target: { value: 30 } });
    expect(store.getState().f.volume).toBe(30);
    expect(calls.at(-1)?.currentConfig?.stateFieldName).toBe('volume');
  });
});
