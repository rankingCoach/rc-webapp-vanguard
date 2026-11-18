import { useFormConfig } from '@custom-hooks/useFormConfig';
import { ReduxGenerator, withInitialState } from '@helpers/redux-common';
import { combineReducers, configureStore, createSlice } from '@reduxjs/toolkit';
import userEvent from '@testing-library/user-event';
import { Form, FormStatus } from '@vanguard/Form/Form';
import { Input } from '@vanguard/Input/Input';
import React, { act } from 'react';
import { describe, expect, it } from 'vitest';
import { render } from '../../../test-utils/test-utils';

/**
 * F0 batch 4: the shapes of rc-webapp's most complex forms (from the verifier's inventory), on the CURRENT Form:
 * AdHeadlines/AdDescriptions (arrays of objects + positional passError + arrayPosition in the status),
 * EditAddress/EditPhoneNumbers (multi-field errorMatching + resetForm + getChangedData), ProductRatePlanEditForm
 * (many fields) and EditDescription (two sibling Forms in one component). Quirks are pinned on purpose.
 */
type Head = { text: string };
type State = {
  headlines: Head[];
  street: string;
  city: string;
  zip: string;
  errors: { errorMessage: string; field?: string; propertyName?: string }[];
} & Record<`f${number}`, string>;

const FIELDS = Array.from({ length: 18 }, (_, i) => `f${i}` as const);

const makeStore = () => {
  const many = Object.fromEntries(FIELDS.map((k) => [k, ''])) as Record<`f${number}`, string>;
  const initialState = withInitialState<State>({
    headlines: [{ text: 'One' }, { text: 'Two' }, { text: 'Three' }],
    street: 'Main 1',
    city: 'Rome',
    zip: '',
    errors: [],
    ...many,
  } as State);
  const G = new ReduxGenerator<typeof initialState>();
  const slice = createSlice({ name: 'rcw', initialState, reducers: { ...G.genAll(initialState) } });
  return { store: configureStore({ reducer: combineReducers({ p: slice.reducer }) }), actions: slice.actions };
};

type Actions = ReturnType<typeof makeStore>['actions'];
type Api = ReturnType<typeof useFormConfig<State>>;
const reducer = ((s: { p: State }) => s.p) as never;
const inputs = () => Array.from(document.querySelectorAll<HTMLInputElement>('.vanguard-input input'));
const helpers = (c: HTMLElement) => Array.from(c.querySelectorAll('.MuiFormHelperText-root')).map((e) => e.textContent);

type Call = { isValid: boolean; arrayPosition?: number; inputsStatus: Record<string, boolean> };

const Headlines = (props: { actions: Actions; calls: Call[] }) => {
  const api = useFormConfig<State>({
    slice: props.actions,
    reducer,
    inputs: {
      headlines: {
        isArray: true,
        passError: [null, 'dup', null] as never,
        valueMappers: {
          toPrimitive: (h) => (h as never as Head).text,
          toObject: (v) => ({ text: String(v) }) as never,
        },
        validation: { maxLength: 5 },
      },
    },
  });
  return (
    <Form
      config={api.formConfig}
      onChange={(s) => {
        const st = s as FormStatus<State>;
        props.calls.push({
          isValid: st.isValid,
          arrayPosition: st.currentConfig?.arrayPosition,
          inputsStatus: st.inputsStatus,
        });
      }}
    >
      {[0, 1, 2].map((i) => (
        <Input key={i} label={`H${i}`} formconfig={api.formConfig.headlines} />
      ))}
    </Form>
  );
};

const Address = (props: { actions: Actions; apiRef: { current: Api | null } }) => {
  const api = useFormConfig<State>({
    slice: props.actions,
    reducer,
    inputs: {
      street: { errorMatching: [{ field: 'street' }] as never },
      city: { errorMatching: [{ field: 'city' }] as never },
      zip: { errorMatching: [{ field: 'zip' }, { propertyName: 'postalCode' }] as never },
    },
  });
  props.apiRef.current = api;
  return (
    <Form config={api.formConfig}>
      <Input label="Street" formconfig={api.formConfig.street} />
      <Input label="City" formconfig={api.formConfig.city} />
      <Input label="Zip" formconfig={api.formConfig.zip} />
    </Form>
  );
};

type Short = { isValid: boolean; keys: number; current?: string };

