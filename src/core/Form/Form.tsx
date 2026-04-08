import './Form.scss';

import React from 'react';

import { FormConfigProvider, useFormConfigContext } from './FormConfigContext';
import { ConfigWithInternal, FormStatus } from './hooks/form.types';
import { useFormRuntime } from './hooks/useFormRuntime';

interface Props<T = any> {
  className?: string;
  children: React.ReactNode;
  onSubmit?: (data: T) => void;
  config?: ConfigWithInternal<T>;
  onChange?: (status: FormStatus<T>) => void;
}

export const Form = <T,>(props: Props<T>) => {
  const { className, children, config, onChange, onSubmit } = props;
  const parentContext = useFormConfigContext<T>();
  const effectiveOnChange = parentContext?.parentOnChange || onChange;
  const { builtChildren } = useFormRuntime({ children, config, onChange: effectiveOnChange });

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

export type { FormStatus } from './hooks/form.types';
export { useFormConfigContext } from './FormConfigContext';
