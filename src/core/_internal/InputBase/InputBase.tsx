import './InputBase.scss';

import { REGEX } from '@config/regex';
import { useWindowResize } from '@custom-hooks/use-window.resize';
import { FormConfigElement, FormFieldType } from '@custom-hooks/useFormConfig';
import { classNames } from '@helpers/classNames';
import { debounce } from '@helpers/debounce';
import { preventInput } from '@helpers/input-preventions/prevent-input';
import { sanitizeHtml } from '@helpers/sanitize-html';
import { highlightedTextMaxLength } from '@helpers/string-helpers';
import { isValidHexColor } from '@helpers/validators/hex-color/hex-color';
import { validInput } from '@helpers/validators/valid-input/valid-input';
import { Skeleton, TextField, TextFieldProps } from '@mui/material';
import { translationService } from '@services/translation.service';
import { Icon } from '@vanguard/Icon/Icon';
import { IconNames } from '@vanguard/Icon/IconNames';
import { Link } from '@vanguard/Link/Link';
import { Popover } from '@vanguard/Popover/Popover';
import { Render } from '@vanguard/Render/Render';
import { FontWeights, Text, TextReplacements } from '@vanguard/Text/Text';
import React, { CSSProperties, MutableRefObject, ReactNode, useCallback, useEffect, useRef, useState } from 'react';

/**
 * Props: Value
 * ---------------------------------------------------------------------------------------------------------------------
 */
export type InputBaseValueType = string | number | ({ key: string | number; value: string } & Record<string, any>); // @todo test case when number;
export type InputValueProps = {
  value?: InputBaseValueType;
  defaultValue?: string | number; // @todo test case when number;
  valueAsDefaultValue?: boolean;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  infoText?: string;
  id?: string;
  replacements?: TextReplacements;
  triggerChangeOnStateFieldChange?: boolean;
  autoFocus?: boolean;
};

/**
 * Props: Label
 * ---------------------------------------------------------------------------------------------------------------------
 */
export type InputLabelProps = {
  label?: string | false;
  labelType?: 'floating' | 'static' | 'outer' | 'hidden';
  labelStyle?: CSSProperties;
};

/**
 * Props: Popover
 * ---------------------------------------------------------------------------------------------------------------------
 */
export type InputPopoverProps = {
  popoverMessage?: string;
  popoverPosition?: 'top' | 'bottom' | 'left' | 'right';
};

/**
 * Props: Counter
 * ---------------------------------------------------------------------------------------------------------------------
 */
export type InputCounterProps = {
  counter?: boolean;
  maxLength?: number;
};

/**
 * Props: Helper Link
 * ---------------------------------------------------------------------------------------------------------------------
 */
export type InputHelperLinkProps = {
  helperLinkText?: string;
  onHelperLinkClick?: (value: InputBaseValueType) => void;
  helperLinkDisabled?: boolean;
  helperLinkHref?: string;
};

/**
 * Props: Highlights
 * ---------------------------------------------------------------------------------------------------------------------
 */
export type InputHighlightsProps = {
  highlightWords?: string[];
  prohibitedWords?: string[];
  highlightUrl?: boolean;
  highlightUrlType?: 'positive' | 'negative' | 'info';
  highlightLengthExceeded?: boolean;

  onProhibitedWordFound?: (word?: string, config?: FormConfigElement) => void;
  onHighlightWordFound?: (word?: string, config?: FormConfigElement) => void;
};

/**
 * Props: Textarea
 * ---------------------------------------------------------------------------------------------------------------------
 */
export type InputTextareaProps = {
  multiline?: boolean;
  rows?: number;
  minRows?: number;
  maxRows?: number;
  allowBreakLines?: boolean;
};

/**
 * Props: Select
 * ---------------------------------------------------------------------------------------------------------------------
 */

export type InputSelectProps = {
  select?: boolean;
  nativeSelect?: boolean;
  selectRenderValue?: (key: string) => React.ReactNode;
  selectDisplayEmpty?: boolean;
  menuItemHeight?: number;
  maxMenuItemsUntilScroll?: number;
  theme?: 'default' | 'grey'; // Think about implementing this for other Input Types as well
};

/**
 * Props: Events
 * ---------------------------------------------------------------------------------------------------------------------
 */
