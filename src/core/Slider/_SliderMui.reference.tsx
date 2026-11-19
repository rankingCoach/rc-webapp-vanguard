// Test-only reference: the former MUI implementation of Slider, verbatim (rename only). Used by the parity spec and
// the Chromium differential story; not exported from the package.
import './Slider.scss';

import { FormConfigElement } from '@custom-hooks/useFormConfig';
import { Slider as MuiSlider } from '@mui/material';
import { ComponentContainer } from '@vanguard/ComponentContainer/ComponentContainer';
import React, { MutableRefObject, useEffect, useState } from 'react';
import { useFieldBinding } from '../../primitives/react/form/use-field-binding';
import { useResolvedFormConfig } from '../Form/use-resolved-form-config';
import type { SliderProps } from './Slider';

/**
 * Component
 * ---------------------------------------------------------------------------------------------------------------------
 */
export const SliderMui = (props: SliderProps) => {
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
    formconfig: formconfigProp,
    field,
    index: fieldIndex,
    externalControlled = false,
  } = props;
  // F3: explicit formconfig (legacy) or `field` resolved from the nearest Form's context.
  const formconfig = useResolvedFormConfig(formconfigProp, field, fieldIndex);
  // F3 `field` path stores the value; the legacy formconfig path keeps its known no-op (decision log).
  const boundViaField = !formconfigProp && Boolean(formconfig);
  const binding = useFieldBinding(boundViaField ? formconfig : undefined);

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

    if (boundViaField && event) {
      binding.writeScalar(value);
      binding.notifyChange();
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
