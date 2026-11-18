import './TimePicker.scss';

import { FormConfigElement } from '@custom-hooks/useFormConfig';
import { classNames } from '@helpers/classNames';
import { formatHours, getHourFormat } from '@helpers/format-utils';
import { generateHoursList, HourType } from '@helpers/hours-list';
import { ComponentContainer } from '@vanguard/ComponentContainer/ComponentContainer';
import { Select, SelectOnChange, SelectOptionProps } from '@vanguard/Select/Select';
import moment from 'moment';
import React, { useEffect, useState } from 'react';

import { Icon } from '../Icon/Icon';
import { IconNames } from '../Icon/IconNames';
import { useResolvedFormConfig } from '../Form/use-resolved-form-config';

export type TimePickerProps = {
  id?: string;
  value?: string;
  label: string;
  showAmPm?: boolean;
  hourListType: HourType;
  min?: string;
  max?: string;
  containerClassName?: string;
  onChange?: SelectOnChange;
  testId?: string;
  formconfig?: FormConfigElement;
  /** F3: bind to the nearest <Form config>'s field of this name (no `formconfig` prop needed). */
  field?: string;
  /** F3: element index for array fields bound with `field`. */
  index?: number;
  freeSolo?: boolean;
};

export const TimePicker = (props: TimePickerProps) => {
  const {
    onChange,
    label,
    value,
    hourListType,
    containerClassName,
    min,
    max,
    showAmPm,
    id,
    testId,
    formconfig: formconfigProp,
    field,
    index: fieldIndex,
    freeSolo,
  } = props;
  // F3: explicit formconfig (legacy) or `field` resolved from the nearest Form's context.
  const formconfig = useResolvedFormConfig(formconfigProp, field, fieldIndex);

  const [valueFormatted, setValueFormatted] = useState(formatHours(value ?? formconfig?.getValue?.() ?? '', showAmPm));
  useEffect(() => {
    if (value) {
      setValueFormatted(formatHours(value, showAmPm));
    }
  }, [value, showAmPm]);

  const [options, setOptions] = useState<SelectOptionProps>([]);
  useEffect(() => {
    const hourList = generateHoursList(hourListType, showAmPm);
    const mappedOptions = hourList.map((hour, key) => {
      let disabled = false;
      if (min || max) {
        const hrFormat = getHourFormat(showAmPm);
        const hourMoment = moment(hour, hrFormat);
        const minMoment = moment(min, hrFormat);
        const maxMoment = moment(max, hrFormat);
        disabled = minMoment.isAfter(hourMoment) || maxMoment.isBefore(hourMoment);
      }
      return { key: key, value: hour, title: hour, disabled: disabled };
    });
    setOptions(mappedOptions);
  }, [min, max, showAmPm]);

  /**
   * Return View
   */
  return (
    <ComponentContainer className={classNames('TimePicker-container', containerClassName)} testId={testId}>
      <Icon className={'TimePicker-icon'} color={'--n500'}>
        {IconNames.clock}
      </Icon>
      <Select
        formconfig={formconfig}
        id={id}
        label={label}
        value={valueFormatted}
        valueAsDefaultValue={false}
        onChange={onChange}
        options={options}
        freeSolo={freeSolo}
        required={true}
        translateOptions={false}
      />
    </ComponentContainer>
  );
};
