/**
 * F4: a Redux-free form backend for new forms. Same field-element shape as `useFormConfig` (so `<Form config>`,
 * FormElement, the F3 `field` path and every input work unchanged), but the values live in a per-form store
 * (src/primitives/core/form-store.ts) instead of a Redux slice: no react-redux, no Provider, typed values.
 *
 * How it plugs in: each element's `reducer` is the current values object and its `slice` holds the
 * `set<Key>` / `set<Key>inArray` setters FormElement looks up by naming convention. Like Redux action creators they
 * are pure; they return a local form action that the F1 seam applies itself, so no Redux store is ever needed.
 */
import { setFieldValidity, validInput } from '@helpers/validators/valid-input/valid-input';
import type { ValidationResultWithInfo } from '@vanguard/Form/extract-error-scopes';
import { useActionState, useCallback, useEffect, useMemo, useRef, useSyncExternalStore } from 'react';
import { createFormStore, FormStore } from '../primitives/core/form-store';
import { LocalFormAction, localFormAction, withBeforeAction } from '../primitives/react/form/local-form-action';
import type { FormConfig, FormConfigElement } from './useFormConfig';

export interface UseFormStoreOptions<T extends object, R = unknown> {
  /** The form's values; their keys are the form's fields. */
  initialValues: T;
  /** Per-field config (fieldType, validation, valueMappers, errorMatching, ...), as in `useFormConfig`. */
  inputs?: Partial<FormConfig<T>>;
  validateOn?: 'change' | 'blur';
  /** Server-side errors to match against each field's `errorMatching` (re-applied whenever this changes). */
  serverErrors?: ValidationResultWithInfo[];
  /**
   * F5: React 19 action for `<Form action={form.formAction}>`. Receives the typed values (not FormData) and the
   * previous result and runs inside a transition; its return value becomes `result` (`useActionState`). Pending is
   * read with `useFormStatus` inside the form. Not started (the submit is prevented) while the form is invalid,
   * unless `validateBeforeAction` is false.
   */
  action?: (values: T, previous: R | undefined) => R | Promise<R>;
  validateBeforeAction?: boolean;
}

export interface UseFormStoreResult<T extends object, R = unknown> {
  formConfig: Partial<FormConfig<T>>;
  /** Current values (re-renders the owner on every change). */
  values: T;
  setValue: <K extends keyof T>(key: K, value: T[K]) => void;
  isValid: () => boolean;
  getData: () => Partial<T>;
  getChangedData: () => Partial<T>;
  resetForm: () => void;
  validateFromState: () => void;
  store: FormStore<T>;
  /** F5: pass to `<Form action>`; runs `options.action` with the current values. */
  formAction: (formData?: FormData) => void;
  /** F5: the last value the action returned (undefined before the first run). Pending: `useFormStatus` in children. */
  result: R | undefined;
}

const capitalize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

type Internal = Record<string, FormConfigElement>;

const traverseObject = (obj: unknown, path: string): unknown => {
  let current = obj as Record<string, unknown> | undefined;
  for (const key of path.split('.')) {
    if (current && Object.hasOwn(current, key)) current = current[key] as Record<string, unknown>;
    else return undefined;
  }
  return current;
};

/** `useFormConfig`'s server-error matching, for one input. */
const matchServerError = (input: FormConfigElement, errors: ValidationResultWithInfo[]): string => {
  let message = '';
  for (const serverError of errors) {
    const matchings = Array.isArray(input.errorMatching)
      ? input.errorMatching
      : input.errorMatching
        ? [input.errorMatching]
        : [];
    for (const matching of matchings) {
      for (const path in matching) {
        if (!Object.hasOwn(matching, path)) continue;
        const expected = matching[path];
        const found = traverseObject(serverError, path);
        if (found === undefined) continue;
        if (expected === true || (typeof expected === 'string' && expected === found)) {
          message = (serverError as { errorMessage?: string }).errorMessage ?? '';
          break;
        }
      }
    }
  }
  return message;
};

const domValue = function (this: FormConfigElement) {
  // Same DOM read as useFormConfig's getValue, per field type.
  const node = this._inputRef?.current;
  if (this.fieldType === 'InputNumber') return parseInt(node?.value, 10);
  if (this.fieldType === 'Checkbox') return node?.checked as boolean;
  return (node?.value ?? undefined) as string;
};

