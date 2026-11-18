import { useFormConfig } from '@custom-hooks/useFormConfig';
import { ReduxGenerator, withInitialState } from '@helpers/redux-common';
import { combineReducers, configureStore, createSlice } from '@reduxjs/toolkit';
import userEvent from '@testing-library/user-event';
import { Form, FormStatus } from '@vanguard/Form/Form';
import { Input } from '@vanguard/Input/Input';
import React, { act, useState } from 'react';
import { describe, expect, it } from 'vitest';
import { render } from '../../../test-utils/test-utils';

/**
 * F0 batch 2: characterization of the CURRENT Form/useFormConfig (observed first, then pinned). Several assertions
 * pin quirks on purpose ([quirk]); the rewrite keeps them unless a delta is explicitly decided.
 */
type State = { name: string; title: string; age: string; errors: { errorMessage: string; field: string }[] };

const makeStore = () => {
  const initialState = withInitialState<State>({ name: '', title: 'Hello', age: '', errors: [] });
  const G = new ReduxGenerator<typeof initialState>();
  const slice = createSlice({ name: 'f0b', initialState, reducers: { ...G.genAll(initialState) } });
  const store = configureStore({ reducer: combineReducers({ f0: slice.reducer }) });
  return { store, actions: slice.actions };
};

const inputs = () => Array.from(document.querySelectorAll<HTMLInputElement>('.vanguard-input input'));
const brief = (s: FormStatus<State>) => ({
  isValid: s.isValid,
  hasChanges: s.hasChanges,
  inputsChanges: s.inputsChanges,
  inputsStatus: s.inputsStatus,
  current: s.currentConfig?.stateFieldName ?? null,
});

type Brief = ReturnType<typeof brief>;

type Ref = { api: ReturnType<typeof useFormConfig<State>> | null; showTitle: (b: boolean) => void };

const Harness = (props: {
  actions: ReturnType<typeof makeStore>['actions'];
  calls: Brief[];
  refObj: Ref;
  validateOn: 'change' | 'blur';
}) => {
  const [showTitle, setShowTitle] = useState(true);
  props.refObj.showTitle = setShowTitle;
  // inputs built inline (fresh per render) like real consumers: useFormConfig mutates it in place
  const api = useFormConfig<State>({
    slice: props.actions,
    reducer: ((s: { f0: State }) => s.f0) as never,
    validateOn: props.validateOn,
    inputs: {
      name: {
        fieldType: 'Input',
        validation: { required: true, minLength: 3 },
        errorMatching: [{ field: 'name' }] as never,
      },
      title: { fieldType: 'Input', validation: { required: true }, passError: 'Dev error' },
      age: { fieldType: 'InputNumber' },
    },
  });
  props.refObj.api = api;
  return (
    <Form config={api.formConfig} onChange={(s) => props.calls.push(brief(s as FormStatus<State>))}>
      <Input label="Name" formconfig={api.formConfig.name} testId="name" />
      {showTitle && <Input label="Title" formconfig={api.formConfig.title} testId="title" />}
      <Input label="Age" type="number" formconfig={api.formConfig.age} testId="age" />
    </Form>
  );
};

const setup = (opts: { validateOn?: 'change' | 'blur' } = {}) => {
  const { store, actions } = makeStore();
  const calls: Brief[] = [];
  const ref: Ref = { api: null, showTitle: () => undefined };
  const view = render(
    <Harness actions={actions} calls={calls} refObj={ref} validateOn={opts.validateOn ?? 'change'} />,
    {
      customStore: store,
    },
  );
  const helperTexts = () =>
    Array.from(view.container.querySelectorAll('.MuiFormHelperText-root')).map((e) => e.textContent);
  return { store, actions, calls, ref, helperTexts };
};

describe('F0 Form characterization, batch 2', () => {
  it('mount: empty status, then one call per passError field (marks it invalid)', () => {
    const { calls, helperTexts } = setup();
    expect(calls).toEqual([
      { isValid: true, hasChanges: false, inputsChanges: {}, inputsStatus: {}, current: null },
      {
        isValid: false,
        hasChanges: false,
        inputsChanges: { title: false },
        inputsStatus: { title: false },
        current: 'title',
      },
    ]);
    expect(helperTexts()).toEqual(['', 'Dev error', '']);
  });

  it('typing: one onChange per keystroke; keys accumulate; validity aggregates over reported fields; error key shown', async () => {
    const user = userEvent.setup();
    const { calls, ref, helperTexts } = setup();
    calls.length = 0;
    await user.type(inputs()[0], 'ab');
    expect(calls).toHaveLength(2);
    expect(calls.at(-1)).toEqual({
      isValid: false,
      hasChanges: true,
      inputsChanges: { title: false, name: true },
      inputsStatus: { title: false, name: false },
      current: 'name',
    });
    expect(helperTexts()).toEqual(['validation_minLength', 'Dev error', '']);
    expect(ref.api?.getChangedData()).toEqual({ name: 'ab' });
  });

  it('InputNumber stores the parsed number', async () => {
    const user = userEvent.setup();
    const { calls, store } = setup();
    await user.type(inputs()[2], '42');
    expect(store.getState().f0.age).toBe(42);
    expect(calls.at(-1)).toMatchObject({ current: 'age', inputsStatus: { age: true }, inputsChanges: { age: true } });
  });

  it('[quirk] server errors via errorMatching show on the matched field and clear passError on the others', () => {
    const { store, actions, helperTexts } = setup();
    act(() => {
      store.dispatch(actions.setErrors([{ errorMessage: 'Server says no', field: 'name' }] as never));
    });
    expect(helperTexts()).toEqual(['Server says no', '', '']);
  });

  it('[quirk] removing a child reports once with isValid=true and keeps its stale keys', async () => {
    const user = userEvent.setup();
    const { calls, ref } = setup();
    await user.type(inputs()[0], 'ab');
    calls.length = 0;
    act(() => ref.showTitle(false));
    expect(calls).toHaveLength(1);
    expect(calls[0]).toMatchObject({ isValid: true, hasChanges: true, inputsStatus: { title: false, name: false } });
  });

  it("[quirk] validateOn: 'blur' never shows an error while typing or on blur", async () => {
    const user = userEvent.setup();
    const { helperTexts } = setup({ validateOn: 'blur' });
    await user.type(inputs()[0], 'ab');
    await user.tab();
    expect(helperTexts()[0]).toBe('');
  });
});
