import { useAppDispatch } from '@custom-hooks/use-app-dispatch';
import { FormConfigElement } from '@custom-hooks/useFormConfig';
import { useEffect } from 'react';

import { ConfigWithInternal, FormStatus } from './form.types';
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

  const dispatchValueUpdate = (runtimeConfig: FormConfigElement<T>, rawValue: any) => {
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
  };

  const builtChildren = useBuiltFormChildren<T>({
    children,
    config,
    getRuntimeConfig,
    onValueChange: (runtimeConfig, runtimeKey, args) => {
      const nextValue = readNextValue(runtimeConfig, args);
      runtimeStateRef.current[runtimeKey].currentValue = nextValue;
      dispatchValueUpdate(runtimeConfig, nextValue);
      updateStatusFromConfig(runtimeConfig, runtimeConfig.validateOn !== 'blur');
    },
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
