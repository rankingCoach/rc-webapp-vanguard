import { useFormConfig } from '@custom-hooks/useFormConfig';
import { ReduxGenerator, withInitialState } from '@helpers/redux-common';
import { combineReducers, configureStore, createSlice } from '@reduxjs/toolkit';
import userEvent from '@testing-library/user-event';
import { Form, FormStatus } from '@vanguard/Form/Form';
import { Input } from '@vanguard/Input/Input';
import React, { useImperativeHandle } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '../../../test-utils/test-utils';

/**
 * F0: characterization of the CURRENT Form (before the D14 rewrite). Pins observed behaviour, including quirks;
 * the rewrite must keep every assertion here green (or a delta is decided explicitly).
 */
type State = { name: string; title: string; tags: { label: string }[]; code: string };

const makeStore = (base: Partial<State> = {}) => {
  const initialState = withInitialState<State>({
    name: '',
    title: 'Hello',
    tags: [{ label: 'a' }, { label: 'b' }],
    code: '',
    ...base,
  });
  const G = new ReduxGenerator<typeof initialState>();
  const slice = createSlice({ name: 'f0', initialState, reducers: { ...G.genAll(initialState) } });
  const store = configureStore({ reducer: combineReducers({ f0: slice.reducer }) });
  return { store, actions: slice.actions };
};

type Api = ReturnType<typeof useFormConfig<State>>;

const Harness = (props: {
  actions: ReturnType<typeof makeStore>['actions'];
  onChange?: (s: FormStatus<State>) => void;
  className?: string;
  apiRef?: React.Ref<Api>;
  render: (cfg: Api['formConfig']) => React.ReactNode;
  /** Factory: consumers build `inputs` inline (fresh per render); useFormConfig mutates it in place. */
  inputs?: () => Parameters<typeof useFormConfig<State>>[0]['inputs'];
}) => {
  const api = useFormConfig<State>({
    slice: props.actions,
    reducer: ((s: { f0: State }) => s.f0) as never,
    inputs: props.inputs?.() ?? {
      name: { fieldType: 'Input' },
      title: { fieldType: 'Input' },
      tags: {
        fieldType: 'Input',
        isArray: true,
        // arrays are arrays of objects: the generated `set<Key>inArray` merges fields into the element
        valueMappers: {
          toObject: (v) => ({ label: String(v) }) as never,
          toPrimitive: (o) => (o as never as { label: string }).label,
        },
      },
      code: { fieldType: 'Input' },
    },
  });
  useImperativeHandle(props.apiRef, () => api);
  return (
    <Form config={api.formConfig} onChange={props.onChange} className={props.className}>
      {props.render(api.formConfig)}
    </Form>
  );
};

// The TextField root div also has role=textbox (InputBase passes it), so query the real <input> elements.
const inputs = () => Array.from(document.querySelectorAll<HTMLInputElement>('.vanguard-input input'));

