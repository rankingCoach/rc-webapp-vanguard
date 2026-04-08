import './Slider.scss';

import { FormConfigElement } from '@custom-hooks/useFormConfig';
import { Slider as MuiSlider } from '@mui/material';
import { ComponentContainer } from '@vanguard/ComponentContainer/ComponentContainer';
import { useFieldConfigContext } from '@vanguard/Form/FormConfigContext';
import React, { MutableRefObject, useEffect, useState } from 'react';

/**
 * Props @todo Implement formConfig integration
 * ---------------------------------------------------------------------------------------------------------------------
 */
export interface SliderProps {
  value: number | number[];
  min: number;
  max: number;
  step?: number;
  marks?: { value: number; label: string }[];
  onChangeCommitted?: (event: React.SyntheticEvent | Event, value: number) => void;
  onChange?: (event: Event | null, value: number, activeThumb: number) => void;
  disabled?: boolean;
  valueLabelDisplay?: 'auto' | 'on' | 'off';
  type?: 'default' | 'simple' | 'primary';
  size?: 'default' | 'small';
  targetRef?: MutableRefObject<HTMLInputElement | null>;
  formconfig?: FormConfigElement;
  externalControlled?: boolean;
}

/**
 * Component
 * ---------------------------------------------------------------------------------------------------------------------
 */
export const Slider = (props: SliderProps) => {
  const contextFieldConfig = useFieldConfigContext();
  const formconfig = contextFieldConfig ?? props.formconfig ?? null;
  const {
    value,
    min,
    max,
    step = 1,
    marks,
    onChangeCommitted,
    onChange,
    disabled,
    valueLabelDisplay = 'off',
    type = 'default',
    size = 'default',
    formconfig: _formconfig,
    externalControlled = false,
  } = props;

  let { targetRef } = props;
  const [controlledValue, setControlledValue] = useState(value);

  /**
   * FormConfig
   */
  useEffect(() => {
    if (formconfig?._inputRef) {
      formconfig.fieldType = 'Slider';

      if (targetRef) {
        formconfig._inputRef = targetRef;
      } else {
        targetRef = formconfig._inputRef;
      }
    }
  }, []);

  useEffect(() => {
    if (formconfig?.stateValue !== undefined && formconfig.stateValue !== null) {
      setControlledValue(formconfig?.stateValue);
    }

    handleOnChange(null, formconfig?.stateValue, formconfig?.stateValue);
  }, [formconfig?.stateValue]);

  useEffect(() => {
    if (formconfig) {
      formconfig?.setStateValue?.(value);
    } else {
      setControlledValue(value);
    }

    handleOnChange(null, value, value as number);
  }, [value]);

  /**
   * Handle On Change
   */
  const handleOnChange = (event: Event | null, value: number | number[], activeThumb: number) => {
    if (!externalControlled) {
      setControlledValue(value);
    }

    // Callback
    onChange && onChange(event, value as number, activeThumb);
  };

  /**
   * Return view
   * ---
   */
  return (
    <ComponentContainer className={`vng-slider-container vng-slider-${type} vng-slider-size-${size}`}>
      <MuiSlider
        ref={targetRef}
        min={min}
        max={max}
        step={step}
        value={controlledValue}
        marks={marks}
        onChange={handleOnChange}
        onChangeCommitted={onChangeCommitted}
        disabled={disabled}
        valueLabelDisplay={valueLabelDisplay}
      />
    </ComponentContainer>
  );
};
