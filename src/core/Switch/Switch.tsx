import './Switch.scss';

import { alignItemsCenter, dFlex, justifyContentCenter } from '@globalStyles';
import { classNames } from '@helpers/classNames';
import { LoadingBoolean } from '@models/common/LoadingBoolean';
import { ComponentContainer } from '@vanguard/ComponentContainer/ComponentContainer';
import React, { ChangeEventHandler } from 'react';

import { FontWeights, Text, TextReplacements, TextTypes } from '../Text/Text';

/**
 * Props @todo Implement formConfig
 * ---------------------------------------------------------------------------------------------------------------------
 */
export interface SwitchProps {
  /** Accepts a loading boolean for simplicity but only reacts to the true value of boolean , loading is considered false*/
  value: LoadingBoolean;
  readOnly?: boolean;

  children?: string | React.ReactNode; // Label text
  childrenWidth?: string;
  labelPos?: 'left' | 'right';
  labelColor?: string;
  labelClassName?: string;
  labelReplacements?: TextReplacements;
  labelType?: TextTypes;
  labelFontWeight?: FontWeights;
  disabled?: boolean;
  loading?: boolean;

  size?: 'small' | 'big';
  className?: string;

  onChange?: ChangeEventHandler<HTMLInputElement>;
  testId?: string;
}

/**
 * Component
 * ---------------------------------------------------------------------------------------------------------------------
 */
export const Switch = (props: SwitchProps) => {
  const {
    value,
    onChange,
    size = 'small',
    children,
    labelPos = 'right',
    labelColor,
    labelClassName,
    labelReplacements,
    testId,
    labelType,
    labelFontWeight,
    readOnly,
    disabled = false,
    loading = false,
    className = '',
  } = props;

  return (
    <ComponentContainer className={'vanguard-switch'} testId={testId}>
      <label
        style={{ color: labelColor }}
        className={classNames(
          'vanguard-switch-label',
          className,
          disabled ? 'vanguard-switch-label-disabled' : '',
          readOnly ? 'vanguard-switch-label-readonly' : '',
        )}
      >
        {labelPos === 'left' ? (
          typeof children === 'string' ? (
            <Text
              color={disabled ? '--button-primary-disabled-background-color' : labelColor}
              className={classNames('vanguard-switch-label-left', labelClassName)}
            >
              {children}
            </Text>
          ) : (
            children
          )
        ) : null}

        {!loading ? (
          <input
            onClick={(e) => {
              if (readOnly) {
                e.preventDefault();
              }
            }}
            className={`vanguard-switch-input vanguard-switch-${size}`}
            type="checkbox"
            onChange={(e) => {
              if (readOnly) {
                return;
              }
              onChange && onChange(e);
            }}
            checked={value === true}
            disabled={disabled}
          />
        ) : (
          <div className={classNames(`vanguard-switch-${size}`, dFlex, justifyContentCenter, alignItemsCenter)}>
            <div className={'loader-spinner'} />
          </div>
        )}

        {labelPos === 'right' ? (
          typeof children === 'string' ? (
            <Text
              disabled={readOnly}
              replacements={labelReplacements}
              type={labelType}
              fontWeight={labelFontWeight}
              color={disabled ? '--button-primary-disabled-background-color' : labelColor}
              className={classNames('vanguard-switch-label-right', labelClassName)}
            >
              {children}
            </Text>
          ) : (
            children
          )
        ) : null}
      </label>
    </ComponentContainer>
  );
};
