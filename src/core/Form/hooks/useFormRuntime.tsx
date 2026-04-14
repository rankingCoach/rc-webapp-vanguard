import { useAppDispatch } from '@custom-hooks/use-app-dispatch';
import { FormConfigElement } from '@custom-hooks/useFormConfig';
import { useCallback, useEffect } from 'react';

import { ConfigWithInternal, FormStatus, RuntimeFieldBinding } from './form.types';
import { coerceDispatchValue, readNextValue, shallowEqualRuntimeMaps, shouldDispatchValue } from './form.utils';
import { useBuiltFormChildren } from './useBuiltFormChildren';
import { useFormStatus } from './useFormStatus';
import { useRuntimeConfigRegistry } from './useRuntimeConfigRegistry';

type UseFormRuntimeParams<T> = {
  children: React.ReactNode;
  config?: ConfigWithInternal<T>;
  onChange?: (status: FormStatus<T>) => void;
};

export const useFormRuntime = <T,>({ children, config, onChange }: UseFormRuntimeParams<T>) => {
  const dispatch = useAppDispatch();
  const { getRuntimeConfig, runtimeStateRef } = useRuntimeConfigRegistry<T>();
  const { status, syncDerivedStatus, updateStatusFromConfig } = useFormStatus<T>({ onChange });

  // dispatch is stable (Redux guarantee); wrap in useCallback so downstream
  // memos that depend on dispatchValueUpdate don't invalidate on every render.
  const dispatchValueUpdate = useCallback((runtimeConfig: FormConfigElement<T>, rawValue: any) => {
    const nextValue = coerceDispatchValue(runtimeConfig, rawValue);

    if (!shouldDispatchValue(runtimeConfig, nextValue)) {
      return;
    }

    if (runtimeConfig.arrayPosition !== undefined && runtimeConfig.setStateValueArray) {
      dispatch(runtimeConfig.setStateValueArray({ el: nextValue, idx: runtimeConfig.arrayPosition }));
      return;
    }

    if (runtimeConfig.setStateValue) {
      dispatch(runtimeConfig.setStateValue(nextValue));
    }
  }, [dispatch]);

  // Stable reference: only re-created when dispatch or status helpers change (which is
  // almost never). Previously this was an inline arrow function that invalidated the
  // useMemo in useBuiltFormChildren on every single render, re-mapping all 30+ children.
  const onValueChange = useCallback((
    runtimeConfig: FormConfigElement<T>,
    runtimeKey: string,
    args: any[],
    binding: RuntimeFieldBinding<T>,
  ) => {
    const nextValue = binding?.readValue ? binding.readValue(args, runtimeConfig) : readNextValue(runtimeConfig, args);
    const runtimeState = runtimeStateRef.current[runtimeKey];
    const commitGuard = binding?.shouldCommitValue ?? ((value: any, configValue: FormConfigElement<T>) => shouldDispatchValue(configValue, coerceDispatchValue(configValue, value)));
    const shouldCommitValue = commitGuard(nextValue, runtimeConfig);

    if (runtimeState) {
      runtimeState.inputValue = nextValue;
      runtimeState.currentValue = nextValue;
    }

    if (shouldCommitValue) {
      dispatchValueUpdate(runtimeConfig, nextValue);
    }
    updateStatusFromConfig(runtimeConfig, runtimeConfig.validateOn !== 'blur');
  }, [dispatchValueUpdate, updateStatusFromConfig, runtimeStateRef]);

  const onFieldBlur = useCallback((runtimeConfig: FormConfigElement<T>) => {
    if (runtimeConfig.validateOn === 'blur') {
      updateStatusFromConfig(runtimeConfig, true);
    }
  }, [updateStatusFromConfig]);

  const builtChildren = useBuiltFormChildren<T>({
    children,
    config,
    getRuntimeConfig,
    onValueChange,
    onFieldBlur,
  });

  useEffect(() => {
    if (!config) {
      return;
    }

    const previousInputs = config._internalInputs?.current ?? {};
    if (!shallowEqualRuntimeMaps(previousInputs, builtChildren.activeInputs)) {
      if (config._setInternalInputs) {
        config._setInternalInputs(builtChildren.activeInputs);
      } else if (config._internalInputs) {
        config._internalInputs.current = builtChildren.activeInputs;
      }
    }

    syncDerivedStatus(config, builtChildren.activeInputs);
  });

  return {
    builtChildren,
    status,
  };
};