export type InputEventsProps = {
  onFocus?: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement, Element>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement, Element>) => void;
  onKeyUp?: (e: React.KeyboardEvent<HTMLDivElement>) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLDivElement>) => void;
  onInput?: (e: React.FormEvent<HTMLDivElement>) => void;
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onClick?: (event: React.MouseEvent) => void;
  onStepUpNumericClick?: (event: React.MouseEvent) => void;
  onStepDownNumericClick?: (event: React.MouseEvent) => void;
};

/**
 * Props: Form Config
 * ---------------------------------------------------------------------------------------------------------------------
 */
export type InputFormConfigProps = {
  inputRef?: MutableRefObject<HTMLInputElement | HTMLTextAreaElement | null>;
};

/**
 * Props: Adornment Props
 * ---------------------------------------------------------------------------------------------------------------------
 */
export type InputAdornmentProps = {
  isLoading?: boolean;
  adornment?: React.ReactNode;
  endAdornment?: React.ReactNode;
  roundedNumericCTAType?: boolean;
};

type PopoverHighlightVariant = 'basicLink';
export type PopoverHighlightType = {
  /**
   * This determines what we detect at the moment we have only link but in the future we could have regex etc
   * */
  detector: 'link';
  /**
   * This determines the color / hover color of the detected element
   * */
  variant: PopoverHighlightVariant;
};
/**
 * Props
 * ---------------------------------------------------------------------------------------------------------------------
 */
export type rcInputBaseProps = {
  className?: string;
  formFieldType?: FormFieldType;
  fieldConfig?: FormConfigElement;
  popoverHighlight?: PopoverHighlightType;
  type?: React.InputHTMLAttributes<unknown>['type']; //text|number|password|etc
  children?: React.ReactNode;
  textFieldProps?: TextFieldProps; //use to set any MUI prop which is not publicly exposed in "rcInputBasePropsBase" type
  testId?: string;
} & InputValueProps &
  InputAdornmentProps &
  InputLabelProps &
  InputPopoverProps &
  InputCounterProps &
  InputTextareaProps &
  InputSelectProps &
  InputHighlightsProps &
  InputEventsProps &
  InputFormConfigProps &
  InputHelperLinkProps;

/**
 * ---------------------------------------------------------------------------------------------------------------------
 * Component: InputBase
 * ---------------------------------------------------------------------------------------------------------------------
 */
