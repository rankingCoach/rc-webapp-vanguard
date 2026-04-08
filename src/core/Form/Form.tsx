import './Form.scss';

import { useAppDispatch } from '@custom-hooks/use-app-dispatch';
import { FormConfigElement } from '@custom-hooks/useFormConfig';
import { isValidHexColor } from '@helpers/validators/hex-color/hex-color';
import { validInput } from '@helpers/validators/valid-input/valid-input';
import React, { useEffect, useRef, useState } from 'react';

import { FieldConfigProvider, FormConfigProvider, useFormConfigContext } from './FormConfigContext';

type ConfigWithInternal<T> = T & {
  _internalInputs?: React.MutableRefObject<Record<string, FormConfigElement<T>>>;
  _setInternalInputs?: (inputs: Record<string, FormConfigElement<T>>) => void;
};

export type FormStatus<T> = {
  hasChanges: boolean;
  isValid: boolean;
  inputsChanges: Record<keyof T, boolean>;
  inputsStatus: Record<keyof T, boolean>;
  currentConfig: FormConfigElement<T> | null;
};

interface Props<T = any> {
  className?: string;
  children: React.ReactNode;
  onSubmit?: (data: T) => void;
  config?: ConfigWithInternal<T>;
  onChange?: (status: FormStatus<T>) => void;
}

type RuntimeFieldState = {
  errors: any[];
  hasError: boolean;
  isDirty: boolean;
  currentValue: any;
  lastSyncedStateValue: any;
};

const AUTO_BINDABLE_COMPONENTS = new Set([
  'Autocomplete',
  'CheckBox',
  'ColorPicker',
  'DatePicker',
  'DateRangeInput',
  'Input',
  'InputBase',
  'PhoneNumber',
  'PhoneNumberBase',
  'Select',
  'Slider',
  'TimePicker',
]);

const shallowEqualRuntimeMaps = (
  left: Record<string, FormConfigElement<any>>,
  right: Record<string, FormConfigElement<any>>,
) => {
  const leftKeys = Object.keys(left);
  const rightKeys = Object.keys(right);

  if (leftKeys.length !== rightKeys.length) {
    return false;
  }

  return leftKeys.every((key) => left[key] === right[key]);
};

const shallowEqualBooleanRecord = (left: Record<string, boolean>, right: Record<string, boolean>) => {
  const leftKeys = Object.keys(left);
  const rightKeys = Object.keys(right);

  if (leftKeys.length !== rightKeys.length) {
    return false;
  }

  return leftKeys.every((key) => left[key] === right[key]);
};

const shouldKeepStatusKey = (key: string, activeInputs: Record<string, FormConfigElement<any>>) => {
  if (activeInputs[key]) {
    return true;
  }

  return Object.keys(activeInputs).some((activeKey) => activeKey.startsWith(key));
};

const cloneWithoutFormControl = <T,>(config: FormConfigElement<T>): FormConfigElement<T> => ({
  ...config,
  setStateValue: undefined,
  setStateValueArray: undefined,
});

const createStatusEntries = <T,>(runtimeConfig: FormConfigElement<T>, isValid: boolean, hasChanges: boolean) => {
  const stringKey = runtimeConfig.stateFieldName as string;
  const idx = runtimeConfig.arrayPosition !== undefined ? `${runtimeConfig.arrayPosition}` : '';
  const scopedKey = `${stringKey}${idx}`;

  return {
    inputsChanges: {
      [stringKey]: hasChanges,
      [scopedKey]: hasChanges,
    },
    inputsStatus: {
      [stringKey]: isValid,
      [scopedKey]: isValid,
    },
  };
};

const extractFormConfig = (child: React.ReactElement | string | number | boolean) => {
  if (typeof child === 'string' || typeof child === 'number' || typeof child === 'boolean') {
    return null;
  }

  const propsAsAny = child?.props as any;
  return (propsAsAny.formconfig || propsAsAny.formConfig || null) as FormConfigElement | null;
};

const extractFormConfigKey = (
  child: React.ReactElement | string | number | boolean,
): 'formconfig' | 'formConfig' | null => {
  if (typeof child === 'string' || typeof child === 'number' || typeof child === 'boolean') {
    return null;
  }

  const propsAsAny = child?.props as any;
  return propsAsAny.formconfig ? 'formconfig' : propsAsAny.formConfig ? 'formConfig' : null;
};

const getComponentName = (child: React.ReactElement) => {
  const childType = child.type as any;

  if (typeof childType === 'string') {
    return childType;
  }

  return childType?.displayName ?? childType?.name ?? null;
};

const getConfigEntries = (config?: ConfigWithInternal<any>) => {
  if (!config) {
    return [];
  }

  return Object.entries(config).filter(([key]) => !key.startsWith('_'));
};

const getArrayAwareValue = (config: FormConfigElement, value: any, idx?: number) => {
  if (idx === undefined) {
    return value;
  }

  if (Array.isArray(value)) {
    return value[idx];
  }

  return value;
};

