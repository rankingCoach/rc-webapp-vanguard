import './Form.scss';

import { validInput } from '@helpers/validators/valid-input/valid-input';
import { FormElement, FormElementChildChange } from '@vanguard/Form/FormElement/FormElement';
import React, { useEffect, useState } from 'react';

import { FormConfigElement } from '../../custom-hooks/useFormConfig';
import { ComponentContainer } from '../ComponentContainer/ComponentContainer';
import { FormConfigProvider, useFormConfigContext } from './FormConfigContext';

// Re-export the context hook for easier access

type ConfigWithInternal<T> = T & any;

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
  config?: ConfigWithInternal<T>; //FormConfig<any>;
  onChange?: (status: FormStatus<T>) => void;
}

export const Form = <T,>(props: Props<T>) => {
  const { className, children, config, onChange } = props;
  const idxMap = {};

  // Check if there's a parent form context
  const parentContext = useFormConfigContext<T>();
  const effectiveOnChange = parentContext?.parentOnChange || onChange;

  /**
   * State: Form status
   */
  const [status, setStatus] = useState<FormStatus<Record<string, boolean>>>({
    hasChanges: false,
    isValid: true,
    inputsChanges: {},
    inputsStatus: {},
    currentConfig: null,
  });

  // Callback when status changes
  useEffect(() => {
    effectiveOnChange && effectiveOnChange(status as any);
  }, [status]);

  const extractFormConfig = (child: React.ReactElement | string | number | boolean) => {
    let formConfig: FormConfigElement | null = null;
    if (typeof child !== 'string' && typeof child !== 'number' && typeof child !== 'boolean') {
      const propsAsAny = child?.props as any;
      formConfig = propsAsAny.formconfig || propsAsAny.formConfig;
    }

    return formConfig ? Object.assign({}, formConfig) : null;
  };

  const extractFormConfigKey = (
    child: React.ReactElement | string | number | boolean,
  ): 'formconfig' | 'formConfig' | null => {
    let key: 'formconfig' | 'formConfig' | null = null;
    if (typeof child !== 'string' && typeof child !== 'number' && typeof child !== 'boolean') {
      const propsAsAny = child?.props as any;
      key = propsAsAny.formconfig ? 'formconfig' : 'formConfig';
    }
    return key;
  };

  const verifyChildren = (): { hasError: boolean } => {
    let hasError = false;
    if (config && config._internalInputs) {
      for (const key in config._internalInputs.current) {
        const inputConfig = config._internalInputs.current[key]?.config ?? config._internalInputs.current[key];
        if (inputConfig && !validInput(inputConfig)) {
          hasError = true;
        }
      }
    }

    return { hasError };
  };
  const childRemoved = (element: FormConfigElement) => {
    if (config) {
      config._removeInternalInput && config._removeInternalInput(element);
    }

    const { hasError } = verifyChildren();

    setStatus((prev) => {
      return {
        isValid: !hasError,
        hasChanges: prev.hasChanges,
        inputsChanges: prev.inputsChanges,
        inputsStatus: prev.inputsStatus,
        currentConfig: prev.currentConfig,
      };
    });
  };
  const childAdded = (element: FormConfigElement) => {
    if (config) {
      config._addInternalInput && config._addInternalInput(element);
    }

    setStatus((prev) => {
      return {
        isValid: prev.isValid,
        hasChanges: prev.hasChanges,
        inputsChanges: prev.inputsChanges,
        inputsStatus: prev.inputsStatus,
        currentConfig: element,
      };
    });
  };

  const childChange = (childChanges: FormElementChildChange) => {
    if (!childChanges?.childFormConfig?.stateFieldName) {
      return;
    }

    // console.log("---------------------------------------");
    // console.log("   field  | ", input.stateFieldName);
    // console.log("is dirty  | ", fieldChanged, input.isDirty);
    // console.log("init val  | ", input.getInitialValue());
    // console.log("curr val  | ", input.getValue());

    const idx = String(childChanges.childFormConfig.arrayPosition ?? '');

    const validStatus: Record<string, any> = {};
    validStatus[childChanges.name] = childChanges.isValid;
    validStatus[childChanges.name + idx] = childChanges.isValid;

    const changeStatus: Record<string, any> = {};
    changeStatus[childChanges.name] = childChanges.hasChanges;
    changeStatus[childChanges.name + idx] = childChanges.hasChanges;

    // Set change status
    setStatus((prev) => {
      const validations = { ...prev.inputsStatus, ...validStatus };
      const asArrayValidations = Object.entries(validations);
      const filteredInvalid = asArrayValidations.filter(([key, value]) => value === false);

      const changes = { ...prev.inputsChanges, ...changeStatus };
      const asArrayChanges = Object.entries(changes);
      const filteredChanges = asArrayChanges.filter(([key, value]) => value === true);

      return {
        hasChanges: filteredChanges.length !== 0, //Object.keys(inputsChanges).length > 0,
        inputsChanges: changes,
        isValid: filteredInvalid.length === 0,
        inputsStatus: validations,
        currentConfig: childChanges.childFormConfig,
      };
    });
  };
  const childBlur = (childChanges: FormElementChildChange) => {
    childChange(childChanges);
  };

  const childrenWithProps = (childNodes: React.ReactNode): React.ReactNode =>
    React.Children.map(childNodes, (child) => {
      // Checking isValidElement is the safe way and avoids a typescript
      // error too.

      if (React.isValidElement(child)) {
        let idx = undefined;
        const childConfig = extractFormConfig(child);
        const formConfigKey = extractFormConfigKey(child);
        const propsAsAny = child?.props as any;

        if (!childConfig || !childConfig.stateFieldName || !formConfigKey) {
          if (propsAsAny.children) {
            // return React.cloneElement(child, { children: childrenWithProps(child.props.children) });
            //TODO
            return React.cloneElement(child, {}, childrenWithProps(propsAsAny.children));
          }
          return child;
        }

        const stringKey = childConfig.stateFieldName;
        if (childConfig.isArray && stringKey) {
          //@ts-ignore
          if (idxMap[stringKey] !== undefined) {
            //@ts-ignore
            idxMap[stringKey]++;
          } else {
            //@ts-ignore
            idxMap[stringKey] = 0;
          }
          //@ts-ignore
          idx = idxMap[stringKey];
        }
        return (
          <FormElement
            onChange={childChange}
            onBlur={childBlur}
            childConfig={childConfig}
            formConfigKey={formConfigKey}
            formConfig={config}
            idx={idx}
            childAdded={childAdded}
            childRemoved={childRemoved}
          >
            {child}
          </FormElement>
        );
      }
      return child;
    });

  /**
   * Return View
   */
  return (
    <FormConfigProvider formConfig={config || null} parentOnChange={effectiveOnChange}>
      <ComponentContainer className={`Form-container ${className}`}>{childrenWithProps(children)}</ComponentContainer>
    </FormConfigProvider>
  );
};

export { useFormConfigContext } from './FormConfigContext';
