import { FormConfigElement, FormFieldType } from '@custom-hooks/useFormConfig';
import React from 'react';

export type ConfigWithInternal<T> = T & {
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

export type RuntimeFieldState = {
  errors: any[];
  hasError: boolean;
  isDirty: boolean;
  currentValue: any;
  inputValue: any;
  lastSyncedStateValue: any;
};

export type RuntimeFieldBinding<T> = {
  runtimeKey: string;
  fieldName: string;
  idx?: number;
  fieldType: FormFieldType;
  configKey?: string | null;
  baseConfig: FormConfigElement<T>;
  childProps: Record<string, any>;
  componentName: string | null;
  preserveControl: boolean;
  readValue?: (args: any[], runtimeConfig: FormConfigElement<T>) => any;
  shouldCommitValue?: (value: any, runtimeConfig: FormConfigElement<T>) => boolean;
};
