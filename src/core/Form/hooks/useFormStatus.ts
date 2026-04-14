import { FormConfigElement } from '@custom-hooks/useFormConfig';
import { validInput } from '@helpers/validators/valid-input/valid-input';
import { useCallback, useEffect, useRef, useState } from 'react';

import { FormStatus } from './form.types';
import { createStatusEntries, hasConfiguredPassError, shallowEqualBooleanRecord, shouldKeepStatusKey } from './form.utils';

type UseFormStatusParams<T> = {
  onChange?: (status: FormStatus<T>) => void;
};

export const useFormStatus = <T,>({ onChange }: UseFormStatusParams<T>) => {
  const latestStatusRef = useRef<FormStatus<Record<string, boolean>>>({
    hasChanges: false,
    isValid: true,
    inputsChanges: {},
    inputsStatus: {},
    currentConfig: null,
  });
  const [status, setStatus] = useState<FormStatus<Record<string, boolean>>>(latestStatusRef.current);
  const onChangeRef = useRef<typeof onChange>(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    latestStatusRef.current = status;
    onChangeRef.current?.(status as any);
  }, [status]);

  const updateStatusFromConfig = useCallback((runtimeConfig: FormConfigElement<T>, shouldCommitErrors: boolean) => {
    const stringKey = runtimeConfig.stateFieldName as string;
    const idx = runtimeConfig.arrayPosition !== undefined ? `${runtimeConfig.arrayPosition}` : '';
    const changeKey = `${stringKey}${idx}`;
    const hasChanges = runtimeConfig.getValue?.() != runtimeConfig.getInitialValue?.();
    const isValid = shouldCommitErrors
      ? validInput(runtimeConfig)
      : validInput(runtimeConfig, runtimeConfig.validateOn === 'blur');

    runtimeConfig.setIsDirty?.(hasChanges);

    setStatus((prev) => {
      const nextInputsChanges = {
        ...prev.inputsChanges,
        [stringKey]: hasChanges,
        [changeKey]: hasChanges,
      };
      const nextInputsStatus = {
        ...prev.inputsStatus,
        [stringKey]: isValid,
        [changeKey]: isValid,
      };

      const nextStatus = {
        hasChanges: Object.values(nextInputsChanges).some(Boolean),
        isValid: Object.values(nextInputsStatus).every((value) => value !== false),
        inputsChanges: nextInputsChanges,
        inputsStatus: nextInputsStatus,
        currentConfig: runtimeConfig,
      };

      latestStatusRef.current = nextStatus as any;
      return nextStatus as any;
    });
  // updateStatusFromConfig only closes over stable refs (latestStatusRef, setStatus) and
  // imported pure utilities — no reactive deps needed.
  }, []);

  const syncDerivedStatus = useCallback((config: any, activeInputs: Record<string, FormConfigElement<T>>) => {
    if (!config) {
      return;
    }

    const previousStatus = latestStatusRef.current;
    const filteredInputsChanges = Object.fromEntries(
      Object.entries(previousStatus.inputsChanges).filter(([key]) => shouldKeepStatusKey(key, activeInputs)),
    ) as Record<string, boolean>;
    const filteredInputsStatus = Object.fromEntries(
      Object.entries(previousStatus.inputsStatus).filter(([key]) => shouldKeepStatusKey(key, activeInputs)),
    ) as Record<string, boolean>;
    const firstActiveInput = Object.values(activeInputs)[0] ?? null;

    if (previousStatus.currentConfig === null && firstActiveInput) {
      const initialStatuses = Object.values(activeInputs).reduce(
        (acc, input) => {
          if (!hasConfiguredPassError(input)) {
            return acc;
          }

          const isValid = validInput(input);
          const entries = createStatusEntries(input, isValid, false);

          return {
            inputsChanges: { ...acc.inputsChanges, ...entries.inputsChanges },
            inputsStatus: { ...acc.inputsStatus, ...entries.inputsStatus },
          };
        },
        {
          inputsChanges: {} as Record<string, boolean>,
          inputsStatus: {} as Record<string, boolean>,
        },
      );

      const nextStatus = {
        hasChanges: false,
        isValid: Object.values(initialStatuses.inputsStatus).every((value) => value !== false),
        inputsChanges: initialStatuses.inputsChanges as any,
        inputsStatus: initialStatuses.inputsStatus as any,
        currentConfig: firstActiveInput,
      };

      latestStatusRef.current = nextStatus as any;
      setStatus(nextStatus as any);
      return;
    }

    const allValid = Object.values(filteredInputsStatus).every((value) => value !== false);
    const anyChanges = Object.values(filteredInputsChanges).some(Boolean);
    const didChange =
      !shallowEqualBooleanRecord(previousStatus.inputsChanges as any, filteredInputsChanges) ||
      !shallowEqualBooleanRecord(previousStatus.inputsStatus as any, filteredInputsStatus) ||
      previousStatus.hasChanges !== anyChanges ||
      previousStatus.isValid !== allValid;

    if (!didChange) {
      return;
    }

    const nextStatus = {
      hasChanges: anyChanges,
      isValid: allValid,
      inputsChanges: filteredInputsChanges as any,
      inputsStatus: filteredInputsStatus as any,
      currentConfig: previousStatus.currentConfig ?? firstActiveInput,
    };

    latestStatusRef.current = nextStatus as any;
    setStatus(nextStatus as any);
  // syncDerivedStatus only closes over stable refs (latestStatusRef, setStatus) and
  // imported pure utilities — no reactive deps needed.
  }, []);

  return {
    latestStatusRef,
    status,
    syncDerivedStatus,
    updateStatusFromConfig,
  };
};

