import './RadioButton.scss';

import { classNames } from '@helpers/classNames';
import { Render } from '@vanguard/Render/Render';
import { FontWeights, Text, TextReplacements } from '@vanguard/Text/Text';
import React, { ReactNode } from 'react';
import { FormConfigElement } from '../../custom-hooks/useFormConfig';
import { ComponentContainer } from '../ComponentContainer/ComponentContainer';

export type RadioData<ValueType = string> = {
  labelText: string | React.ReactNode;
  infoText?: string | ReactNode;
  value: ValueType;
  labelClassName?: string;
  disabled?: boolean;
  children?: React.ReactNode;
  replacements?: TextReplacements;
};

type RadioButtonProps<ValueType = string> = {
  inputName: string;
  testId?: string;
  onChangeFn: () => void;
  checked: boolean;
  formConfig?: FormConfigElement;
  theme: 'standard' | 'bordered' | 'success';
  translate?: boolean;
  capitalizeOption?: boolean;
  replacements?: TextReplacements;
} & RadioData<ValueType>;

export const RadioButton = <ValueType,>(props: RadioButtonProps<ValueType>) => {
  const {
    inputName,
    labelText,
    value,
    checked,
    labelClassName,
    onChangeFn,
    testId,
    theme,
    translate = true,
    replacements,
    capitalizeOption,
    disabled,
    children,
  } = props;

  return (
    <ComponentContainer
      className={classNames('RadioButton', theme, checked ? 'checked' : '', disabled ? 'disabled' : '')}
    >
      <label className={classNames('RadioButton-label', labelClassName)}>
        <input
          data-testid={testId}
          className={'RadioButton-input'}
          hidden={true}
          // name={inputName+M}
          type={'radio'}
          value={value as any as string}
          checked={checked}
          disabled={disabled}
          onChange={() => onChangeFn()}
        />
        <div
          className={classNames(
            theme === 'success' ? 'RadioButton-label-text-success' : 'RadioButton-label-text',
            checked ? 'checked' : undefined,
            disabled ? 'disabled' : undefined,
          )}
        >
          {typeof labelText === 'string' ? (
            <Text
              capitalize={capitalizeOption}
              translate={translate}
              replacements={replacements}
              fontWeight={checked ? FontWeights.medium : FontWeights.regular}
            >
              {labelText}
            </Text>
          ) : (
            labelText
          )}
        </div>
      </label>
      <Render if={checked}>{children}</Render>
    </ComponentContainer>
  );
};
