import { FormConfigElement, FormFieldType } from '@custom-hooks/useFormConfig';
import { isValidHexColor, normalizeHexColor } from '@helpers/validators/hex-color/hex-color';
import React from 'react';

import type { ConfigWithInternal, RuntimeFieldBinding } from './form.types';

export const AUTO_BINDABLE_COMPONENTS = new Set([
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

export const COMPONENT_FIELD_TYPES: Record<string, FormFieldType> = {
  Autocomplete: 'Autocomplete',
  CheckBox: 'Checkbox',
  ColorPicker: 'ColorPicker',
  Input: 'Input',
  InputBase: 'InputBase',
  PhoneNumber: 'Input',
  PhoneNumberBase: 'Input',
  Select: 'Select',
  Slider: 'Slider',
  Textarea: 'Textarea',
};

export const shallowEqualRuntimeMaps = (
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

export const shallowEqualBooleanRecord = (left: Record<string, boolean>, right: Record<string, boolean>) => {
  const leftKeys = Object.keys(left);
  const rightKeys = Object.keys(right);

  if (leftKeys.length !== rightKeys.length) {
    return false;
  }

  return leftKeys.every((key) => left[key] === right[key]);
};

export const shouldKeepStatusKey = (key: string, activeInputs: Record<string, FormConfigElement<any>>) => {
  if (activeInputs[key]) {
    return true;
  }

  return Object.keys(activeInputs).some((activeKey) => activeKey.startsWith(key));
};

export const cloneWithoutFormControl = <T,>(config: FormConfigElement<T>): FormConfigElement<T> => ({
  ...config,
  setStateValue: undefined,
  setStateValueArray: undefined,
});

export const createStatusEntries = <T,>(runtimeConfig: FormConfigElement<T>, isValid: boolean, hasChanges: boolean) => {
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

export const extractFormConfig = (child: React.ReactElement | string | number | boolean) => {
  if (typeof child === 'string' || typeof child === 'number' || typeof child === 'boolean') {
    return null;
  }

  const propsAsAny = child?.props as any;
  return (propsAsAny.fieldConfig || propsAsAny.formconfig || propsAsAny.formConfig || null) as FormConfigElement | null;
};

export const extractFormConfigKey = (
  child: React.ReactElement | string | number | boolean,
): 'fieldConfig' | 'formconfig' | 'formConfig' | null => {
  if (typeof child === 'string' || typeof child === 'number' || typeof child === 'boolean') {
    return null;
  }

  const propsAsAny = child?.props as any;
  return propsAsAny.fieldConfig ? 'fieldConfig' : propsAsAny.formconfig ? 'formconfig' : propsAsAny.formConfig ? 'formConfig' : null;
};

export const resolveFieldType = (
  componentName: string | null,
  childProps: Record<string, any>,
  legacyConfig?: FormConfigElement | null,
): FormFieldType | null => {
  if (childProps.type === 'number') {
    return 'InputNumber';
  }

  if (childProps.multiline) {
    return 'Textarea';
  }

  if (componentName && COMPONENT_FIELD_TYPES[componentName]) {
    return COMPONENT_FIELD_TYPES[componentName];
  }

  return legacyConfig?.fieldType ?? null;
};

export const resolveFieldName = <T,>(
  childProps: Record<string, any>,
  config?: ConfigWithInternal<T>,
  autoConfigIndex?: number,
) => {
  const explicitName = childProps.name;
  if (typeof explicitName === 'string' && explicitName.trim()) {
    return {
      fieldName: explicitName,
      baseConfig: (config?.[explicitName as keyof T] as FormConfigElement<T> | undefined) ?? null,
      usesLegacyFallback: false,
    };
  }

  const legacyConfig = (childProps.fieldConfig || childProps.formconfig || childProps.formConfig || null) as FormConfigElement<T> | null;
  const legacyFieldName = legacyConfig?.stateFieldName;
  if (legacyFieldName) {
    return {
      fieldName: legacyFieldName,
      baseConfig: ((config?.[legacyFieldName as keyof T] as FormConfigElement<T> | undefined) ?? legacyConfig) as FormConfigElement<T>,
      usesLegacyFallback: true,
    };
  }

  if (autoConfigIndex === undefined) {
    return {
      fieldName: null,
      baseConfig: null,
      usesLegacyFallback: false,
    };
  }

  const configEntries = getConfigEntries(config);
  const nextEntry = configEntries[autoConfigIndex];
  if (!nextEntry) {
    return {
      fieldName: null,
      baseConfig: null,
      usesLegacyFallback: false,
    };
  }

  return {
    fieldName: nextEntry[0],
    baseConfig: nextEntry[1] as FormConfigElement<T>,
    usesLegacyFallback: true,
  };
};

export const shouldPreserveControl = (componentName: string | null, childProps: Record<string, any>, runtimeConfig: FormConfigElement) => {
  return (
    childProps.phoneNumberBase !== undefined ||
    runtimeConfig.isArray ||
    componentName === 'Input' ||
    componentName === 'CheckBox' ||
    componentName === 'Select' ||
    componentName === 'InputBase'
  );
};

export const buildRuntimeBinding = <T,>(params: {
  fieldName: string;
  idx?: number;
  fieldType: FormFieldType;
  configKey?: string | null;
  baseConfig: FormConfigElement<T>;
  childProps: Record<string, any>;
  componentName: string | null;
}): RuntimeFieldBinding<T> => {
  const { fieldName, idx, fieldType, configKey = null, baseConfig, childProps, componentName } = params;
  const runtimeKey = `${fieldName}${idx ?? ''}`;
  const bindingBaseConfig = {
    ...baseConfig,
    stateFieldName: fieldName,
    fieldType,
  } as FormConfigElement<T>;

  const binding: RuntimeFieldBinding<T> = {
    runtimeKey,
    fieldName,
    idx,
    fieldType,
    configKey,
    baseConfig: bindingBaseConfig,
    childProps,
    componentName,
    preserveControl: shouldPreserveControl(componentName, childProps, bindingBaseConfig),
  };

  if (fieldType === 'ColorPicker') {
    binding.readValue = (args, runtimeConfig) => {
      const event = args[0];
      const explicitValue = args[1];
      const eventType = event?.type;
      const rawValue = event?.target?.value ?? event?.currentTarget?.value;

      if (eventType === 'change' && typeof explicitValue === 'string') {
        return explicitValue;
      }

      if (typeof rawValue === 'string') {
        return rawValue;
      }

      if (typeof explicitValue === 'string') {
        return explicitValue;
      }

      return runtimeConfig.getInputValue?.() ?? runtimeConfig.getValue?.();
    };
    binding.shouldCommitValue = (value, runtimeConfig) => {
      if (typeof value !== 'string') {
        return false;
      }

      if ((runtimeConfig.validation as { validateHexColor?: boolean } | undefined)?.validateHexColor) {
        return isValidHexColor(value);
      }

      return !value || isValidHexColor(value);
    };
  }

  return binding;
};

export const getComponentName = (child: React.ReactElement) => {
  const childType = child.type as any;

  if (typeof childType === 'string') {
    return childType;
  }

  return childType?.displayName ?? childType?.name ?? null;
};

export const getConfigEntries = (config?: ConfigWithInternal<any>) => {
  if (!config) {
    return [];
  }

  return Object.entries(config).filter(([key]) => !key.startsWith('_'));
};

export const getArrayAwareValue = (config: FormConfigElement, value: any, idx?: number) => {
  if (idx === undefined) {
    return value;
  }

  if (Array.isArray(value)) {
    return value[idx];
  }

  return value;
};

export const readNextValue = (runtimeConfig: FormConfigElement, args: any[]) => {
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

  const explicitValue = args[1];
  if (runtimeConfig.fieldType === 'ColorPicker' && typeof explicitValue === 'string') {
    return explicitValue;
  }

  return event.target?.value ?? event.currentTarget?.value;
};

export const coerceDispatchValue = (runtimeConfig: FormConfigElement, value: any) => {
  if (runtimeConfig.valueMappers?.toObject) {
    return runtimeConfig.valueMappers.toObject(value);
  }

  if (runtimeConfig.fieldType === 'InputNumber') {
    return value === '' || value === undefined ? undefined : parseInt(value, 10);
  }

  return value;
};

export const shouldDispatchValue = (runtimeConfig: FormConfigElement, value: any) => {
  if (runtimeConfig.fieldType === 'ColorPicker') {
    return !value || isValidHexColor(value);
  }

  return true;
};

export const hasConfiguredPassError = (runtimeConfig: FormConfigElement<any>) => {
  const passError = runtimeConfig.passError;

  if (Array.isArray(passError)) {
    return passError.some((value) => !!value);
  }

  return !!passError;
};
