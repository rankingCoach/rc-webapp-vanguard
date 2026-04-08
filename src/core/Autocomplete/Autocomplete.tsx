import './Autocomplete.scss';

import { classNames } from '@helpers/classNames';
import { Autocomplete as MuiAutocomplete, AutocompleteChangeReason, Chip } from '@mui/material';
import {
  AutocompleteProps as MUIAutocompleteProps,
  AutocompleteRenderGetTagProps,
  AutocompleteRenderOptionState,
} from '@mui/material/Autocomplete/Autocomplete';
import {
  InputBase,
  InputFormConfigProps,
  InputLabelProps,
  InputPopoverProps,
  InputValueProps,
} from '@vanguard/_internal/InputBase/InputBase';
import { useResolvedFormConfig } from '@vanguard/Form/FormConfigContext';
import { Icon } from '@vanguard/Icon/Icon';
import { IconNames } from '@vanguard/Icon/IconNames';
import match from 'autosuggest-highlight/match';
import parse from 'autosuggest-highlight/parse';
import React, { MutableRefObject, useEffect, useRef, useState } from 'react';

import { ComponentContainer } from '../ComponentContainer/ComponentContainer';
import { Text } from '../Text/Text';

/**
 * Autocomplete Props
 */
export type AutocompleteProps = {
  className?: string;
  testId?: string;
  optionKey?: string; //If the option is an object, then use this key to get option's value
  noOptionsText?: string | React.ReactNode; //Works only, if restrictToOptions is true
  splitCommaTag?: boolean;
  highlightOptions?: boolean;
  restrictToOptions?: boolean; //@TODO does not work without FORMCONFIG
  hideClearButton?: boolean;
  hideCaret?: boolean;
  open?: boolean;
  isLoading?: boolean;
  noOptionsComponent?: React.ReactNode;
  autoSelect?: boolean;
  adornment?: React.ReactNode[];
} & InputLabelProps &
  InputValueProps &
  InputFormConfigProps &
  InputPopoverProps &
  Pick<
    MUIAutocompleteProps<any, any, any, any, any>,
    | 'onInputChange'
    | 'options'
    | 'multiple'
    | 'filterOptions'
    | 'onChange'
    | 'onKeyUp'
    | 'onKeyDown'
    | 'autoHighlight'
    | 'value'
    | 'onBlur'
    | 'onFocus'
    | 'blurOnSelect'
    | 'autoComplete'
  >;

/**
 * ---------------------------------------------------------------------------------------------------------------------
 */
