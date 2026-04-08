import { dFlex, gap1 } from '@globalStyles';
import { classNames } from '@helpers/classNames';
import { MenuItem } from '@mui/material';
import { translationService } from '@services/translation.service';
import {
  InputBase,
  InputEventsProps,
  InputFormConfigProps,
  InputLabelProps,
  InputPopoverProps,
  InputSelectProps,
  InputValueProps,
} from '@vanguard/_internal/InputBase/InputBase';
import { ComponentContainer } from '@vanguard/ComponentContainer/ComponentContainer';
import { useResolvedFormConfig } from '@vanguard/Form/FormConfigContext';
import { Render } from '@vanguard/Render/Render';
import { Text, TextTypes } from '@vanguard/Text/Text';
import React, { ChangeEvent, useEffect, useRef, useState } from 'react';

import styles from './Select.module.scss';

export type SelectOptionsComponentProps = Omit<SelectOptionProp, 'component'> & {
  selectedItem: SelectOptionProp | null;
};
export type SelectOptionProp<T extends string = any> = {
  key: string | number;
  value: T | number;
  title: string | number;
  description?: string;
  disabled?: boolean;
  hidden?: boolean;
  className?: string;
  leftImageUrl?: string;
};

export type SelectOptionProps<T extends string = any> = SelectOptionProp[];
export type SelectOnChange = (
  e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  selectedValue?: SelectOptionProp,
) => void;

type Props<T extends string = any> = {
  testId?: string;
  className?: string;
  options?: SelectOptionProps<T>;
  adornment?: React.ReactNode[];
  customOptionsRenderer?: React.ComponentType<SelectOptionsComponentProps>;
  customInputRenderer?: React.ComponentType<SelectOptionsComponentProps>;
  ellipsis?: boolean;
  containToSelectWidth?: boolean;
  descriptionUnderTitle?: boolean;
  translateOptions?: boolean;
  valueAsDefaultValue?: boolean;
  freeSolo?: boolean; // New prop to enable freeSolo functionality
} & InputPopoverProps &
  InputValueProps &
  InputLabelProps &
  InputEventsProps &
  InputFormConfigProps &
  InputSelectProps & {
    onChange?: SelectOnChange;
  };
export type SelectProps<T extends string = any> = Props<T>;
export const Select = (props: Props) => {
  const resolvedFormConfig = useResolvedFormConfig(props.formconfig);
  const { formconfig, ...inputProps } = props;
  const {
    className,
    options,
    customOptionsRenderer,
    value = '',
    adornment,
    testId,
    translateOptions = true,
    valueAsDefaultValue = true,
    descriptionUnderTitle = false,
    ellipsis = false,
    containToSelectWidth = false,
    freeSolo = false,
    customInputRenderer,
  } = inputProps;

  const [innerValue, setInnerValue] = useState(value);
  const [selectedItemValue, setSelectedItemValue] = useState<SelectOptionProp | null>(null);
  const [selectWidth, setSelectWidth] = useState<number>(0);
  const [adornmentIndex, setAdornmentIndex] = useState(0);
  const selectInputRef = useRef<HTMLDivElement>(null);

  const ShowAdornment = (index: number): React.ReactNode | null => {
    if (!adornment) return null;
    return adornment[index];
  };

  useEffect(() => {
    if (selectInputRef.current) {
      const width = selectInputRef.current.clientWidth;
      setSelectWidth(width);
    }
  }, [selectInputRef]);

  useEffect(() => {
    setInnerValue(value);
  }, [value]);

  useEffect(() => {
    const selectedItem = options?.find((option) => option.value === innerValue);
    setAdornmentIndex(Number(selectedItem?.key));
    setSelectedItemValue(selectedItem || null);
  }, [innerValue, options]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setInnerValue(inputValue);

    const selectedItem = options?.find((option) => option.value === inputValue);
    if (selectedItem) {
      props.onChange && props.onChange(e, selectedItem);
      setAdornmentIndex(Number(selectedItem?.key));
      setSelectedItemValue(selectedItem);
    }
  };

  return (
    <ComponentContainer className={classNames(className)} testId={testId} innerRef={selectInputRef}>
      <InputBase
        {...inputProps}
        formFieldType={'Select'}
        formconfig={resolvedFormConfig}
        value={innerValue}
        valueAsDefaultValue={valueAsDefaultValue}
        select={true}
        multiline={false}
        adornment={ShowAdornment(adornmentIndex)}
        triggerChangeOnStateFieldChange={true}
        selectRenderValue={(value: string | number) => {
          if (!options) {
            return '';
          }

          const item = options.find((option) => option.value === value);

          if (customInputRenderer && typeof customInputRenderer === 'function') {
            const renderItem: SelectOptionProp = item ?? {
              className: '',
              description: '',
              disabled: false,
              key: '',
              leftImageUrl: '',
              title: '',
              value: '',
            };
            return React.createElement(customInputRenderer, {
              ...renderItem,
              selectedItem: selectedItemValue ?? null,
            });
          }

          if (!item && !freeSolo) {
            if (item) {
              console.warn('Select: value not found in options', item, options);
            }
            return null;
          }

          if (translateOptions && item) {
            return translationService.get(`${item.title}`).value;
          }
          return item ? item.title : value; // Return value directly if freeSolo is enabled
        }}
        onChange={handleInputChange}
      >
        {options &&
          options.map((item, index) => (
            <MenuItem
              key={item.key ?? index}
              value={item.value}
              disabled={item.disabled}
              className={classNames(dFlex, gap1)}
              style={containToSelectWidth ? { maxWidth: selectWidth } : undefined}
            >
              <Render if={!customOptionsRenderer}>
                {ShowAdornment(index)}
                {item.leftImageUrl && <img src={item.leftImageUrl} alt="" width="32" height="24" />}
                <div className={classNames(descriptionUnderTitle ? styles.descUnderTitle : '', dFlex, gap1)}>
                  <Text type={TextTypes.text} translate={translateOptions}>
                    {item.title}
                  </Text>
                  {item.description && (
                    <Text type={TextTypes.textHelp} translate={translateOptions} ellipsis={ellipsis}>
                      {item.description}
                    </Text>
                  )}
                </div>
              </Render>
              <Render if={!!customOptionsRenderer}>
                {typeof customOptionsRenderer === 'function' &&
                  React.createElement(customOptionsRenderer, {
                    ...item,
                    selectedItem: selectedItemValue ?? null,
                  })}
              </Render>
            </MenuItem>
          ))}
      </InputBase>
    </ComponentContainer>
  );
};