const ManyFieldsTwoForms = (props: { actions: Actions; a: Short[]; b: Short[] }) => {
  const api = useFormConfig<State>({
    slice: props.actions,
    reducer,
    inputs: Object.fromEntries(FIELDS.map((k) => [k, { validation: { required: true } }])) as never,
  });
  const cfg = api.formConfig as Record<string, never>;
  const short = (s: FormStatus<unknown>): Short => ({
    isValid: s.isValid,
    keys: Object.keys(s.inputsStatus).length,
    current: s.currentConfig?.stateFieldName,
  });
  return (
    <>
      <Form config={api.formConfig} onChange={(s) => props.a.push(short(s))}>
        {FIELDS.slice(0, 17).map((k) => (
          <Input key={k} label={k} formconfig={cfg[k]} />
        ))}
      </Form>
      <Form config={api.formConfig} onChange={(s) => props.b.push(short(s))}>
        <Input label="f17" formconfig={cfg.f17} />
      </Form>
    </>
  );
};

describe('F0 rc-webapp form shapes', () => {
  it('AdHeadlines: toPrimitive values, positional passError, arrayPosition and per-index status keys', async () => {
    const user = userEvent.setup();
    const { store, actions } = makeStore();
    const calls: Call[] = [];
    const view = render(<Headlines actions={actions} calls={calls} />, { customStore: store });
    expect(inputs().map((i) => i.value)).toEqual(['One', 'Two', 'Three']);
    expect(helpers(view.container)).toEqual(['', 'dup', '']);
    // [quirk] index 1's passError reports under both `headlines` and `headlines1`
    expect(calls).toEqual([
      { isValid: true, arrayPosition: undefined, inputsStatus: {} },
      { isValid: false, arrayPosition: 1, inputsStatus: { headlines: false, headlines1: false } },
    ]);
    calls.length = 0;
    await user.type(inputs()[2], 'XYZ');
    expect(store.getState().p.headlines).toEqual([{ text: 'One' }, { text: 'Two' }, { text: 'ThreeXYZ' }]);
    expect(helpers(view.container)).toEqual(['', 'dup', 'validation_maxLength']);
    expect(calls).toHaveLength(3);
    expect(calls.at(-1)).toEqual({
      isValid: false,
      arrayPosition: 2,
      inputsStatus: { headlines: false, headlines1: false, headlines2: false },
    });
  });

  it('EditAddress: getChangedData, multi-field errorMatching (incl. propertyName); [quirk] reset keeps shown errors', async () => {
    const user = userEvent.setup();
    const { store, actions } = makeStore();
    const apiRef: { current: Api | null } = { current: null };
    const view = render(<Address actions={actions} apiRef={apiRef} />, { customStore: store });
    await user.type(inputs()[1], 'X');
    expect(apiRef.current?.getChangedData()).toEqual({ city: 'RomeX' });
    act(() => {
      store.dispatch(
        actions.setErrors([
          { errorMessage: 'bad street', field: 'street' },
          { errorMessage: 'bad zip', propertyName: 'postalCode' },
        ] as never),
      );
    });
    expect(helpers(view.container)).toEqual(['bad street', '', 'bad zip']);
    act(() => apiRef.current?.resetForm());
    expect(store.getState().p.city).toBe('Rome');
    expect(store.getState().p.errors).toEqual([]);
    expect(helpers(view.container)).toEqual(['bad street', '', 'bad zip']);
    // [quirk] getChangedData uses the isDirty snapshot taken before the reset
    expect(apiRef.current?.getChangedData()).toEqual({ city: 'Rome' });
  });

  it('ProductRatePlan/EditDescription: 18 fields across two sibling Forms; each Form reports only its own children', async () => {
    const user = userEvent.setup();
    const { store, actions } = makeStore();
    const a: Short[] = [];
    const b: Short[] = [];
    render(<ManyFieldsTwoForms actions={actions} a={a} b={b} />, { customStore: store });
    expect([a.length, b.length]).toEqual([1, 1]);
    a.length = 0;
    b.length = 0;
    await user.type(inputs()[16], 'q');
    await user.type(inputs()[17], 'w');
    expect([store.getState().p.f16, store.getState().p.f17]).toEqual(['q', 'w']);
    expect(a).toEqual([{ isValid: true, keys: 1, current: 'f16' }]);
    expect(b).toEqual([{ isValid: true, keys: 1, current: 'f17' }]);
  });
});
