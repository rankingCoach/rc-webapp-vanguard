import { FormConfigElement } from '@custom-hooks/useFormConfig.ts';
import { capitalizeFirstLetter } from '@helpers/string-helpers';
import { validInput } from '@helpers/validators/valid-input/valid-input';
import { ErrorsKeys } from '@helpers/validators/valid-input/validate-input-errors';
import { extractSetErrorsFromConfig } from '@vanguard/Form/FormElement/extract-set-errors-from-config';
import React, { useEffect, useRef, useState } from 'react';

export type FormElementChildChange = {
  name: string;
  isValid: boolean;
  hasChanges: boolean;
  childFormConfig: FormConfigElement;
};

export interface FormElementProps {
  children: React.ReactNode;
  childConfig: FormConfigElement;
  formConfig: any; // FormConfig<any>;
  formConfigKey?: 'formconfig' | 'formConfig'; // FormConfig<any>;
  onChange: (status: FormElementChildChange) => void;
  onBlur: (status: FormElementChildChange) => void;
  childAdded?: (config: FormConfigElement) => void;
  childRemoved?: (config: FormConfigElement) => void;
  idx?: number;
}

export const FormElement = (props: FormElementProps) => {
  const {
    children,
    childConfig,
    formConfig,
    idx,
    onChange,
    onBlur,
    childAdded,
    childRemoved,
    formConfigKey = 'formconfig',
  } = props;
  const ref = useRef(null);

  //Setup the states of the config
  const [errors, setErrors] = useState([]);
  const [hasError, setHasError] = useState<boolean>(false);
  const [isDirty, setIsDirty] = useState<boolean>(false);
  const [errorsByDev, setErrorsByDev] = useState<string | null>('');

  useEffect(() => {
    activateErrors(childConfig);
  }, [childConfig]);

  useEffect(() => {
    const stringKey = childConfig.stateFieldName;

    if (stringKey && errorsByDev) {
      const changedStatus = {
        name: stringKey,
        isValid: validInput(childConfig),
        hasChanges: configHasChanges(childConfig),
        childFormConfig: childConfig,
      };
      onChange && onChange(changedStatus);
      // validInput(childConfig);
    }
  }, [errorsByDev]);

  useEffect(() => {
    return () => {
      childRemoved && childRemoved(childConfig);
    };
  }, []);

  useEffect(() => {
    childAdded && childAdded(childConfig);
  }, [childConfig]);

  const bindStateVars = (childFormConfig: FormConfigElement) => {
    const stringKey = childFormConfig.stateFieldName;

    if (childFormConfig && stringKey) {
      //bind internal state vars
      //create a new reference object
      childFormConfig._inputRef = ref;
      //add error and dirty handlers
      childFormConfig.errors = errors;
      childFormConfig.setErrors = setErrors;
      childFormConfig.hasError = hasError;
      childFormConfig.setHasError = setHasError;
      childFormConfig.isDirty = isDirty;
      childFormConfig.setIsDirty = setIsDirty;

      const setterKey = `set${capitalizeFirstLetter(stringKey)}`;
      // used to set one element in an array of elements
      const setterKeyArr = `set${capitalizeFirstLetter(stringKey)}inArray`;

      // try to take the redux state value and setter via naming convention set${CAPITALIZE<key>}
      const formConfigValid = formConfig && formConfig[stringKey];
      const reduxData: any = formConfigValid && formConfig[stringKey].reducer ? formConfig[stringKey].reducer : {};
      const reduxSlice = (formConfigValid && formConfig[stringKey].slice) ?? {};
      const setStateValue = reduxSlice[setterKey];
      const setStateValueArray = reduxSlice[setterKeyArr];
      let stateValue = reduxData[stringKey];

      if (idx !== undefined) {
        stateValue = stateValue?.[idx];
        childFormConfig.arrayPosition = idx;
      }

      if (childFormConfig.valueMappers?.toPrimitive) {
        stateValue = childFormConfig.valueMappers.toPrimitive(stateValue);
      }

      childFormConfig.stateValue = stateValue;
      childFormConfig.setStateValue = setStateValue;
      childFormConfig.setStateValueArray = setStateValueArray;
    }
  };

  const configHasChanges = (childFormConfig: FormConfigElement) => {
    let hasChanges = false; // status.inputsChanges;
    // If field changed
    if (childFormConfig && childFormConfig.getValue && childFormConfig.getInitialValue && childFormConfig.setIsDirty) {
      const fieldChanged = childFormConfig.getValue() != childFormConfig.getInitialValue();
      if (fieldChanged) {
        hasChanges = true;
        childFormConfig.setIsDirty(true);
      } else {
        hasChanges = false;
        childFormConfig.setIsDirty(false);
      }
    }

    return hasChanges;
  };

  const bindChangeListener = (childFormConfig: FormConfigElement) => {
    const origChangeFn = childFormConfig._onChange;
    const origBlurFn = childFormConfig._onBlur;
    const stringKey = childFormConfig.stateFieldName;
    if (childFormConfig && stringKey) {
      childFormConfig._onChange = (e?: any) => {
        if (e) {
          origChangeFn && origChangeFn(e);
        }

        const changedStatus = {
          name: stringKey,
          isValid: validInput(childFormConfig, childFormConfig.validateOn === 'blur'),
          hasChanges: configHasChanges(childFormConfig),
          childFormConfig,
        };

        onChange && onChange(changedStatus);
      };
      childFormConfig._onBlur = (e?: any) => {
        if (childFormConfig.validateOn !== 'blur') {
          return;
        }
        if (e) {
          origBlurFn && origBlurFn(e);
        }

        const blurStatus = {
          name: stringKey,
          isValid: validInput(childFormConfig),
          hasChanges: configHasChanges(childFormConfig),
          childFormConfig,
        };

        onBlur && onBlur(blurStatus);
      };
    }
  };

  // if any errors are set on config
  // we need to activate them here
  const activateErrors = (childFormConfig: FormConfigElement) => {
    const errorSetByDev = extractSetErrorsFromConfig(childFormConfig) as ErrorsKeys;
    if (errorSetByDev) {
      setErrorsByDev(errorSetByDev);
    } else {
      setErrorsByDev('');
    }
    // validInput(childFormConfig);
    // if (!childFormConfig || !stringKey) {
    //   return;
    // }
    // if (setErrorsByDev) {
    //   if (!childFormConfig.hasError) {
    //     childFormConfig.setIsDirty && childFormConfig.setIsDirty(true);
    //     validInput(childFormConfig);
    //   }
    // } else if (childFormConfig.hasError) {
    //   // validInput(childFormConfig);
    //   let changedStatus = {
    //     name: stringKey,
    //     isValid: validInput(childFormConfig),
    //     hasChanges: configHasChanges(childFormConfig),
    //     childFormConfig,
    //   };
    //   setTimeout(() => {
    //     onChange(changedStatus);
    //   }, 0);
    // }
  };
  bindStateVars(childConfig);
  bindChangeListener(childConfig);

  if (React.isValidElement(children)) {
    const newProps = {};
    //@ts-ignore
    newProps[formConfigKey] = childConfig;
    return React.cloneElement(children, newProps);
  }

  return <>{children}</>;
};
