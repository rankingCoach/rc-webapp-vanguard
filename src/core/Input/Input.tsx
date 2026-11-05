import { FormFieldType } from '@custom-hooks/useFormConfig';
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
import React, { useMemo } from 'react';

export type InputProps = {
  className?: string;
  inputClassName?: string;
  testId?: string;
  readonly?: boolean;
  type?: 'text' | 'number' | 'email' | 'date' | 'password';
  /** `small`: the compact 32px filled field for toolbars (e.g. a search with a leading icon `adornment`). */
  size?: 'small' | 'medium';
  isLoading?: boolean;
  loadingText?: string;
  textFieldProps?: TextFieldProps;
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