export const InputBase = (props: rcInputBaseProps) => {
  const {
    id,
    className,
    formFieldType = 'InputBase',
    type = 'Text',
    roundedNumericCTAType = false,
    value,
    defaultValue,
    valueAsDefaultValue,
    placeholder,
    disabled,
    label,
    labelType = 'floating',
    infoText,
    popoverMessage,
    popoverPosition = 'top',
    multiline,
    rows,
    minRows = 3,
    maxRows = 6,
    allowBreakLines,
    highlightUrl,
    highlightWords,
    prohibitedWords,
    highlightLengthExceeded,
    counter,
    select = false,
    selectRenderValue,
    selectDisplayEmpty,
    menuItemHeight = 36,
    maxMenuItemsUntilScroll = 7,
    children,
    onFocus,
    onBlur,
    onKeyUp,
    onKeyDown,
    onInput,
    onClick,
    onChange,
    onStepUpNumericClick,
    onStepDownNumericClick,
    testId,
    isLoading,
    adornment,
    endAdornment,
    textFieldProps = {},
    replacements,
    onProhibitedWordFound,
    onHighlightWordFound,
    triggerChangeOnStateFieldChange,
    theme = 'default',
    autoFocus,
    highlightUrlType = 'negative',
    popoverHighlight,
    helperLinkText,
    onHelperLinkClick,
    helperLinkDisabled,
    helperLinkHref,
    labelStyle,
  } = props;
  const fieldConfig = props.fieldConfig;

  let { maxLength } = props;

  const width = useWindowResize(100);

  /**
   * Form Config
   * -------
   */
  // Input Ref
  let { inputRef } = props;
  if (fieldConfig) {
    inputRef = fieldConfig._inputRef;
  } else if (!inputRef) {
    inputRef = useRef(null);
  }

  // Length field
  const [length, setLength] = useState((value && typeof value === 'string' && value.length) ?? 0);

  // Hoisted early so resizeBackdrop (useCallback below) can close over stable values.
  // The duplicate declarations further down in the "UI: Highlights" section are removed.
  const useBackdrop = !!(highlightLengthExceeded || highlightWords || highlightUrl || prohibitedWords);
  const backDropRef = useRef<HTMLDivElement>(null);

  // useCallback so the debounce wrapper created below is not thrown away and re-created
  // on every render (which would mean the debounce never actually fires).
  const resizeBackdrop = useCallback(() => {
    if (useBackdrop && backDropRef && backDropRef.current && inputRef && inputRef.current) {
      backDropRef.current.style.height = `${inputRef.current.getBoundingClientRect().height.toString()}px`;
      backDropRef.current.style.width = `${inputRef.current.getBoundingClientRect().width.toString()}px`;
      backDropRef.current.scrollTop = inputRef.current.scrollTop;
      backDropRef.current.scrollLeft = inputRef.current.scrollLeft;
    }
  // backDropRef and inputRef are refs — their .current changes without triggering re-renders,
  // so we only need useBackdrop in the dep array.
  }, [useBackdrop, backDropRef, inputRef]);

  const debouncedResizeBackdrop = React.useMemo(() => debounce(resizeBackdrop, 100), [resizeBackdrop]);

  useEffect(() => {
    if (typeof value === 'string') {
      setLength(value.length);
    } else {
      setLength(0);
    }
  }, [value]);

  useEffect(() => {
    debouncedResizeBackdrop();
  }, [width, debouncedResizeBackdrop]);

  if (fieldConfig) {
    if (fieldConfig?.validation && 'maxLength' in fieldConfig?.validation) {
      maxLength = fieldConfig?.validation?.maxLength;
    }
  }

  // Required field
  let { required } = props;
  if (fieldConfig?.validation?.required === true || fieldConfig?.validation?.required === false) {
    required = fieldConfig?.validation?.required;
  }

  // Errors state
  const hasError = !!fieldConfig?.hasError;

  // Set State Value
  useEffect(() => {
    if (fieldConfig) {
      const inputElement = fieldConfig._inputRef?.current;
      if (formFieldType !== 'Autocomplete') {
        if (inputElement) {
          inputElement.value = fieldConfig?.stateValue ?? '';
          if (triggerChangeOnStateFieldChange && onChange) {
            onChange({
              target: {
                value: fieldConfig?.stateValue,
              },
            } as any);
          }
        }
      }
      const nextInputValue = fieldConfig.getInputValue?.() ?? fieldConfig.stateValue;
      setLength(typeof nextInputValue === 'string' ? nextInputValue.length : 0);
    }
  }, [fieldConfig?.stateValue]);

  useEffect(() => {
    updateBackdrop(fieldConfig?.getInputValue?.() ?? fieldConfig?.stateValue);
  }, [fieldConfig?.stateValue, prohibitedWords]);
  // Is Valid
  const doValidate = (fieldConfig?: FormConfigElement): boolean => {
    return validInput(fieldConfig);
  };

  useEffect(() => {
    if (value && highlightUrl && typeof value === 'string') {
      updateBackdrop(value);
    }
  }, [highlightUrl, value, highlightUrlType]);
  /**
   * UI: Label
   * -------
   */
  const getLabelProps = () => {
    if (!label) return { shrink: true, style: labelStyle };
    if (labelType === 'static') return { shrink: true, style: labelStyle };
    if (labelType === 'outer') return { shrink: true, style: labelStyle };
    return null;
  };

  const getLabelTypeClasses = () => {
    if (!label || labelType === 'hidden') return 'vanguard-label-hidden';
    if (labelType === 'outer') return 'vanguard-label-outer';
    return '';
  };

  const getLabel = () => {
    if (!label || labelType === 'hidden') {
      return null;
    }
    return (
      <>
        {translationService.get(label, replacements).value}
        {!required && (
          <span
            className={'vanguard-input-label-optional'}
            style={{ color: labelStyle?.color ? `rgb(from ${labelStyle.color} r g b / 0.7)` : undefined }}
          >
            {translationService.get('Optional', undefined).value}
          </span>
        )}
      </>
    );
  };

  /**
   * UI: Adornment
   */

  const roundedNumericTypeCTA = (
    <div style={{ marginRight: '20px', display: 'flex', flexDirection: 'row', gap: '8px', cursor: 'pointer' }}>
      <Icon
        role={'button'}
        testId={'button-step-down'}
        onClick={(e) => {
          onStepDownNumericClick && onStepDownNumericClick(e);
        }}
        color={'var(--n500)'}
        fillColor={'var(--n100)'}
        hasCircle={true}
      >
        {IconNames.remove}
      </Icon>
      <Icon
        role={'button'}
        testId={'button-step-up'}
        onClick={(e) => {
          onStepUpNumericClick && onStepUpNumericClick(e);
        }}
        color={'var(--n500)'}
        fillColor={'var(--n100)'}
        hasCircle={true}
      >
        {IconNames.add}
      </Icon>
    </div>
  );

  const ShowAdornment = (what: React.ReactNode): React.ReactNode | null => {
    if (!what) return null;
    return what;
  };

  const ShowStartAdornment = (): React.ReactNode | null => {
    return ShowAdornment(adornment);
  };

  const ShowEndAdornment = (): React.ReactNode | null => {
    return ShowAdornment(endAdornment);
  };

  if (adornment) {
    textFieldProps.InputProps = {
      ...textFieldProps.InputProps,
      ...{ startAdornment: ShowStartAdornment() },
    };
  }

  if (endAdornment) {
    textFieldProps.InputProps = {
      ...textFieldProps.InputProps,
      ...{ endAdornment: ShowEndAdornment() },
    };
  }

  if (formFieldType == 'InputNumber' && roundedNumericCTAType) {
    textFieldProps.InputProps = {
      ...textFieldProps.InputProps,
      ...{ endAdornment: roundedNumericTypeCTA },
    };
  }

  /**
   * UI: Render Input Bottom Container (InfoText/ErrorMessage, Counter)
   * -------
   */
  const BottomContainer = () => {
    // Text Replacements
    const textReplacements = {
      field_name: label, // Case text contains field_name
      length: length ? length : '0', // Case text contains current input length
      ...(fieldConfig?.validation as any), //Add the keys from the validation to make sure we have them in input
      ...fieldConfig?.validation?.replacements, // Error Messages translation variables
      ...replacements, // Info Text translation variables
    };

    // Info Text
    let helperText: string | ReactNode = '';
    if (hasError) {
      helperText = (
        <Text
          className={'vanguard-input-error-text'}
          testId="vanguard-input-error-text"
          fontWeight={FontWeights.regular}
          color={'--e500'}
          replacements={textReplacements}
          aria-live="polite"
          aria-atomic="true"
        >
          {fieldConfig?.errors ? fieldConfig?.errors[0] : null}
        </Text>
      );
    } else if (infoText) {
      helperText = (
        <Text className={'vanguard-input-info-text'} fontWeight={FontWeights.regular} replacements={textReplacements}>
          {infoText}
        </Text>
      );
    }

    // Counter
    let counterComponent;
    if (counter) {
      counterComponent = (
        <Text
          className={'vanguard-input-counter'}
          fontWeight={FontWeights.regular}
          color={hasError ? '--e500' : ''}
          translate={false}
        >
          {length ? length : '0'}
          {maxLength && `/${maxLength}`}
        </Text>
      );
    }

    // HelperLink
    let helperLinkComponent;
    if (helperLinkText && onHelperLinkClick) {
      helperLinkComponent = (
        <Link
          onClick={() => {
            onHelperLinkClick(value ?? '');
          }}
          className="vanguard-input-helper-link-button"
          disabled={helperLinkDisabled}
          href={helperLinkHref}
        >
          {helperLinkText}
        </Link>
      );
    }

    // No bottom container
    if (!helperText && !counterComponent && !helperLinkComponent) {
      return null;
    }

    return (
      <span className="vanguard-input-bottom-container">
        <Render if={!!helperText || !!counterComponent}>
          <span className="vanguard-input-bottom-container-line">
            {helperText}
            {counterComponent}
          </span>
        </Render>

        {helperLinkComponent}
      </span>
    );
  };

  /**
   * UI: Highlights
   * -------
   */
  // useBackdrop and backDropRef are declared early (before resizeBackdrop useCallback above).
  const [backdrop, setBackdrop] = useState<{ __html: string }>({ __html: '' });
  const updateBackdrop = (content: string) => {
    if (!useBackdrop) {
      setBackdrop({ __html: '' });
    }

    if (highlightLengthExceeded && maxLength) {
      if (content?.length > maxLength) {
        content = highlightedTextMaxLength(content, maxLength, 'vanguard-input-mark-red');
      }
    }

    if (highlightWords && highlightWords.length) {
      highlightWords.forEach((word) => {
        content = content?.replace(word, `<span class="vanguard-input-mark-green">${word}</span>`);
        if (content?.includes(word) && onHighlightWordFound) {
          onHighlightWordFound(word, fieldConfig);
        }
      });
    }

    if (prohibitedWords && prohibitedWords.length) {
      prohibitedWords.forEach((word) => {
        content = content?.replace(word, `<span class="vanguard-input-mark-red">${word}</span>`);
        if (content?.includes(word) && onProhibitedWordFound) {
          onProhibitedWordFound(word, fieldConfig);
        }
      });
    }

    if (highlightUrl) {
      if (content && content.search(REGEX.url) >= 0) {
        let highlightClass = '';
        switch (highlightUrlType) {
          case 'negative':
            highlightClass = 'vanguard-input-mark-red';
            break;
          case 'positive':
            highlightClass = 'vanguard-input-mark-green';
            break;
          case 'info':
            highlightClass = 'vanguard-input-mark-blue';
            break;
        }
        content = content.replace(REGEX.url, `<span class="${highlightClass}">$&</span>`);
      }
    }

    const sanitizedContent = sanitizeHtml(content, {
      allowedAttributes: { span: ['class'] },
      allowedClasses: ['vanguard-input-mark-red', 'vanguard-input-mark-green', 'vanguard-input-mark-blue'],
    });
    setBackdrop({ __html: sanitizedContent });
  };

  /**
   * UI: Placeholder
   */
  const getPlaceholder = (): string | undefined => {
    if (placeholder) {
      return translationService.get(placeholder, replacements).value;
    }
    return undefined;
  };

  /**
   * UI: Apply Popover
   */
  const applyPopover = (children: React.ReactElement) => {
    if (popoverMessage) {
      return (
        <Popover position={popoverPosition} message={popoverMessage} wrapChildren={false}>
          {children}
        </Popover>
      );
    }
    return children;
  };

  /**
   * Input Type: Textarea
   * -------
   */
  const getTextareaProps = () => {
    if (!multiline) return null;

    return {
      multiline,
      rows,
      minRows,
      maxRows,
    };
  };

  /**
   * Input Type: Select
   * -------
   */
  const getSelectProps = () => {
    if (!select) return null;

    return {
      select,
      SelectProps: {
        renderValue: selectRenderValue,
        MenuProps: {
          PaperProps: {
            style: {
              maxHeight: menuItemHeight * maxMenuItemsUntilScroll,
            },
          },
        },
      },
    };
  };

  /**
   * Events
   * -------
   */
  const onFocusFn = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement, Element>) => {
    onFocus && onFocus(e);
  };
  const onBlurFn = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement, Element>) => {
    onBlur && onBlur(e);
  };

  const onKeyUpFn = (e: React.KeyboardEvent<HTMLDivElement>) => {
    onKeyUp && onKeyUp(e);
  };
  const onKeyDownFn = (e: React.KeyboardEvent<HTMLDivElement>) => {
    onKeyDown && onKeyDown(e);
    if (e.code === 'Enter' && !allowBreakLines) {
      e.preventDefault();
    }

    preventInput(e, fieldConfig, value as any);
  };

  const onInputFn = (e: React.FormEvent<HTMLDivElement>) => {
    onInput && onInput(e);
  };
  const onClickFn = (e: React.MouseEvent) => {
    onClick && onClick(e);
  };

  const onChangeFn = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    let valueInChangeFn: any = e.currentTarget?.value ?? '';

    onChange && onChange(e);

    if (formFieldType == 'Textarea' && !allowBreakLines) {
      valueInChangeFn = e.currentTarget.value.replace(/(\r\n|\n|\r)/gm, ' ');
    }

    if (formFieldType === 'Select') {
      valueInChangeFn = e.currentTarget?.value || e.target?.value;
      if (fieldConfig?._inputRef?.current) {
        fieldConfig._inputRef.current.value = e.target?.value ?? '';
      }
    }

    fieldConfig?.setInputValue?.(valueInChangeFn);

    if (fieldConfig) {
      debounce(() => {
        doValidate(fieldConfig);
      }, 100);
    }

    if (valueInChangeFn && typeof valueInChangeFn === 'string') {
      setLength(valueInChangeFn.length);
    } else {
      setLength(0);
    }
    //setInnerValue(valueInChangeFn);

    // Resize backdrops size according to textarea component itself, and it's content
    if (useBackdrop && backDropRef && backDropRef.current && inputRef && inputRef.current) {
      backDropRef.current.style.height = `${inputRef.current.getBoundingClientRect().height.toString()}px`;
      backDropRef.current.style.width = `${inputRef.current.getBoundingClientRect().width.toString()}px`;
      if (allowBreakLines) {
        updateBackdrop(e.currentTarget.value);
      } else {
        // remove breaklines if text was pasted
        updateBackdrop(e.currentTarget.value.replace(/(\r\n|\n|\r)/gm, ' '));
      }
    }
  };

  const onPasteFn = () => {
    setTimeout(() => {
      // Resize backdrops size according to textarea component itself, and it's content
      resizeBackdrop();
    }, 0);
  };

  const onScrollFn = () => {
    // Backdrop scroll has to be same as inputRef's for correct highlights
    resizeBackdrop();
  };

  /**
   * -------------------------------------------------------------------------------------------------------------------
   * Return View
   * -------------------------------------------------------------------------------------------------------------------
   */

  // Note: cache should not be re-used by repeated calls to JSON.stringify.
  return applyPopover(
    <div
      className={classNames(
        'vanguard-input',
        className,
        getLabelTypeClasses(),
        theme === 'grey' ? 'vanguard-input-grey' : '',
        isLoading ? 'vanguard-input-loading' : '',
        roundedNumericCTAType ? 'vanguard-input-type-number-rounded' : '',
        formFieldType === 'ColorPicker' ? 'vanguard-input-type-colorpicker' : '',
      )}
      onClick={(e) => onClickFn(e)}
    >
      <div className={'vanguard-input-backdrop'} ref={backDropRef}>
        <div className={'vanguard-input-highlights'} dangerouslySetInnerHTML={backdrop} />
      </div>

      <Render if={isLoading && formFieldType == 'Textarea'}>
        <div className={'vanguard-input-skeleton'} ref={backDropRef}>
          {[...Array(Math.min(minRows, maxRows))].map((e, i) => (
            <Skeleton key={i} height={16} width={'100%'} />
          ))}
          <Skeleton height={16} width={'80%'} />
        </div>
      </Render>

      <Render
        if={
          isLoading &&
          (formFieldType == 'Input' ||
            formFieldType == 'InputBase' ||
            formFieldType == 'InputNumber' ||
            formFieldType == 'Autocomplete')
        }
      >
        <div className={'vanguard-input-skeleton'} ref={backDropRef}>
          <Skeleton height={42} width={'100%'} />
        </div>
      </Render>

      <TextField
        autoFocus={autoFocus}
        variant={'outlined'}
        id={id}
        data-testid={testId}
        fullWidth={true}
        label={getLabel()}
        InputLabelProps={getLabelProps() ?? undefined}
        type={type}
        value={valueAsDefaultValue ? undefined : value}
        defaultValue={valueAsDefaultValue ? value : defaultValue}
        placeholder={getPlaceholder()}
        helperText={<BottomContainer />}
        error={hasError}
        required={required}
        disabled={disabled}
        role={'textbox'}
        {...getTextareaProps()}
        {...getSelectProps()}
        onFocus={(e) => onFocusFn(e)}
        onBlur={(e) => onBlurFn(e)}
        onKeyUp={(e) => onKeyUpFn(e)}
        onKeyDown={(e) => onKeyDownFn(e)}
        onInput={(e) => onInputFn(e)}
        onChange={(e) => onChangeFn(e)}
        onPaste={() => onPasteFn()}
        inputRef={inputRef}
        {...textFieldProps}
        inputProps={{
          ...(textFieldProps.inputProps ?? {}),
          onScroll: () => {
            onScrollFn();
          },
        }}
      >
        {children}
      </TextField>
    </div>,
  );
};
