import './RadioButtonGroup.scss';

import { breakpoints } from '@config/breakpoints';
import { useWindowResize } from '@custom-hooks/use-window.resize';
import { FormConfigElement, useFormConfig } from '@custom-hooks/useFormConfig';
import { classNames } from '@helpers/classNames';
import { AnimatedConditional } from '@vanguard/AnimatedConditional/AnimatedConditional';
import { Label } from '@vanguard/Label/Label';
import { Render } from '@vanguard/Render/Render';
import { FontWeights, Text, TextReplacements, TextTypes } from '@vanguard/Text/Text';
import React from 'react';

import { ComponentContainer } from '../ComponentContainer/ComponentContainer';
import { Form } from '../Form/Form';
import { RadioButton, RadioData } from '../RadioButton/RadioButton';

export interface RadioButtonGroupProps<ValueType = string> {
  value: ValueType;
  options: Array<RadioData<ValueType>>;
  groupLabel?: string;
  groupLabelNoPadding?: boolean;
  groupLabelFontWeight?: FontWeights;
  name: string;
  formClassName?: string;

  direction?: 'row' | 'column';
  theme?: 'standard' | 'bordered' | 'success';
  // Narrowed from Dispatch<SetStateAction<ValueType>>: the group only ever calls
  // setRadioValueFn(radio.value) with a concrete value, never a state-updater fn.
  setRadioValueFn: (value: ValueType) => void;

  formconfig?: FormConfigElement;
  testId?: string;

  translate?: boolean;
  capitalizeOptions?: boolean;
  replacements?: TextReplacements;
}

export const RadioButtonGroup = <ValueType,>(props: RadioButtonGroupProps<ValueType>) => {
  const {
    formconfig,
    formClassName,
    options,
    name,
    setRadioValueFn,
    value,
    direction,
    capitalizeOptions,
    testId,
    translate = true,
    theme = 'standard',
    replacements,
    groupLabel,
    groupLabelFontWeight = FontWeights.bold,
    groupLabelNoPadding = false,
  } = props;

  const width = useWindowResize();

  // @todo Add formConfig

  /**
   * Fn: Get Form Classes
   * ---
   */
  const getFormClasses = () => {
    let dirClass;
    let formNoPadding;
    if (direction === 'column') {
      dirClass = 'RadioButtonGroup-force-col';
    }
    if (direction === 'row') {
      dirClass = 'RadioButtonGroup-force-row';
    }

    if (groupLabel) {
      formNoPadding = 'RadioButtonGroup-force-no-padding';
    }

    return classNames(formClassName, dirClass, theme === 'success' ? 'success' : '', formNoPadding);
  };

  /**
   * Fn: Get Title Class
   * ---
   */
  const getTitleClass = () => {
    if (groupLabelNoPadding) {
      return 'RadioButtonGroup-title-no-padding';
    }

    return '';
  };

  const { formConfig } = useFormConfig({
    inputs: {
      group: {},
    },
  });

  /**
   * Return view
   * ---
   */
  return (
    <ComponentContainer className={classNames('RadioButtonGroup-container')} testId={testId}>
      <Render if={!!groupLabel}>
        <div className={classNames('RadioButtonGroup-title', getTitleClass())}>
          <Label value={groupLabel} replacements={replacements} fontWeight={groupLabelFontWeight} />
        </div>
      </Render>
      <Form className={getFormClasses()} config={formconfig}>
        {options.map((radio: RadioData<ValueType>, index: number) => (
          <div key={index}>
            <AnimatedConditional condition={!!radio.infoText && width <= breakpoints.mobile}>
              {typeof radio.infoText === 'string' ? (
                <Text
                  translate={true}
                  type={TextTypes.textCaption}
                  replacements={radio.replacements ?? replacements}
                  fontWeight={FontWeights.regular}
                >
                  {radio.infoText}
                </Text>
              ) : (
                radio.infoText
              )}
            </AnimatedConditional>

            <RadioButton
              testId={`radio-button${index}`}
              formConfig={formConfig.group}
              onChangeFn={() => {
                if (radio.disabled) {
                  return;
                }

                return setRadioValueFn(radio.value);
              }}
              inputName={name}
              labelText={radio.labelText}
              value={radio.value}
              checked={value === radio.value}
              disabled={radio.disabled}
              labelClassName={radio.labelClassName}
              theme={theme}
              translate={translate}
              replacements={radio.replacements ?? replacements}
              capitalizeOption={capitalizeOptions}
              children={radio.children}
            />
          </div>
        ))}
      </Form>
    </ComponentContainer>
  );
};