describe('F0 Form characterization', () => {
  it('host is a div.Form-container (no class token without className); not a <form>', () => {
    const { actions, store } = makeStore();
    const { container } = render(<Harness actions={actions} render={() => <span>{'x'}</span>} />, {
      customStore: store,
    });
    const host = container.querySelector('.Form-container') as HTMLElement;
    expect(host.tagName).toBe('DIV');
    expect(host.className).toBe('Form-container');
    expect(container.querySelector('form')).toBeNull();
  });

  it('onChange fires on mount with the empty status', () => {
    const { actions, store } = makeStore();
    const onChange = vi.fn();
    render(<Harness actions={actions} onChange={onChange} render={() => <span>{'x'}</span>} />, { customStore: store });
    expect(onChange.mock.calls[0][0]).toEqual({
      hasChanges: false,
      isValid: true,
      inputsChanges: {},
      inputsStatus: {},
      currentConfig: null,
    });
  });

  it('typing dispatches setStateValue and reports hasChanges with the field as currentConfig', async () => {
    const user = userEvent.setup();
    const { actions, store } = makeStore();
    const onChange = vi.fn();
    render(
      <Harness
        actions={actions}
        onChange={onChange}
        render={(cfg) => <Input label="Name" formconfig={cfg.name} testId="n" />}
      />,
      { customStore: store },
    );
    await user.type(inputs()[0], 'Ann');
    expect(store.getState().f0.name).toBe('Ann');
    await waitFor(() => expect(onChange.mock.calls.at(-1)?.[0].hasChanges).toBe(true));
    const last = onChange.mock.calls.at(-1)?.[0] as FormStatus<State>;
    expect(last.currentConfig?.stateFieldName).toBe('name');
    expect(Object.keys(last.inputsChanges)).toEqual(expect.arrayContaining(['name']));
    expect(last.isValid).toBe(true);
  });

  it('[quirk] Form also wires the formConfig (camelCase) key, but Input reads only `formconfig`: nothing is stored', async () => {
    const user = userEvent.setup();
    const { actions, store } = makeStore();
    render(
      <Harness actions={actions} render={(cfg) => <Input label="Name" {...({ formConfig: cfg.name } as object)} />} />,
      { customStore: store },
    );
    await user.type(inputs()[0], 'Bo');
    expect(store.getState().f0.name).toBe('');
  });

  it('wires inputs nested inside plain wrapper elements', async () => {
    const user = userEvent.setup();
    const { actions, store } = makeStore();
    render(
      <Harness
        actions={actions}
        render={(cfg) => (
          <div>
            <section>
              <Input label="Name" formconfig={cfg.name} />
            </section>
          </div>
        )}
      />,
      { customStore: store },
    );
    await user.type(inputs()[0], 'Cy');
    expect(store.getState().f0.name).toBe('Cy');
  });

  it('array fields: tree order gives arrayPosition; typing merges toObject(value) into that element only', async () => {
    const user = userEvent.setup();
    const { actions, store } = makeStore();
    render(
      <Harness
        actions={actions}
        render={(cfg) => (
          <>
            <Input label="Tag 0" formconfig={cfg.tags} testId="t0" />
            <Input label="Tag 1" formconfig={cfg.tags} testId="t1" />
          </>
        )}
      />,
      { customStore: store },
    );
    const second = inputs()[1];
    await user.clear(second);
    await user.type(second, 'X');
    expect(store.getState().f0.tags).toEqual([{ label: 'a' }, { label: 'X' }]);
  });

  it('valueMappers.toObject maps the typed value before it is stored', async () => {
    const user = userEvent.setup();
    const { actions, store } = makeStore();
    render(
      <Harness
        actions={actions}
        inputs={() => ({
          code: {
            fieldType: 'Input',
            valueMappers: { toObject: (v) => String(v).toUpperCase() as never, toPrimitive: (v) => String(v) },
          },
        })}
        render={(cfg) => <Input label="Code" formconfig={cfg.code} />}
      />,
      { customStore: store },
    );
    await user.type(inputs()[0], 'ab');
    expect(store.getState().f0.code).toBe('AB');
  });

  it('nested Form: the inner status goes to the OUTER onChange; the inner onChange is never called', async () => {
    const user = userEvent.setup();
    const { actions, store } = makeStore();
    const outer = vi.fn();
    const inner = vi.fn();
    render(
      <Harness
        actions={actions}
        onChange={outer}
        render={(cfg) => (
          <Form config={cfg} onChange={inner}>
            <Input label="Name" formconfig={cfg.name} />
          </Form>
        )}
      />,
      { customStore: store },
    );
    await user.type(inputs()[0], 'Di');
    expect(inner).not.toHaveBeenCalled();
    await waitFor(() => expect(outer.mock.calls.some(([s]) => s.currentConfig?.stateFieldName === 'name')).toBe(true));
  });

  it('useFormConfig helpers: getData, resetForm, isValid()', async () => {
    const user = userEvent.setup();
    const { actions, store } = makeStore();
    const api = React.createRef<Api>();
    render(
      <Harness
        actions={actions}
        apiRef={api}
        inputs={() => ({ name: { fieldType: 'Input', validation: { required: true } }, title: { fieldType: 'Input' } })}
        render={(cfg) => (
          <>
            <Input label="Name" formconfig={cfg.name} testId="name" />
            <Input label="Title" formconfig={cfg.title} testId="title" />
          </>
        )}
      />,
      { customStore: store },
    );
    expect(api.current?.getData()).toMatchObject({ name: '', title: 'Hello' });
    expect(api.current?.isValid()).toBe(false);
    await user.type(inputs()[0], 'Eve');
    expect(api.current?.getData()).toMatchObject({ name: 'Eve' });
    await waitFor(() => expect(api.current?.isValid()).toBe(true));
    api.current?.resetForm();
    await waitFor(() => expect(store.getState().f0.name).toBe(''));
  });
});
