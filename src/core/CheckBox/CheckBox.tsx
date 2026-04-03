import './CheckBox.scss';

import { useAppDispatch } from '@custom-hooks/use-app-dispatch';
import { useHover } from '@custom-hooks/use-hover';
import { FormConfigElement } from '@custom-hooks/useFormConfig';
import { classNames } from '@helpers/classNames';
import { parseCssVariable } from '@helpers/css-variables-parser';
import { CheckBoxIcon } from '@vanguard/CheckBox/CheckBoxIcon/CheckBoxIcon';
import { ComponentContainer } from '@vanguard/ComponentContainer/ComponentContainer';
import React, { ChangeEvent, MutableRefObject, ReactNode, useEffect, useRef, useState } from 'react';

import { Text, TextReplacements } from '../Text/Text';

/**
 * Props
 * ---------------------------------------------------------------------------------------------------------------------
 */
export interface CheckBoxProps {
  label?: string | ReactNode;

  checked?: boolean;
  hovered?: boolean;
  disabled?: boolean; // @todo implement Disabled state
  intermediate?: boolean; //if true, then icon is a '-' sign

  className?: string;
  labelClassName?: string;
  backgroundColor?: string;
  inputRef?: MutableRefObject<HTMLInputElement | null>;
  formconfig?: FormConfigElement;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  testId?: string;
  /**
   * @internal
   * @remarks
   * @private
   * Only used by AvatarCheckbox
   * DO not used outside
   */
  _size?: 'small' | 'large';
  /**
   * @internal
   * @remarks
   * @private
   * Only used by AvatarCheckbox
   * DO not used outside
   */
  _hoverMode?: 'border' | 'check';
  translate?: boolean;
  replacements?: TextReplacements;
  labelWordBreak?: 'initial' | 'break-all' | 'break-word';
}

/**
 * Component
 * ---------------------------------------------------------------------------------------------------------------------
 */
export const CheckBox = (props: CheckBoxProps) => {
  const {
    formconfig,
    label,
    checked = false,
    hovered,
    intermediate = false,
    onChange,
    className,
    inputRef,
    labelClassName,
    labelWordBreak,
    disabled,
    testId,
    translate,
    replacements,
    _size = 'large',
    _hoverMode = 'border',
  } = props;

  let { backgroundColor } = props;

  const dispatch = useAppDispatch();
  const ref = useRef(null);
  const [isChecked, setIsChecked] = useState<boolean>(checked);
  const [isHovered, setIsHovered] = useState<boolean | undefined>(hovered);
  const checkIsHovered = useHover(ref);

  useEffect(() => {
    const isHovered = hovered !== undefined && hovered;
    setIsHovered(isHovered ? isHovered : checkIsHovered);
  }, [checkIsHovered, hovered]);
  const size = _size;
  const hoverMode = _hoverMode ?? 'border';
  if (backgroundColor) {
    backgroundColor = parseCssVariable(backgroundColor);
  }
  /**
   * FormConfig
   */
  const [checkboxRef, setCheckboxRef] = useState(formconfig?._inputRef ?? inputRef ?? useRef(null));

  useEffect(() => {
    if (formconfig?._inputRef) {
      formconfig.fieldType = 'Checkbox';
      setCheckboxRef(formconfig?._inputRef);
    }
  }, []);

  useEffect(() => {
    if (formconfig?.stateValue !== undefined && formconfig.stateValue !== null) {
      setIsChecked(formconfig?.stateValue);
    }
  }, [formconfig?.stateValue]);

  useEffect(() => {
    setIsChecked(checked);
  }, [checked]);

  /**
   * UI: Get Label
   */
  const getLabel = (label: string | ReactNode, isChecked: boolean) => {
    if (typeof label === 'string') {
      let color = '--n600';
      if (isChecked) {
        color = '--n900';
      }
      if (disabled) {
        color = '--n500';
      }
      return (
        <Text
          className={labelClassName}
          color={color}
          translate={translate}
          replacements={replacements}
          wordBreak={labelWordBreak}
        >
          {label}
        </Text>
      );
    }
    return <span className={labelClassName}>{label}</span>;
  };

  /**
   * Function: On Click (listens both for checkbox and label)
   */
  const onClick = () => {
    if (checkboxRef && checkboxRef.current) {
      checkboxRef.current.click(); //simulate click on the Input tag
    }
  };

  /**
   * Function: Toggle Checkbox
   */
  const toggleCheckbox = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextChecked = e.currentTarget.checked;

    setIsChecked(nextChecked);

    if (checkboxRef?.current) {
      checkboxRef.current.checked = nextChecked;
    }

    // Dispatch value to formConfig
    if (formconfig?.setStateValue) {
      dispatch(formconfig.setStateValue(nextChecked));
    }

    formconfig?._onChange?.(e);

    // Callback
    onChange && onChange(e);
  };

  /**
   * Return view
   * ---
   */
  return (
    <ComponentContainer
      innerRef={ref}
      className={classNames(
        'vanguard-checkbox-container',
        isChecked ? 'vanguard-checkbox-checked' : '',
        disabled ? 'vanguard-checkbox-disabled' : '',
        hoverMode === 'check' ? 'hover-mode-check' : '',
        className,
      )}
      onClick={onClick}
      testId={testId}
    >
      <div
        style={{
          backgroundColor: backgroundColor,
          borderRadius: '6px',
        }}
        className={classNames('vanguard-checkbox-input-content')}
      >
        <input
          ref={checkboxRef}
          type="checkbox"
          checked={isChecked}
          disabled={disabled}
          className={classNames(
            'vanguard-checkbox-input',

            size === 'large' ? 'cb-size-large' : 'cb-size-small',
          )}
          onChange={(e) => {
            if (disabled) {
              return;
            }

            toggleCheckbox(e);
          }}
        />
        <div
          className={classNames(
            'vanguard-checkbox',

            size === 'large' ? 'cb-size-large' : 'cb-size-small',
          )}
        >
          <CheckBoxIcon
            isChecked={isChecked}
            intermediate={intermediate}
            size={size}
            isHovered={isHovered}
            hoverMode={hoverMode}
          />
        </div>
      </div>
      {label && <div className={'vanguard-checkbox-label'}>{getLabel(label, isChecked)}</div>}
    </ComponentContainer>
  );
};
