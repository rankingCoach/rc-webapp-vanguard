import React, { createContext, useContext } from 'react';
import type { FormConfigElement } from '../../custom-hooks/useFormConfig';
import { FormStatus } from './Form';
import type { FormElementChildChange } from './FormElement/FormElement';

/** The nearest Form's per-field callbacks, used by inputs bound with the `field` prop (F3). */
export interface FormFieldApi {
  onChange: (status: FormElementChildChange) => void;
  onBlur: (status: FormElementChildChange) => void;
  childAdded: (config: FormConfigElement) => void;
  childRemoved: (config: FormConfigElement) => void;
}

type ConfigWithInternal<T> = T & any;

interface FormConfigContextType<T = any> {
  formConfig: ConfigWithInternal<T> | null;
  parentOnChange?: (status: FormStatus<T>) => void;
  fieldApi?: FormFieldApi;
}

const FormConfigContext = createContext<FormConfigContextType | null>(null);

interface FormConfigProviderProps<T = any> {
  children: React.ReactNode;
  formConfig: ConfigWithInternal<T> | null;
  parentOnChange?: (status: FormStatus<T>) => void;
  fieldApi?: FormFieldApi;
}

export const FormConfigProvider = <T,>({
  children,
  formConfig,
  parentOnChange,
  fieldApi,
}: FormConfigProviderProps<T>) => {
  return (
    <FormConfigContext.Provider value={{ formConfig, parentOnChange, fieldApi }}>{children}</FormConfigContext.Provider>
  );
};

export const useFormConfigContext = <T = any>(): FormConfigContextType<T> | null => {
  const context = useContext(FormConfigContext);
  return context as FormConfigContextType<T> | null;
};