export function useFormStore<T extends object, R = unknown>(
  options: UseFormStoreOptions<T, R>,
): UseFormStoreResult<T, R> {
  const {
    initialValues,
    inputs: inputConfig = {},
    validateOn = 'change',
    serverErrors,
    action,
    validateBeforeAction = true,
  } = options;
  const storeRef = useRef<FormStore<T> | undefined>(undefined);
  if (!storeRef.current) storeRef.current = createFormStore(initialValues);
  const store = storeRef.current;
  const values = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);

  const internalInputs = useRef<Internal>({});
  // Stable refs per field (useFormConfig keeps them in useRef per render; here one map for the form's lifetime).
  const refs = useRef<Record<string, { input: { current: unknown }; autocomplete: { current: unknown } }>>({});

  const slice = useMemo(() => {
    // Pure, like Redux action creators: calling a setter changes nothing until the seam applies its result.
    const setters: Record<string, (arg: unknown) => LocalFormAction> = {};
    for (const key of Object.keys(initialValues)) {
      setters[`set${capitalize(key)}`] = (value) =>
        localFormAction(() => store.set(key as keyof T, value as T[keyof T]));
      setters[`set${capitalize(key)}inArray`] = (arg) => {
        const { el, idx } = arg as { el: unknown; idx: number };
        return localFormAction(() => store.setAt(key as keyof T, idx, el));
      };
    }
    return setters;
  }, [store, initialValues]);

  // Rebuilt every render, like useFormConfig's elements: `reducer` carries the latest values.
  const formConfig: Record<string, unknown> = {};
  for (const key of Object.keys(initialValues)) {
    refs.current[key] ??= { input: { current: null }, autocomplete: { current: null } };
    formConfig[key] = {
      ...(inputConfig as Record<string, FormConfigElement>)[key],
      _autocompleteRef: refs.current[key].autocomplete,
      _inputRef: refs.current[key].input,
      stateFieldName: key,
      reducer: values,
      slice,
      stateValue: null,
      setStateValue: null,
      setStateValueArray: null,
      validateOn,
      getValue: domValue,
      initialValue: (initialValues as Record<string, unknown>)[key],
      getInitialValue: function (this: FormConfigElement) {
        return this.initialValue;
      },
      errors: null,
      setErrors: null,
      hasError: null,
      setHasError: null,
      isDirty: null,
      setIsDirty: null,
    } satisfies FormConfigElement & { reducer: T; slice: typeof slice };
  }
  const suffix = (input: FormConfigElement) => (input.arrayPosition ? `${input.arrayPosition}` : '');
  formConfig._addInternalInput = (input: FormConfigElement) => {
    if (!input.stateFieldName) return;
    internalInputs.current[input.stateFieldName + suffix(input)] = input;
  };
  formConfig._removeInternalInput = (input: FormConfigElement) => {
    if (!input.stateFieldName) return;
    delete internalInputs.current[input.stateFieldName + suffix(input)];
  };
  formConfig._internalInputs = internalInputs;

  const isValid = useCallback(() => {
    let valid = true;
    for (const key in internalInputs.current) valid = validInput(internalInputs.current[key]) && valid;
    return valid;
  }, []);

  // Side-effect-free validity for the submit check: validInput on a copy whose error setters are no-ops. Updating
  // field error state during the submit event cancels the form's pending (useFormStatus) state, so the visible
  // validation (isValid) only runs when the form is invalid and the submit is prevented anyway.
  const canSubmit = useCallback(() => {
    let valid = true;
    for (const key in internalInputs.current) {
      const input = internalInputs.current[key];
      valid = validInput({ ...input, setErrors: () => undefined, setHasError: undefined }) && valid;
    }
    if (!valid) isValid();
    return valid;
  }, [isValid]);

  const getData = useCallback((): Partial<T> => ({ ...store.getSnapshot() }), [store]);

  const getChangedData = useCallback((): Partial<T> => {
    const snapshot = store.getSnapshot() as Record<string, unknown>;
    const data: Record<string, unknown> = {};
    for (const key in internalInputs.current) {
      const input = internalInputs.current[key];
      if (input?.isDirty && input.stateFieldName) data[input.stateFieldName] = snapshot[input.stateFieldName];
    }
    return data as Partial<T>;
  }, [store]);

  const validateFromState = useCallback(() => {
    if (!serverErrors) return;
    for (const key in internalInputs.current) {
      const input = internalInputs.current[key];
      const message = matchServerError(input, serverErrors);
      if (message) setFieldValidity(input, false, message as never);
      else setFieldValidity(input, true);
    }
  }, [serverErrors]);

  useEffect(() => {
    if (serverErrors && serverErrors.length > 0) validateFromState();
  }, [serverErrors, validateFromState]);

  const actionRef = useRef(action);
  actionRef.current = action;
  const [result, formAction] = useActionState<R | undefined, FormData | undefined>(async (previous) => {
    const run = actionRef.current;
    if (!run) return previous;
    return run(store.getSnapshot(), previous);
  }, undefined);

  return {
    formConfig: formConfig as Partial<FormConfig<T>>,
    // Validation runs in the submit event (Form calls the attached check and prevents the submit when invalid).
    formAction: useMemo(
      () => (validateBeforeAction ? withBeforeAction(formAction, canSubmit) : formAction),
      [formAction, canSubmit, validateBeforeAction],
    ) as (formData?: FormData) => void,
    result,
    values,
    setValue: store.set,
    isValid,
    getData,
    getChangedData,
    resetForm: store.reset,
    validateFromState,
    store,
  };
}
