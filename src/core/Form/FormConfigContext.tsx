import React, { createContext, useContext } from 'react';
import { FormConfigElement } from '@custom-hooks/useFormConfig';

import { FormStatus } from './hooks/form.types';

type ConfigWithInternal<T> = T & any;

interface FormConfigContextType<T = any> {
  formConfig: ConfigWithInternal<T> | null;
  parentOnChange?: (status: FormStatus<T>) => void;
}

const FormConfigContext = createContext<FormConfigContextType | null>(null);
const FieldConfigContext = createContext<FormConfigElement | null>(null);

interface FormConfigProviderProps<T = any> {
  children: React.ReactNode;
  formConfig: ConfigWithInternal<T> | null;
  parentOnChange?: (status: FormStatus<T>) => void;
}

export const FormConfigProvider = <T,>({ children, formConfig, parentOnChange }: FormConfigProviderProps<T>) => {
  return <FormConfigContext.Provider value={{ formConfig, parentOnChange }}>{children}</FormConfigContext.Provider>;
};

interface FieldConfigProviderProps {
  children: React.ReactNode;
  fieldConfig: FormConfigElement | null;
}

export const FieldConfigProvider = ({ children, fieldConfig }: FieldConfigProviderProps) => {
  return <FieldConfigContext.Provider value={fieldConfig}>{children}</FieldConfigContext.Provider>;
};

export const useFormConfigContext = <T = any,>(): FormConfigContextType<T> | null => {
  const context = useContext(FormConfigContext);
  return context as FormConfigContextType<T> | null;
};

export const useFieldConfigContext = () => {
  return useContext(FieldConfigContext);
};

export const useResolvedFormConfig = <T = any,>(explicitConfig?: FormConfigElement<T> | null) => {
  const fieldConfig = useFieldConfigContext();
  return fieldConfig ?? explicitConfig ?? null;
};