export const Autocomplete = (props: AutocompleteProps) => {
  const resolvedFormConfig = useResolvedFormConfig(props.formconfig);
  const {
    className,
    id,
    value,
    infoText,
    label,
    labelType,
    placeholder,
    inputRef,
    formconfig: _formconfig,
    optionKey,
    options,
    noOptionsText = null,
    splitCommaTag = false,
    multiple = false,
    hideCaret = false,
    hideClearButton = false,
    restrictToOptions = true,
    highlightOptions = true,
    popoverPosition,
    popoverMessage,
    onKeyUp,
    onKeyDown,
    onChange,
    autoComplete = true,
    testId,
    replacements,
    disabled,
    isLoading,
    autoSelect = true,
    adornment,
    ...rest
  } = props;
  const formconfig = resolvedFormConfig;

  const optionFocused = useRef<boolean | null>(null); // used as a Boolean to indicate whether user Focused on any option in dropdown

  const [adornmentIndex, setAdornmentIndex] = useState<number | undefined>(undefined);

  /**
   * FormConfig @todo test integration when using "multiple" tags...
   * -------------------------------------------------------------------------------------------------------------------
   */
  let innerInputRef = inputRef;
  if (!innerInputRef) {
    innerInputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  }

  let autoRef: MutableRefObject<HTMLInputElement | HTMLTextAreaElement | null> | null = null;
  if (formconfig) {
    autoRef = formconfig._autocompleteRef ?? null;
    innerInputRef = formconfig._inputRef;
  }

  // Required field
  let { required } = props;
  if (formconfig?.validation?.required === true || formconfig?.validation?.required === false) {
    required = formconfig?.validation?.required;
  }

  useEffect(() => {
    const autocompleteEl = formconfig?._autocompleteRef?.current;
    if (autocompleteEl) {
      autocompleteEl.value = formconfig?.stateValue;
      setAdornmentIndex(Number(formconfig?.stateValue?.key));
    }
  }, [formconfig]);

  const [val, setVal] = useState((value ?? multiple) ? [] : null); //Autocompletes's Value
  useEffect(() => {
    if (formconfig) {
      setTimeout(() => {
        setVal(formconfig?.stateValue);
        setAdornmentIndex(Number(formconfig?.stateValue?.key));
      }, 0);
    }
  }, [formconfig?.stateValue]);

  const ShowAdornment = (index?: number): React.ReactNode | null => {
    if (!adornment || index === undefined) return null;
    return adornment[index];
  };

  /**
   * -------------------------------------------------------------------------------------------------------------------
   * AUTOCOMPLETE
   * -------------------------------------------------------------------------------------------------------------------
   */

  const renderTags = (value: any[], getTagProps: AutocompleteRenderGetTagProps) => {
    if (!multiple) return null;
    return (
      <div className={'vanguard-input-tags'}>
        {value.map((option: any, index) => (
          <Chip
            label={<Text>{optionKey && option ? option[optionKey] : option}</Text>}
            {...getTagProps({ index })}
            key={index}
            style={{ height: '100%' }}
          />
        ))}
      </div>
    );
  };

  /**
   * Events: Autocomplete
   * --------------------
   */
  const onAutocompleteChangeFn = (
    e: React.SyntheticEvent,
    nextVal: string[] | string | ({ key: string | number; value: string } & Record<string, any>),
    reason?: AutocompleteChangeReason,
    details?: any,
  ) => {
    if (restrictToOptions && innerInputRef && innerInputRef.current && typeof nextVal === 'string') {
      innerInputRef.current.value = nextVal;
    }

    if (nextVal && typeof nextVal === 'object' && !Array.isArray(nextVal) && 'key' in nextVal) {
      setAdornmentIndex(Number(nextVal.key));
    } else {
      setAdornmentIndex(undefined);
    }

    // Callback
    if (onChange) {
      if (!reason) {
        reason = 'blur';
      }
      onChange(e, nextVal, reason, details);
    }
  };

  /**
   * -------------------------------------------------------------------------------------------------------------------
   * INNER INPUT
   * -------------------------------------------------------------------------------------------------------------------
   */

  const splitOnEnter = (e: React.KeyboardEvent<HTMLDivElement>) => {
    // Used when Autocomplete is a "multiple" with tags
    // When Enter pressed and no option is focused --> we parse the input for tags
    if (e.key === 'Enter' && !optionFocused.current) {
      const keys = innerInputRef?.current?.value.split(',').filter((x: string) => !!x) ?? [];
      const mapped: string[] =
        keys?.map(
          optionKey
            ? (x: any) => {
                return { [optionKey]: x };
              }
            : (x: any) => x,
        ) ?? [];

      // If Enter pressed (input) --> trigger a value changed on Autocomplete itself
      if (Array.isArray(val)) {
        onAutocompleteChangeFn(e, [...val, ...mapped], 'selectOption');
      } else {
        onAutocompleteChangeFn(e, [...mapped], 'selectOption');
      }

      // Stop the Event if we have split something
      if (keys?.length > 0) {
        e.stopPropagation();
        e.preventDefault();
        e.nativeEvent.stopImmediatePropagation();
      }
    }
  };

  const detectFocusedOption = () => {
    const els: any = document.getElementsByClassName('MuiAutocomplete-option');
    if (optionFocused.current) {
      optionFocused.current = false;
      for (const el of els) {
        if (el.className.indexOf('Mui-focused') > -1) {
          optionFocused.current = true;
        }
      }
    }
  };

  /**
   * Events: Inner input
   * --------------------
   */
  const onInputChangeFn = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    //
  };

  const onInputKeyUpFn = (e: React.KeyboardEvent<HTMLDivElement>) => {
    detectFocusedOption();
    onKeyUp && onKeyUp(e);
  };

  const onInputKeyDownFn = (e: React.KeyboardEvent<HTMLDivElement>) => {
    detectFocusedOption();
    splitCommaTag && splitOnEnter(e);
    onKeyDown && onKeyDown(e);
  };

  /**
   * -------------------------------------------------------------------------------------------------------------------
   * OPTIONS & DROPDOWN MENU
   * -------------------------------------------------------------------------------------------------------------------
   */
  const renderOption = (
    props: React.HTMLAttributes<HTMLLIElement>,
    option: any,
    { inputValue }: AutocompleteRenderOptionState,
  ) => {
    if (highlightOptions) {
      const title = getOptionLabel(option);
      const matches = match(title, inputValue);
      const parts = parse(title, matches);
      return (
        <li {...props} key={title}>
          <div className={'option-style'}>
            {ShowAdornment(option.key)}
            <span>
              {parts.map((part, index) => (
                <span
                  style={{
                    fontWeight: part.highlight ? 700 : 400,
                  }}
                  key={index}
                >
                  {part.text}
                </span>
              ))}
            </span>
          </div>
        </li>
      );
    }

    const title = getOptionLabel(option);
    return (
      <li {...props} key={title}>
        <div>{title}</div>
      </li>
    );
  };

  /**
   * Returns the "Option Label" that is used to set input's value when an option is being selected
   */
  const getOptionLabel = (option?: any) => {
    const keys = Object.keys(option ?? {});
    //@ts-ignore @TODO @AdrianKott check this!
    if (option === [] || keys.length === 0) {
      return '';
    }
    if (typeof option === 'object') {
      if (!optionKey || (!option.hasOwnProperty(optionKey) && !option.hasOwnProperty('objectType'))) {
        console.warn(
          `Autocomplete: 'optionKey' = ${optionKey} doesn't match options properties! available are:: ${keys.join(
            ', ',
          )}`,
        );
      }
      return option && optionKey ? (option[optionKey] ?? '') : '';
    }
    return option;
  };

  /**
   * Used to determine if the option represents the given value. Uses strict equality by default.
   * Both arguments need to be handled, an option can only match with one value. ⚠️
   *
   *    option: The option to test.
   *    value: The value to test against.
   */
  const isOptionEqualToValue = (option: any, value: any): boolean => {
    if (!value) {
      return false;
    }

    let optionTitle = option;
    if (typeof option === 'object') {
      const optionObj: Record<string, any> = option as unknown as object;
      if (optionObj && optionKey) {
        if (!optionObj.hasOwnProperty(optionKey)) {
          console.warn("Autocomplete: 'optionKey' doesn't match options properties!", optionKey);
        }

        optionTitle = optionObj[optionKey];
      }
    }

    const valueTitle = value;
    if (typeof value === 'object') {
      const valueObj: Record<string, any> = value as unknown as object;
      if (valueObj && optionKey) {
        if (!valueObj.hasOwnProperty(optionKey)) {
          console.warn("Autocomplete: 'optionKey' doesn't match value's properties!", optionKey);
        }

        optionTitle = valueObj[optionKey];
      }
    }

    return optionTitle === valueTitle;
  };

  /**
   * Function: getContainerClasses
   */
  const getContainerClasses = () => {
    const classes = ['vanguard-autocomplete'];
    if (className) {
      classes.push(className);
    }
    if (hideClearButton) {
      classes.push('vanguard-autocomplete-no-clear-btn');
    }

    if (hideCaret || value !== null) {
      classes.push('vanguard-autocomplete-no-caret');
    }
    return classNames(...classes);
  };

  const EmptyListComponent = () => {
    return <div>No options available!!</div>;
  };

  /**
   * -------------------------------------------------------------------------------------------------------------------
   * Return View
   * -------------------------------------------------------------------------------------------------------------------
   */
  return (
    <ComponentContainer className={getContainerClasses()}>
      <MuiAutocomplete
        {...rest}
        data-testid={testId}
        id={id}
        ref={autoRef}
        value={val}
        freeSolo={!restrictToOptions}
        autoComplete={autoComplete}
        autoSelect={autoSelect}
        multiple={multiple}
        options={options}
        noOptionsText={noOptionsText}
        renderTags={renderTags}
        renderOption={renderOption}
        ListboxComponent={options.length === 0 ? EmptyListComponent : undefined}
        isOptionEqualToValue={isOptionEqualToValue}
        getOptionLabel={getOptionLabel}
        onChange={onAutocompleteChangeFn}
        clearIcon={<Icon color={'--n400'}>{IconNames.close}</Icon>}
        popupIcon={<Icon color={'--n400'}>{IconNames.caretDown}</Icon>}
        disabled={disabled}
        renderInput={(params) => {
          return (
            <InputBase
              inputRef={innerInputRef}
              isLoading={isLoading}
              testId={`${testId}-input`}
              textFieldProps={params}
              required={required}
              infoText={infoText}
              label={label}
              labelType={labelType}
              placeholder={placeholder}
              popoverMessage={popoverMessage}
              popoverPosition={popoverPosition}
              onKeyDown={onInputKeyDownFn}
              onKeyUp={onInputKeyUpFn}
              onChange={onInputChangeFn}
              formFieldType={'Autocomplete'}
              replacements={replacements}
              adornment={ShowAdornment(adornmentIndex)}
            />
          );
        }}
      />
    </ComponentContainer>
  );
};
