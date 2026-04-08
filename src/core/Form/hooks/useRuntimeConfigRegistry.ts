import { FormConfigElement } from '@custom-hooks/useFormConfig';
import { useRef } from 'react';

import { RuntimeFieldBinding, RuntimeFieldState } from './form.types';
import { getArrayAwareValue } from './form.utils';

export const useRuntimeConfigRegistry = <T,>() => {
  const runtimeConfigsRef = useRef<Record<string, FormConfigElement<T>>>({});
  const runtimeStateRef = useRef<Record<string, RuntimeFieldState>>({});

  /**
   * Builds or refreshes the runtime config object for a bound field.
   *
   * The registry owns the runtime object; it is never replaced, only mutated in place
   * so that child components holding a reference to it always see the latest values.
   *
   * Layering order (later layers win):
   *   1. Parent-provided behavioural config  — spread from baseConfig (validation, mappers, Redux hooks…)
   *   2. Registry-derived identity fields    — stateFieldName, fieldType, arrayPosition, stateValue, initialValue
   *   3. Runtime-managed mutable state       — errors, hasError, isDirty, refs
   *   4. Registry-owned accessor functions   — getValue, getInputValue, getInitialValue, set* callbacks
   *
   * Children must not mutate the returned object — they receive a copy (cloneWithoutFormControl)
   * or read it via FieldConfigContext.
   */
  const getRuntimeConfig = (binding: RuntimeFieldBinding<T>) => {
    const { runtimeKey, baseConfig, idx, fieldName, fieldType } = binding;

    // Reuse the existing runtime object if present — identity stability prevents unnecessary child re-renders
    const existing = runtimeConfigsRef.current[runtimeKey] ?? ({ ...baseConfig } as FormConfigElement<T>);

    // Per-field runtime state survives re-renders; initialised from the parent config's initial state
    const fieldState =
      runtimeStateRef.current[runtimeKey] ??
      ({
        errors: baseConfig.errors ?? [],
        hasError: !!baseConfig.hasError,
        isDirty: !!baseConfig.isDirty,
        currentValue: undefined,
        inputValue: undefined,
        lastSyncedStateValue: Symbol('unsynced'),
      } as RuntimeFieldState);

    runtimeStateRef.current[runtimeKey] = fieldState;

    // Layer 1 — parent-provided behavioural config
    // Spread all of baseConfig first so that any fields not explicitly overridden below
    // (e.g. valueMappers, prevention, serverSideErrorsField, custom fields) are preserved.
    // baseConfig always comes from the parent's form config entry (useFormConfig), never
    // directly from child-embedded props; resolveFieldName guarantees this priority.
    Object.assign(existing, baseConfig);

    // Layer 2 — registry-derived identity: stateFieldName and fieldType are authoritative
    // from the binding (derived from component name + explicit props), not from baseConfig.
    const stateValue = getArrayAwareValue(baseConfig, baseConfig.stateValue, idx);
    const initialValue = getArrayAwareValue(baseConfig, baseConfig.initialValue, idx);

    existing.stateFieldName = fieldName;
    existing.fieldType = fieldType;
    existing.arrayPosition = idx;
    existing.stateValue = stateValue;
    existing.initialValue = initialValue;

    // Layer 3 — runtime-managed mutable state: refs are preserved across renders once created
    existing._inputRef = existing._inputRef ?? baseConfig._inputRef ?? { current: null };
    existing._autocompleteRef = existing._autocompleteRef ?? baseConfig._autocompleteRef ?? { current: null };
    existing.errors = fieldState.errors;
    existing.hasError = fieldState.hasError;
    existing.isDirty = fieldState.isDirty;

    // Apply value mapper after all layers have settled
    if (baseConfig.valueMappers?.toPrimitive) {
      existing.stateValue = baseConfig.valueMappers.toPrimitive(existing.stateValue);
    }

    // Sync currentValue/inputValue only when the Redux state value has actually changed,
    // so that in-flight user edits (inputValue) are not overwritten by Redux re-renders.
    if (fieldState.lastSyncedStateValue !== existing.stateValue) {
      fieldState.currentValue = existing.stateValue;
      fieldState.inputValue = existing.stateValue;
      fieldState.lastSyncedStateValue = existing.stateValue;
    }

    // Layer 4 — registry-owned accessor and mutator functions.
    // These close over fieldState so they always operate on the live mutable state object.
    existing.setErrors = (nextErrors) => {
      fieldState.errors = typeof nextErrors === 'function' ? nextErrors(fieldState.errors as any) : nextErrors ?? [];
      existing.errors = fieldState.errors;
    };
    existing.setHasError = (nextHasError) => {
      fieldState.hasError =
        typeof nextHasError === 'function' ? !!nextHasError(fieldState.hasError as any) : !!nextHasError;
      existing.hasError = fieldState.hasError;
    };
    existing.setIsDirty = (nextIsDirty) => {
      fieldState.isDirty =
        typeof nextIsDirty === 'function' ? !!nextIsDirty(fieldState.isDirty as any) : !!nextIsDirty;
      existing.isDirty = fieldState.isDirty;
    };
    existing.setInputValue = (nextInputValue) => {
      fieldState.inputValue =
        typeof nextInputValue === 'function' ? nextInputValue(fieldState.inputValue) : nextInputValue;
    };
    existing.getInitialValue = () => initialValue as any;
    // getValue returns the current runtime value (updated on every onChange before Redux round-trips)
    existing.getValue = () => fieldState.currentValue;
    // getInputValue returns the raw display value (may differ from committed value for ColorPicker)
    existing.getInputValue = () => fieldState.inputValue;

    runtimeConfigsRef.current[runtimeKey] = existing;
    return existing;
  };

  return {
    getRuntimeConfig,
    runtimeConfigsRef,
    runtimeStateRef,
  };
};
