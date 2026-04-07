/**
 * The plan with this hook is to automatically create a ref and bind it to input
 * Bind default value from store
 * trigger store updates when changes happen
 */
import { useAppDispatch } from '@custom-hooks/use-app-dispatch';
import { FormConfigTextPrevention } from '@helpers/input-preventions/prevent-input-types';
import { setFieldValidity, validInput } from '@helpers/validators/valid-input/valid-input';
import { CustomErrorsKeys, ErrorsKeys } from '@helpers/validators/valid-input/validate-input-errors';
import { FormConfigValidation } from '@helpers/validators/valid-input/validate-input-types.ts';
import { CaseReducerActions } from '@reduxjs/toolkit';
import { ValidationResultWithInfo } from '@vanguard/Form/extract-error-scopes';
import React, { Dispatch, MutableRefObject, SetStateAction, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { CombinedState } from 'redux';

import { AllRootStates } from '../rootReducer';

/**
 * Types
 */
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
  _autocompleteRef?: MutableRefObject<any>; // us
  _inputRef?: MutableRefObject<any>;
  _onChange?: (event?: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  _onBlur?: (event?: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  validateOn?: 'change' | 'blur';
  stateFieldName?: string;
  stateValue?: any;
  setStateValue?: any; // TODO: a.kott: Find the correct types here! TypedDispatch<any>; //Dispatch<SetStateAction<T>> | null;
  setStateValueArray?: any; //TypedDispatch<T>;//Dispatch<SetStateAction<any>> | null;
  setInternalInputs?: any; //TypedDispatch<T>;//Dispatch<SetStateAction<FormConfigElement>> | null;
  getValue?: () => any;
  initialValue?: any;
  getInitialValue?: () => string;
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
};

export type FormConfig<T> = Partial<Record<keyof T, FormConfigElement<T>>>;

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

/**
 * Hook
 * ---------------------------------------------------------------------------------------------------------------------
 */
export function useFormConfig<T>(config: Options<T>): {
  formConfig: Partial<FormConfig<T>>;
  isValid: () => boolean;
  getData: () => Partial<T>;
  getChangedData: () => Partial<T>;
  resetForm: () => void;
  validateFromState: () => void;
} {
  const inputs: Partial<Partial<Record<keyof T, FormConfigElement<T>>>> = config.inputs;
  const reducer = config.reducer;
  config.validateOn = config.validateOn ?? 'change';
  const slice = config.slice;
  const internalInputs = useRef({});
  const reduxData = config.reducer ? useSelector(config.reducer) : {};
  const reduxSlice = config.slice ?? {};
  const stateErrorsConfig = config.stateErrorsConfig ?? { errorsStateFieldName: 'errors' };

  const dispatch = useAppDispatch();

  useEffect(() => {
    const errorField = stateErrorsConfig.errorsStateFieldName;
    const errors: ValidationResultWithInfo[] = reduxData[errorField];
    if (errors && errors.length > 0) {
      validateFromState();
    }
  }, [reduxData[stateErrorsConfig?.errorsStateFieldName]]);

  /**
   * Process Form Fields
   * ---
   */
  for (const key in inputs) {
    const stringKey = key as string;

    // Update Form Field properties
    inputs[key] = {
      //@ts-ignore
      ...inputs[stringKey],
      _autocompleteRef: useRef(null),
      _inputRef: useRef(null),
      stateFieldName: stringKey,
      reducer: reducer ? useSelector(reducer) : null,
      slice: slice,
      stateValue: null,
      setStateValue: null,
      setStateValueArray: null,
      validateOn: config.validateOn,
      getValue: function () {
        if (this.fieldType == 'InputNumber') {
          return parseInt(this._inputRef?.current?.value);
        }
        if (this.fieldType == 'Checkbox') {
          return this._inputRef?.current?.checked as boolean;
        }
        if (this.fieldType == 'Autocomplete') {
          // @todo implement all autocomplete types (array, object, string)
          return this._inputRef?.current?.value as string;
        }
        if (this.fieldType == 'ColorPicker') {
          return this._inputRef?.current?.value as string;
        }

        // Use default
        return (this._inputRef?.current?.value ?? undefined) as string; // by default treat as Input/Textarea
      },
      initialValue: reduxData['initialState'] ? reduxData['initialState'][stringKey] : null, // reduxData["initialState"][stringKey]
      getInitialValue: function () {
        if (this.isArray && this.arrayPosition !== undefined && Array.isArray(this.initialValue)) {
          return this.initialValue[this.arrayPosition];
        }

        return this.initialValue;
      },
      //
      errors: null,
      setErrors: null,
      hasError: null,
      setHasError: null,
      isDirty: null,
      setIsDirty: null,
    };

    // Internal inputs
    //@ts-ignore
    inputs['_addInternalInput'] = (input: FormConfigElement) => {
        if (input.stateFieldName) {
          let idx = '';
          if (input.arrayPosition !== undefined) {
            idx = `${input.arrayPosition}`;
          }
          //@ts-ignore
          internalInputs.current[input.stateFieldName + idx] = input;
          //@ts-ignore
          inputs[input.stateFieldName + idx] = input;
        }
      //@ts-ignore
        inputs['_removeInternalInput'] = (input: FormConfigElement) => {
          if (input.stateFieldName) {
            let idx = '';
            if (input.arrayPosition !== undefined) {
              idx = `${input.arrayPosition}`;
            }
            //@ts-ignore
            delete internalInputs.current[input.stateFieldName + idx];
            //@ts-ignore
            delete inputs[input.stateFieldName + idx];
          }
      };
      //@ts-ignore
      inputs['_internalInputs'] = internalInputs;
    };
  }

  /**
   * Function: is Form valid?
   * ---
   */
  const isValid = (): boolean => {
    let isFromValid = true;
    //todo deprecation warning
    for (const inputKey in internalInputs.current) {
      //@ts-ignore
      const isInputValid = validInput(internalInputs.current[inputKey]);
      isFromValid = isFromValid && isInputValid;
    }

    return isFromValid;
  };

  /**
   * Get all Form Fields
   * ---
   */

  const getData = (): Partial<T> => {
    const data: T = {} as any;
    for (const key in internalInputs.current) {
      //@ts-ignore
      if (internalInputs.current[key] && internalInputs.current[key]?.getValue) {
        //@ts-ignore
        data[key] = internalInputs.current[key]?.getValue?.() as any;
      }
    }
    return data;
  };

  /**
   * Get changed (dirty) Form Fields
   * ---
   */
  const getChangedData = (): Partial<T> => {
    const data: T = {} as any;
    for (const key in internalInputs.current) {
      //@ts-ignore
      if (internalInputs.current[key]?.isDirty) {
        //@ts-ignore
        data[key] = internalInputs.current[key]?.getValue?.() as any;
      }
    }
    return data;
  };

  /**
   * Reset Form fields values to initial state
   * ---
   */
  const resetForm = () => {
    const resetState = reduxSlice['resetState'] as any; //() => {};
    dispatch(resetState());
  };

  /**
   * Validate from Redux State (set Backend errors)
   * ---
   */
  function traverseObject(obj: any, path: string): any {
    const keys = path.split('.');
    let current = obj;
    for (const key of keys) {
      if (current.hasOwnProperty(key)) {
        current = current[key];
      } else {
        return undefined;
      }
    }
    return current;
  }

  const validateFromState = () => {
    const errorField = stateErrorsConfig.errorsStateFieldName;
    if (reduxData.hasOwnProperty(errorField)) {
      const errors: ValidationResultWithInfo[] = reduxData[errorField];

      if (config.debugDisplayBeErrors) {
        console.info(errors);
      }
      for (const key in internalInputs.current) {
        //@ts-ignore
        const input = internalInputs.current[key];
        let errorMessage = '';
        for (const serverError of errors) {
          let errorMatchingsArr = input['errorMatching'] ?? [];
          if (!Array.isArray(errorMatchingsArr)) errorMatchingsArr = [errorMatchingsArr];
          for (const errorMatchings of errorMatchingsArr) {
            for (const errorPath in errorMatchings) {
              if (errorMatchings.hasOwnProperty(errorPath)) {
                const matching = errorMatchings[errorPath];
                const errorObj = traverseObject(serverError, errorPath);
                if (errorObj !== undefined) {
                  if (typeof matching === 'boolean' && matching === true) {
                    errorMessage = serverError.errorMessage as any;
                    break;
                  } else if (typeof matching === 'string' && matching === errorObj) {
                    errorMessage = serverError.errorMessage as any;
                    break;
                  }
                }
              }
            }
          }
        }
        if (errorMessage) {
          // Error found
          //@ts-ignore
          setFieldValidity(inputs[key] as FormConfigElement, false, errorMessage as any);
        } else {
          // No error
          //@ts-ignore
          setFieldValidity(inputs[key] as FormConfigElement, true);
        }
      }
    }
  };

  /**
   * Return
   * ---
   */
  return { formConfig: inputs, isValid, getData, getChangedData, resetForm, validateFromState };
}
