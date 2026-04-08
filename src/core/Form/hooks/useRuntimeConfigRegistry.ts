import { FormConfigElement } from '@custom-hooks/useFormConfig';
import { useRef } from 'react';

import { RuntimeFieldBinding, RuntimeFieldState } from './form.types';
import { getArrayAwareValue } from './form.utils';

export const useRuntimeConfigRegistry = <T,>() => {
  const runtimeConfigsRef = useRef<Record<string, FormConfigElement<T>>>({});
  const runtimeStateRef = useRef<Record<string, RuntimeFieldState>>({});

  const getRuntimeConfig = (binding: RuntimeFieldBinding<T>) => {
    const { runtimeKey, baseConfig, idx, fieldName, fieldType } = binding;
    const existing = runtimeConfigsRef.current[runtimeKey] ?? ({ ...baseConfig } as FormConfigElement<T>);
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

    const stateValue = getArrayAwareValue(baseConfig, baseConfig.stateValue, idx);
    const initialValue = getArrayAwareValue(baseConfig, baseConfig.initialValue, idx);

    Object.assign(existing, baseConfig, {
      stateFieldName: fieldName,
      fieldType,
      arrayPosition: idx,
      stateValue,
      initialValue,
      errors: fieldState.errors,
      hasError: fieldState.hasError,
      isDirty: fieldState.isDirty,
      _inputRef: existing._inputRef ?? baseConfig._inputRef ?? { current: null },
      _autocompleteRef: existing._autocompleteRef ?? baseConfig._autocompleteRef ?? { current: null },
    });

    if (baseConfig.valueMappers?.toPrimitive) {
      existing.stateValue = baseConfig.valueMappers.toPrimitive(existing.stateValue);
    }

    if (fieldState.lastSyncedStateValue !== existing.stateValue) {
      fieldState.currentValue = existing.stateValue;
      fieldState.inputValue = existing.stateValue;
      fieldState.lastSyncedStateValue = existing.stateValue;
    }

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
      fieldState.isDirty = typeof nextIsDirty === 'function' ? !!nextIsDirty(fieldState.isDirty as any) : !!nextIsDirty;
      existing.isDirty = fieldState.isDirty;
    };
    existing.setInputValue = (nextInputValue) => {
      fieldState.inputValue = typeof nextInputValue === 'function' ? nextInputValue(fieldState.inputValue) : nextInputValue;
    };
    existing.getInitialValue = () => initialValue as any;
    existing.getValue = () => fieldState.currentValue;
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
