import { useFormConfig } from '@custom-hooks/useFormConfig';
import { ReduxGenerator, withInitialState } from '@helpers/redux-common';
import { combineReducers, configureStore, createSlice } from '@reduxjs/toolkit';
import userEvent from '@testing-library/user-event';
import { Form, FormStatus } from '@vanguard/Form/Form';
import { Input } from '@vanguard/Input/Input';
import { Select } from '@vanguard/Select/Select';
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '../../../test-utils/test-utils';

/** F3: inputs bound with `field` through the nearest Form's context (no prop drilling, any depth). */
type Item = { text: string };
type State = { name: string; city: string; items: Item[]; plan: string };

const makeStore = () => {
  const initialState = withInitialState<State>({
    name: '',
    city: 'Rome',
    items: [{ text: 'a' }, { text: 'b' }],
    plan: 'basic',
  });
  const G = new ReduxGenerator<typeof initialState>();
  const slice = createSlice({ name: 'f3', initialState, reducers: { ...G.genAll(initialState) } });
  return { store: configureStore({ reducer: combineReducers({ f3: slice.reducer }) }), actions: slice.actions };
};
type Actions = ReturnType<typeof makeStore>['actions'];
const reducer = ((s: { f3: State }) => s.f3) as never;
const inputs = () => Array.from(document.querySelectorAll<HTMLInputElement>('.vanguard-input input'));
type Short = { isValid: boolean; hasChanges: boolean; current?: string; changes: Record<string, boolean> };
const short = (s: FormStatus<unknown>): Short => ({
  isValid: s.isValid,
  hasChanges: s.hasChanges,
  current: s.currentConfig?.stateFieldName,
  changes: s.inputsChanges as Record<string, boolean>,
});

/** A custom component the legacy child-walker never looks into. */
const Section = (props: { children: React.ReactNode }) => (
  <fieldset>
    <legend>{'Section'}</legend>
    <div>{props.children}</div>
  </fieldset>
);
const NameRow = () => (
  <Section>
    <Input label="Name" field="name" />
  </Section>
);

const Harness = (props: {
  actions: Actions;
  calls: Short[];
  children: (cfg: Record<string, never>) => React.ReactNode;
}) => {
  const api = useFormConfig<State>({
    slice: props.actions,
    reducer,
    inputs: {
      name: { fieldType: 'Input', validation: { required: true, minLength: 2 } },
      city: { fieldType: 'Input' },
      items: {
        fieldType: 'Input',
        isArray: true,
        valueMappers: {
          toObject: (v) => ({ text: String(v) }) as never,
          toPrimitive: (o) => (o as never as Item).text,
        },
      },
      plan: { fieldType: 'Select' },
    },
  });
  return (
    <Form config={api.formConfig} onChange={(s) => props.calls.push(short(s))}>
      {props.children(api.formConfig as Record<string, never>)}
    </Form>
  );
};

afterEach(() => vi.restoreAllMocks());

describe('F3 field binding', () => {
  it('binds an input nested inside a custom component (no prop drilling) and reports to the Form', async () => {
    const user = userEvent.setup();
    const { store, actions } = makeStore();
    const calls: Short[] = [];
    render(
      <Harness actions={actions} calls={calls}>
        {() => <NameRow />}
      </Harness>,
      { customStore: store },
    );
    await user.type(inputs()[0], 'Al');
    expect(store.getState().f3.name).toBe('Al');
    expect(calls.at(-1)).toMatchObject({ isValid: true, hasChanges: true, current: 'name' });
  });

  it('mixed Form: a legacy formconfig child and a field child aggregate into one status', async () => {
    const user = userEvent.setup();
    const { store, actions } = makeStore();
    const calls: Short[] = [];
    render(
      <Harness actions={actions} calls={calls}>
        {(cfg) => (
          <>
            <Input label="City" formconfig={cfg.city} />
            <NameRow />
          </>
        )}
      </Harness>,
      { customStore: store },
    );
    await user.type(inputs()[0], 'X');
    await user.type(inputs()[1], 'A');
    expect(store.getState().f3).toMatchObject({ city: 'RomeX', name: 'A' });
    // name is invalid (minLength 2) and city changed: both kinds are aggregated
    expect(calls.at(-1)).toMatchObject({ isValid: false, hasChanges: true, current: 'name' });
    expect(calls.at(-1)?.changes).toMatchObject({ city: true, name: true });
  });

  it('formconfig wins over field (dev warning)', async () => {
    const user = userEvent.setup();
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const { store, actions } = makeStore();
    render(
      <Harness actions={actions} calls={[]}>
        {(cfg) => <Input label="City" formconfig={cfg.city} field="name" />}
      </Harness>,
      {
        customStore: store,
      },
    );
    await user.type(inputs()[0], 'Z');
    expect(store.getState().f3).toMatchObject({ city: 'RomeZ', name: '' });
    expect(warn.mock.calls.some(([m]) => String(m).includes('`formconfig` wins'))).toBe(true);
  });

  it('field with no Form above, or an unknown key: not bound (plain input) and a dev warning', async () => {
    const user = userEvent.setup();
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const { store, actions } = makeStore();
    render(
      <>
        <Input label="Loose" field="name" />
        <Harness actions={actions} calls={[]}>
          {() => <Input label="Typo" field="nmae" />}
        </Harness>
      </>,
      { customStore: store },
    );
    await user.type(inputs()[0], 'q');
    await user.type(inputs()[1], 'w');
    expect(store.getState().f3.name).toBe('');
    expect(warn.mock.calls.some(([m]) => String(m).includes('no <Form config> above'))).toBe(true);
    expect(warn.mock.calls.some(([m]) => String(m).includes('not a key'))).toBe(true);
  });

  it('array field via field + explicit index writes that element (no order-derived index)', async () => {
    const user = userEvent.setup();
    const { store, actions } = makeStore();
    render(
      <Harness actions={actions} calls={[]}>
        {() => (
          <Section>
            <Input label="Item 1" field="items" index={1} />
            <Input label="Item 0" field="items" index={0} />
          </Section>
        )}
      </Harness>,
      { customStore: store },
    );
    const [first, second] = inputs();
    expect([first.value, second.value]).toEqual(['b', 'a']);
    await user.type(first, '!');
    expect(store.getState().f3.items).toEqual([{ text: 'a' }, { text: 'b!' }]);
  });

  it('Select bound with field stores the chosen option', async () => {
    const user = userEvent.setup();
    const { store, actions } = makeStore();
    const options = [
      { key: 'b', value: 'basic', title: 'Basic' },
      { key: 'p', value: 'pro', title: 'Pro' },
    ];
    render(
      <Harness actions={actions} calls={[]}>
        {() => (
          <Section>
            <Select field="plan" options={options} translateOptions={false} />
          </Section>
        )}
      </Harness>,
      { customStore: store },
    );
    await user.click(screen.getByRole('combobox'));
    await user.click(within(await screen.findByRole('listbox')).getByRole('option', { name: 'Pro' }));
    expect(store.getState().f3.plan).toBe('pro');
  });
});