const readNextValue = (runtimeConfig: FormConfigElement, args: any[]) => {
  if (runtimeConfig.fieldType === 'Autocomplete') {
    return args[1];
  }

  if (runtimeConfig.fieldType === 'Slider') {
    return args[1];
  }

  const event = args[0];
  if (!event?.target && !event?.currentTarget) {
    return undefined;
  }

  if (runtimeConfig.fieldType === 'Checkbox') {
    return event.target?.checked ?? event.currentTarget?.checked;
  }

  return event.target?.value ?? event.currentTarget?.value;
};

const coerceDispatchValue = (runtimeConfig: FormConfigElement, value: any) => {
  if (runtimeConfig.valueMappers?.toObject) {
    return runtimeConfig.valueMappers.toObject(value);
  }

  if (runtimeConfig.fieldType === 'InputNumber') {
    return value === '' || value === undefined ? undefined : parseInt(value, 10);
  }

  return value;
};

const shouldDispatchValue = (runtimeConfig: FormConfigElement, value: any) => {
  if (runtimeConfig.fieldType === 'ColorPicker') {
    return !value || isValidHexColor(value);
  }

  return true;
};

const hasConfiguredPassError = (runtimeConfig: FormConfigElement<any>) => {
  const passError = runtimeConfig.passError;

  if (Array.isArray(passError)) {
    return passError.some((value) => !!value);
  }

  return !!passError;
};

