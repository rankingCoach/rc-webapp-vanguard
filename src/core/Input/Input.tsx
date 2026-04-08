import { FormConfigElement, FormFieldType } from '@custom-hooks/useFormConfig';
import { TextFieldProps } from '@mui/material';
import {
  InputAdornmentProps,
  InputBase,
  InputCounterProps,
  InputEventsProps,
  InputFormConfigProps,
  InputHighlightsProps,
  InputLabelProps,
  InputValueProps,
} from '@vanguard/_internal/InputBase/InputBase';
import { ComponentContainer } from '@vanguard/ComponentContainer/ComponentContainer';
import { useFieldConfigContext } from '@vanguard/Form/FormConfigContext';
import React, { useMemo } from 'react';

export type InputProps = {
  className?: string;
  inputClassName?: string;
  testId?: string;
  readonly?: boolean;
  type?: 'text' | 'number' | 'email' | 'date' | 'password';
  size?: 'small' | 'medium'; // @todo implement this ???
  isLoading?: boolean;
  loadingText?: string;
  textFieldProps?: TextFieldProps;
  formConfig?: FormConfigElement;
  formconfig?: FormConfigElement;
  name?: string;
} & InputValueProps &
  InputCounterProps &
  InputHighlightsProps &
  InputLabelProps &
  InputEventsProps &
  InputFormConfigProps &
  InputAdornmentProps;

export const Input = (props: InputProps) => {
  const contextFieldConfig = useFieldConfigContext();
  const { className, inputClassName, type = 'text', testId, formconfig, formConfig, ...rest } = props;
  const resolvedFieldConfig = contextFieldConfig ?? formconfig ?? formConfig;

  const fieldType: FormFieldType = useMemo(() => (type === 'number' ? 'InputNumber' : 'Input'), [type]);

  /**
   * Return View
   */
  return (
    <ComponentContainer className={className}>
      <InputBase
        testId={testId}
        formFieldType={fieldType}
        type={type}
        multiline={false}
        fieldConfig={resolvedFieldConfig}
        {...rest}
        className={inputClassName}
      />
    </ComponentContainer>
  );
};
