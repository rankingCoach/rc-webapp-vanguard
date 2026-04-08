import { useAppDispatch } from '@custom-hooks/use-app-dispatch';
import { FormConfigTextPrevention } from '@helpers/input-preventions/prevent-input-types';
import { setFieldValidity, validInput } from '@helpers/validators/valid-input/valid-input';
import { CustomErrorsKeys, ErrorsKeys } from '@helpers/validators/valid-input/validate-input-errors';
import { FormConfigValidation } from '@helpers/validators/valid-input/validate-input-types.ts';
import { CaseReducerActions } from '@reduxjs/toolkit';
import { ValidationResultWithInfo } from '@vanguard/Form/extract-error-scopes';
import React, { Dispatch, MutableRefObject, SetStateAction, useEffect, useMemo, useRef } from 'react';
import { useSelector } from 'react-redux';
import { CombinedState } from 'redux';

import { AllRootStates } from '../rootReducer';

export type FormFieldType =
  | 'InputBase'
  | 'Input'
  | 'InputNumber'
  | 'Textarea'
  | 'Autocomplete'
  | 'Select'
  | 'Checkbox'
  | 'RadioButtonGroup'
  | 'Slider'
  | 'ColorPicker';

export type FormConfigElement<T = any> = {
  fieldType?: FormFieldType;
  arrayPosition?: number;
  isArray?: boolean;
  valueMappers?: {
    toPrimitive: <U>(value: any) => string | boolean | number;
    toObject: <U>(value: string | boolean | number) => Partial<any>;
  };
  _autocompleteRef?: MutableRefObject<any>;
  _inputRef?: MutableRefObject<any>;
  validateOn?: 'change' | 'blur';
  stateFieldName?: string;
  stateValue?: any;
  reducer?: any;
  slice?: any;
  setStateValue?: any;
  setStateValueArray?: any;
  getValue?: () => any;
  getInputValue?: () => any;
  initialValue?: any;
  getInitialValue?: () => string;
  setInputValue?: Dispatch<SetStateAction<any>>;
  validation?: FormConfigValidation;
  errorMatching?: Record<string, any>[];
  serverSideErrorsField?: {
    stateErrorFieldName: string;
  };
  prevention?: FormConfigTextPrevention;
  hasError?: boolean;
  setHasError?: Dispatch<SetStateAction<boolean>>;
  errors?: (ErrorsKeys | CustomErrorsKeys)[] | null;
  setErrors?: Dispatch<SetStateAction<(ErrorsKeys | CustomErrorsKeys)[]>>;
  isDirty?: boolean;
  setIsDirty?: Dispatch<SetStateAction<boolean>>;
  passError?: string | Array<string | undefined | null>;
  [key: string]: any;
};

export type FormConfig<T> = Partial<Record<keyof T, FormConfigElement<T>>>;

type FormConfigInternal<T> = Partial<FormConfig<T>> & {
  _internalInputs?: MutableRefObject<Record<string, FormConfigElement<T>>>;
  _addInternalInput?: (input: FormConfigElement<T>) => void;
  _removeInternalInput?: (input: FormConfigElement<T>) => void;
  _setInternalInputs?: (inputs: Record<string, FormConfigElement<T>>) => void;
};

type Options<T> = {
  reducer?: (state: AllRootStates) => CombinedState<any>;
  validateOn?: 'change' | 'blur';
  slice?: CaseReducerActions<any>;
  debugDisplayBeErrors?: boolean;
  inputs: Partial<FormConfig<T>>;
  stateErrorsConfig?: {
    errorsStateFieldName: string;
  };
};

const createRefObject = <T,>(): MutableRefObject<T | null> => ({ current: null });

const readValueFromConfig = (input: FormConfigElement) => {
  const runtimeValue = input.__runtimeValueRef?.current;
  if (runtimeValue !== undefined) {
    return runtimeValue;
  }

  if (input.fieldType === 'InputNumber') {
    const rawValue = input._inputRef?.current?.value;
    return rawValue === '' || rawValue === undefined ? undefined : parseInt(rawValue, 10);
  }

  if (input.fieldType === 'Checkbox') {
    return input._inputRef?.current?.checked as boolean;
  }

  if (input.fieldType === 'Autocomplete') {
    return input._autocompleteRef?.current?.value ?? input._inputRef?.current?.value;
  }

  return input._inputRef?.current?.value ?? input.stateValue;
};