export const Form = <T,>(props: Props<T>) => {
  const { className, children, config, onChange, onSubmit } = props;
  const dispatch = useAppDispatch();
  const parentContext = useFormConfigContext<T>();
  const effectiveOnChange = parentContext?.parentOnChange || onChange;
  const effectiveOnChangeRef = useRef<typeof effectiveOnChange>(effectiveOnChange);
  const runtimeConfigsRef = useRef<Record<string, FormConfigElement<T>>>({});
  const runtimeStateRef = useRef<Record<string, RuntimeFieldState>>({});
  const latestStatusRef = useRef<FormStatus<Record<string, boolean>>>({
    hasChanges: false,
    isValid: true,
    inputsChanges: {},
    inputsStatus: {},
    currentConfig: null,
  });
  const [status, setStatus] = useState<FormStatus<Record<string, boolean>>>(latestStatusRef.current);

  useEffect(() => {
    effectiveOnChangeRef.current = effectiveOnChange;
  }, [effectiveOnChange]);

  useEffect(() => {
    latestStatusRef.current = status;
    effectiveOnChangeRef.current?.(status as any);
  }, [status]);

  const getRuntimeConfig = (baseConfig: FormConfigElement<T>, idx?: number) => {
    const stringKey = baseConfig.stateFieldName as string;
    const suffix = idx !== undefined ? `${idx}` : '';
    const runtimeKey = `${stringKey}${suffix}`;
    const existing = runtimeConfigsRef.current[runtimeKey] ?? ({ ...baseConfig } as FormConfigElement<T>);
    const fieldState =
      runtimeStateRef.current[runtimeKey] ??
      ({
        errors: baseConfig.errors ?? [],
        hasError: !!baseConfig.hasError,
        isDirty: !!baseConfig.isDirty,
        currentValue: undefined,
        lastSyncedStateValue: Symbol('unsynced'),
      } as RuntimeFieldState);

    runtimeStateRef.current[runtimeKey] = fieldState;

    const stateValue = getArrayAwareValue(baseConfig, baseConfig.stateValue, idx);
    const initialValue = getArrayAwareValue(baseConfig, baseConfig.initialValue, idx);

    Object.assign(existing, baseConfig, {
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
    existing.getInitialValue = () => initialValue as any;
    existing.getValue = () => fieldState.currentValue;

    runtimeConfigsRef.current[runtimeKey] = existing;
    return existing;
  };

  const updateStatusFromConfig = (runtimeConfig: FormConfigElement<T>, shouldCommitErrors: boolean) => {
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
  };

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

  const buildChildren = (childNodes: React.ReactNode) => {
    const idxMap: Record<string, number> = {};
    const activeInputs: Record<string, FormConfigElement<T>> = {};
    const configEntries = getConfigEntries(config);
    let autoConfigIndex = 0;

    const mapChildren = (nodes: React.ReactNode): React.ReactNode =>
      React.Children.map(nodes, (child) => {
        if (!React.isValidElement(child)) {
          return child;
        }

        let childConfig = extractFormConfig(child);
        const formConfigKey = extractFormConfigKey(child);
        const propsAsAny = child.props as any;
        const componentName = getComponentName(child);

        if (!childConfig && componentName && AUTO_BINDABLE_COMPONENTS.has(componentName)) {
          const nextEntry = configEntries[autoConfigIndex];
          if (nextEntry) {
            autoConfigIndex += 1;
            childConfig = nextEntry[1] as FormConfigElement<T>;
          }
        }

        if (!childConfig?.stateFieldName) {
          if (!propsAsAny.children) {
            return child;
          }

          return React.cloneElement(child, {}, mapChildren(propsAsAny.children));
        }

        let idx: number | undefined;
        if (childConfig.isArray) {
          const key = childConfig.stateFieldName;
          idxMap[key] = idxMap[key] !== undefined ? idxMap[key] + 1 : 0;
          idx = idxMap[key];
        }

        const runtimeConfig = getRuntimeConfig(childConfig, idx);
        const runtimeKey = `${runtimeConfig.stateFieldName}${runtimeConfig.arrayPosition ?? ''}`;
        activeInputs[runtimeKey] = runtimeConfig;

        const shouldPreserveControl = propsAsAny.phoneNumberBase !== undefined;
        const injectedConfig = shouldPreserveControl ? runtimeConfig : cloneWithoutFormControl(runtimeConfig);
        const originalOnChange = propsAsAny.onChange;
        const nextProps: Record<string, any> = {
          onChange: (...args: any[]) => {
            const nextValue = readNextValue(runtimeConfig, args);
            runtimeStateRef.current[runtimeKey].currentValue = nextValue;
            dispatchValueUpdate(runtimeConfig, nextValue);
            originalOnChange?.(...args);
            updateStatusFromConfig(runtimeConfig, runtimeConfig.validateOn !== 'blur');
          },
        };

        if (propsAsAny.phoneNumberBase !== undefined) {
          const originalEvents = propsAsAny.phoneNumberBaseInputEvents ?? {};
          nextProps.phoneNumberBase = runtimeConfig.stateValue ?? propsAsAny.phoneNumberBase ?? '';
          nextProps.phoneNumberBaseInputEvents = {
            ...originalEvents,
            onChange: (...args: any[]) => {
              const nextValue = readNextValue(runtimeConfig, args);
              runtimeStateRef.current[runtimeKey].currentValue = nextValue;
              dispatchValueUpdate(runtimeConfig, nextValue);
              originalEvents.onChange?.(...args);
              updateStatusFromConfig(runtimeConfig, runtimeConfig.validateOn !== 'blur');
            },
          };
          delete nextProps.onChange;
        }

        if (formConfigKey && !AUTO_BINDABLE_COMPONENTS.has(componentName ?? '')) {
          nextProps[formConfigKey] = injectedConfig;
        }

        if (runtimeConfig.fieldType === 'Checkbox') {
          nextProps.checked = !!(runtimeConfig.stateValue ?? propsAsAny.checked);
        } else if (
          runtimeConfig.fieldType !== 'ColorPicker' &&
          propsAsAny.phoneNumberBase === undefined &&
          (runtimeConfig.stateValue !== undefined || propsAsAny.value !== undefined)
        ) {
          nextProps.value = runtimeConfig.stateValue ?? propsAsAny.value ?? '';
        }

        if (propsAsAny.children) {
          nextProps.children = mapChildren(propsAsAny.children);
        }

        return (
          <FieldConfigProvider key={child.key ?? runtimeKey} fieldConfig={injectedConfig}>
            {React.cloneElement(child, nextProps)}
          </FieldConfigProvider>
        );
      });

    return {
      activeInputs,
      children: mapChildren(childNodes),
    };
  };

  const builtChildren = buildChildren(children);

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

    const previousStatus = latestStatusRef.current;
    const filteredInputsChanges = Object.fromEntries(
      Object.entries(previousStatus.inputsChanges).filter(([key]) => shouldKeepStatusKey(key, builtChildren.activeInputs)),
    ) as Record<string, boolean>;
    const filteredInputsStatus = Object.fromEntries(
      Object.entries(previousStatus.inputsStatus).filter(([key]) => shouldKeepStatusKey(key, builtChildren.activeInputs)),
    ) as Record<string, boolean>;
    const firstActiveInput = Object.values(builtChildren.activeInputs)[0] ?? null;

    if (previousStatus.currentConfig === null && firstActiveInput) {
      const initialStatuses = Object.values(builtChildren.activeInputs).reduce(
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
  });

  const submitAction = async () => {
    onSubmit?.(
      config?._internalInputs
        ? (Object.fromEntries(
            Object.entries(config._internalInputs.current).map(([key, value]) => [key, value.getValue?.()]),
          ) as T)
        : ({} as T),
    );
  };

  const classes = `Form-container ${className ?? ''}`.trim();
  const isRootForm = !parentContext;

  return (
    <FormConfigProvider formConfig={config || null} parentOnChange={effectiveOnChange}>
      {isRootForm ? (
        <form className={classes} action={submitAction}>
          {builtChildren.children}
        </form>
      ) : (
        <div className={classes}>{builtChildren.children}</div>
      )}
    </FormConfigProvider>
  );
};

export { useFormConfigContext } from './FormConfigContext';
