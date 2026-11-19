import { FormFieldType } from '@custom-hooks/useFormConfig';
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
import type { VanguardTextFieldProps } from '@vanguard/_internal/mui-legacy-props';
import { ComponentContainer } from '@vanguard/ComponentContainer/ComponentContainer';
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
  textFieldProps?: VanguardTextFieldProps;
} & InputValueProps &
  InputCounterProps &
  InputHighlightsProps &
  InputLabelProps &
  InputEventsProps &
  InputFormConfigProps &
  InputAdornmentProps;

export const Input = (props: InputProps) => {
  const { className, inputClassName, type = 'text', testId } = props;

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
        {...props}
        className={inputClassName}
      />
    </ComponentContainer>
  );
};