export function useFormConfig<T>(config: Options<T>): {
  formConfig: Partial<FormConfig<T>>;
  isValid: () => boolean;
  getData: () => Partial<T>;
  getChangedData: () => Partial<T>;
  resetForm: () => void;
  validateFromState: () => void;
} {
  const validateOn = config.validateOn ?? 'change';
  const reduxSlice = config.slice ?? {};
  const inputsRef = useRef<FormConfigInternal<T>>({});
  const internalInputs = useRef<Record<string, FormConfigElement<T>>>({});
  const reduxData = config.reducer ? useSelector(config.reducer) : {};
  const stateErrorsConfig = config.stateErrorsConfig ?? { errorsStateFieldName: 'errors' };
  const dispatch = useAppDispatch();

  const inputs = useMemo(() => {
    const nextInputs = inputsRef.current;

    for (const key in config.inputs) {
      const stringKey = key as string;
      const existingInput = nextInputs[key] ?? ({} as FormConfigElement<T>);
      const input = config.inputs[key] ?? {};
      const setterKey = `set${stringKey.charAt(0).toUpperCase()}${stringKey.slice(1)}`;
      const setterKeyArr = `set${stringKey.charAt(0).toUpperCase()}${stringKey.slice(1)}inArray`;
      const baseInitialValue = reduxData?.initialState?.[stringKey] ?? null;

      const nextInput = Object.assign(existingInput, input, {
        _autocompleteRef: existingInput._autocompleteRef ?? createRefObject(),
        _inputRef: existingInput._inputRef ?? createRefObject(),
        validateOn,
        stateFieldName: stringKey,
        reducer: reduxData,
        slice: config.slice,
        setStateValue: reduxSlice[setterKey],
        setStateValueArray: reduxSlice[setterKeyArr],
        stateValue: reduxData?.[stringKey],
        initialValue: baseInitialValue,
        errors: existingInput.errors ?? null,
        hasError: existingInput.hasError ?? false,
        isDirty: existingInput.isDirty ?? false,
        __runtimeValueRef: existingInput.__runtimeValueRef ?? { current: undefined },
      });

      nextInput.getValue = () => readValueFromConfig(nextInput);
      nextInput.getInitialValue = () => {
        if (nextInput.isArray && nextInput.arrayPosition !== undefined && Array.isArray(nextInput.initialValue)) {
          return nextInput.initialValue[nextInput.arrayPosition];
        }

        return nextInput.initialValue;
      };

      (nextInputs as any)[key] = nextInput;
    }

    nextInputs._internalInputs = internalInputs;
    nextInputs._setInternalInputs = (activeInputs: Record<string, FormConfigElement<T>>) => {
      internalInputs.current = activeInputs;
    };
    nextInputs._addInternalInput = (input: FormConfigElement<T>) => {
      if (!input.stateFieldName) {
        return;
      }

      const idx = input.arrayPosition !== undefined ? `${input.arrayPosition}` : '';
      internalInputs.current[input.stateFieldName + idx] = input;
    };
    nextInputs._removeInternalInput = (input: FormConfigElement<T>) => {
      if (!input.stateFieldName) {
        return;
      }

      const idx = input.arrayPosition !== undefined ? `${input.arrayPosition}` : '';
      delete internalInputs.current[input.stateFieldName + idx];
    };

    return nextInputs;
  }, [config.inputs, config.slice, reduxData, reduxSlice, validateOn]);

  useEffect(() => {
    const errorField = stateErrorsConfig.errorsStateFieldName;
    const errors: ValidationResultWithInfo[] = reduxData?.[errorField];
    if (errors && errors.length > 0) {
      validateFromState();
    }
  }, [reduxData?.[stateErrorsConfig.errorsStateFieldName]]);

  const isValid = (): boolean => {
    let isFormValid = true;

    for (const inputKey in internalInputs.current) {
      isFormValid = isFormValid && validInput(internalInputs.current[inputKey]);
    }

    return isFormValid;
  };

  const getData = (): Partial<T> => {
    const data: T = {} as T;

    for (const key in internalInputs.current) {
      const input = internalInputs.current[key];
      if (input?.getValue) {
        data[key] = input.getValue() as any;
      }
    }

    return data;
  };

  const getChangedData = (): Partial<T> => {
    const data: T = {} as T;

    for (const key in internalInputs.current) {
      const input = internalInputs.current[key];
      if (input?.getValue && input?.getInitialValue && input.getValue() != input.getInitialValue()) {
        data[key] = input.getValue() as any;
      }
    }

    return data;
  };

  const resetForm = () => {
    const resetState = reduxSlice.resetState as any;
    if (resetState) {
      dispatch(resetState());
    }
  };

  function traverseObject(obj: any, path: string): any {
    const keys = path.split('.');
    let current = obj;

    for (const key of keys) {
      if (current?.hasOwnProperty(key)) {
        current = current[key];
      } else {
        return undefined;
      }
    }

    return current;
  }

  const validateFromState = () => {
    const errorField = stateErrorsConfig.errorsStateFieldName;
    if (!reduxData?.hasOwnProperty(errorField)) {
      return;
    }

    const errors: ValidationResultWithInfo[] = reduxData[errorField];

    if (config.debugDisplayBeErrors) {
      console.info(errors);
    }

    for (const key in internalInputs.current) {
      const input = internalInputs.current[key];
      let errorMessage = '';

      for (const serverError of errors) {
        let errorMatchingsArr = input.errorMatching ?? [];
        if (!Array.isArray(errorMatchingsArr)) {
          errorMatchingsArr = [errorMatchingsArr];
        }

        for (const errorMatchings of errorMatchingsArr) {
          for (const errorPath in errorMatchings) {
            if (!errorMatchings.hasOwnProperty(errorPath)) {
              continue;
            }

            const matching = errorMatchings[errorPath];
            const errorObj = traverseObject(serverError, errorPath);
            if (errorObj === undefined) {
              continue;
            }

            if (typeof matching === 'boolean' && matching === true) {
              errorMessage = serverError.errorMessage as any;
              break;
            }

            if (typeof matching === 'string' && matching === errorObj) {
              errorMessage = serverError.errorMessage as any;
              break;
            }
          }

          if (errorMessage) {
            break;
          }
        }

        if (errorMessage) {
          break;
        }
      }

      if (errorMessage) {
        setFieldValidity(input, false, errorMessage as any);
      } else {
        setFieldValidity(input, true);
      }
    }
  };

  return { formConfig: inputs, isValid, getData, getChangedData, resetForm, validateFromState };
}
