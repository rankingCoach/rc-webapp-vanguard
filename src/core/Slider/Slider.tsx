// Ported from @mui/material@9.5.0 Slider/Slider.js, Slider/SliderValueLabel.js (MIT)
import './Slider.scss';

import { FormConfigElement } from '@custom-hooks/useFormConfig';
import { ComponentContainer } from '@vanguard/ComponentContainer/ComponentContainer';
import React, { MutableRefObject, useEffect, useState } from 'react';
import { useFieldBinding } from '../../primitives/react/form/use-field-binding';
import { useVanguardTypography } from '../../primitives/react/typography-context';
import { useResolvedFormConfig } from '../Form/use-resolved-form-config';
import { HIDDEN_INPUT_STYLE, useOwnSlider, valueToPercent } from './use-own-slider';

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
  /** F3: bind to the nearest <Form config>'s field of this name (no `formconfig` prop needed). */
  field?: string;
  /** F3: element index for array fields bound with `field`. */
  index?: number;
  externalControlled?: boolean;
}

/**
 * Component
 * ---------------------------------------------------------------------------------------------------------------------
 */
export const Slider = (props: SliderProps) => {
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
      <OwnSlider
        rootRef={targetRef}
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

/** Only real tokens (@helpers/classNames-free join): no junk/duplicate spacing. */
const cls = (...c: Array<string | false | undefined>) => c.filter(Boolean).join(' ');

interface OwnSliderProps {
  rootRef?: MutableRefObject<HTMLInputElement | null>;
  min: number;
  max: number;
  step: number | null;
  value: number | number[];
  marks?: { value: number; label: string }[];
  onChange: (event: Event | null, value: number | number[], activeThumb: number) => void;
  onChangeCommitted?: (event: React.SyntheticEvent | Event, value: number) => void;
  disabled?: boolean;
  valueLabelDisplay: 'auto' | 'on' | 'off';
}

/**
 * MUI 9.5 Slider's DOM for the props Vanguard passes (horizontal, color primary, size medium, track normal): root
 * span > rail, track (inline left/width), marks + mark labels, one thumb per value (inline left + z-index/pointer
 * events) holding the hidden range input and, unless valueLabelDisplay is 'off', the value label. Same classes incl.
 * MUI's duplicated thumb tokens. Behaviour from use-own-slider.ts; emotion's rules in _Slider.compat.scss.
 */
const OwnSlider = (props: OwnSliderProps) => {
  const { min, max, step, marks: marksProp, disabled = false, valueLabelDisplay, onChange, onChangeCommitted } = props;
  const s = useOwnSlider({
    value: props.value,
    min,
    max,
    step,
    marks: marksProp ?? false,
    disabled,
    onChange: onChange as never,
    onChangeCommitted: onChangeCommitted as never,
    rootRef: props.rootRef as never,
  });
  const marked = s.marks.length > 0 && s.marks.some((m) => m.label);
  const vgType = useVanguardTypography() === 'vanguard' ? 'vg-typography-vanguard' : undefined;
  return (
    <span
      ref={s.rootRef}
      data-vg-core=""
      data-slot={'slider'}
      data-disabled={disabled ? '' : undefined}
      data-dragging={s.dragging ? '' : undefined}
      className={cls(
        'MuiSlider-root',
        disabled && 'Mui-disabled',
        s.dragging && 'MuiSlider-dragging',
        marked && 'MuiSlider-marked',
        'MuiSlider-colorPrimary',
        'MuiSlider-sizeMedium',
        vgType,
      )}
      onPointerDown={s.onRootPointerDown}
    >
      <span data-vg-core="" data-slot={'slider-rail'} className={'MuiSlider-rail'} />
      <span
        data-vg-core=""
        data-slot={'slider-track'}
        style={{ left: `${s.trackOffset}%`, width: `${s.trackLeap}%` }}
        className={'MuiSlider-track'}
      />
      {s.marks
        .filter((mark) => mark.value >= min && mark.value <= max)
        .map((mark, index) => {
          const percent = valueToPercent(mark.value, min, max);
          const markActive = s.range
            ? mark.value >= s.values[0] && mark.value <= s.values[s.values.length - 1]
            : mark.value <= s.values[0];
          return (
            <React.Fragment key={index}>
              <span
                data-index={index}
                data-vg-core=""
                data-slot={'slider-mark'}
                style={{ left: `${percent}%` }}
                className={cls('MuiSlider-mark', markActive && 'MuiSlider-markActive')}
              />
              {mark.label != null ? (
                <span
                  aria-hidden={true}
                  data-index={index}
                  data-vg-core=""
                  data-slot={'slider-mark-label'}
                  style={{ left: `${percent}%` }}
                  className={cls(
                    'MuiSlider-markLabel',
                    'MuiSlider-markLabel',
                    markActive && 'MuiSlider-markLabelActive',
                  )}
                >
                  {mark.label}
                </span>
              ) : null}
            </React.Fragment>
          );
        })}
      {s.values.map((value, index) => {
        const percent = valueToPercent(value, min, max);
        const open = s.open === index || s.active === index || valueLabelDisplay === 'on';
        return (
          <span
            key={index}
            data-index={index}
            data-vg-core=""
            data-slot={'slider-thumb'}
            {...s.thumbHandlers}
            className={cls(
              'MuiSlider-thumb',
              disabled && 'Mui-disabled',
              'MuiSlider-thumb',
              disabled && 'Mui-disabled',
              s.active === index && 'Mui-active',
              s.focusedThumbIndex === index && 'Mui-focusVisible',
            )}
            style={{ left: `${percent}%`, ...s.getThumbStyle(index) }}
          >
            <input
              data-index={index}
              aria-valuenow={value}
              aria-orientation="horizontal"
              aria-valuemax={max}
              aria-valuemin={min}
              type="range"
              min={min}
              max={max}
              step={step === null && marksProp ? 'any' : (step ?? undefined)}
              disabled={disabled}
              {...s.inputHandlers}
              style={HIDDEN_INPUT_STYLE}
              value={s.values[index]}
            />
            {valueLabelDisplay === 'off' ? null : (
              <span
                data-vg-core=""
                data-slot={'slider-value-label'}
                className={cls(open && 'MuiSlider-valueLabelOpen', 'MuiSlider-valueLabel')}
                aria-hidden={true}
              >
                <span className={'MuiSlider-valueLabelCircle'}>
                  <span className={'MuiSlider-valueLabelLabel'}>{value}</span>
                </span>
              </span>
            )}
          </span>
        );
      })}
    </span>
  );
};
