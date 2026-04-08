import { FormConfigElement, useFormConfig } from '@custom-hooks/useFormConfig';
import { debounce } from '@helpers/debounce';
import { isValidHexColor, normalizeHexColor } from '@helpers/validators/hex-color/hex-color';
import { InputEventsProps } from '@vanguard/_internal/InputBase/InputBase';
import { InputBase } from '@vanguard/_internal/InputBase/InputBase.tsx';
import { Form, useFormConfigContext } from '@vanguard/Form/Form.tsx';
import { useFieldConfigContext } from '@vanguard/Form/FormConfigContext';
import { Label } from '@vanguard/Label/Label';
import { TextReplacements } from '@vanguard/Text/Text';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import styles from './ColorPicker.module.scss';
import { FormConfigHexValidation } from '@helpers/validators/valid-input/validate-input-types';

const DEBOUNCE_VALUE_DEFAULT = 50;
export interface ColorPickerProps {
  /**
   * @deprecated Use `color` prop instead. This prop will be removed in a future version.
   */
  initialColor?: string;
  /**
   * The current color value. This prop reacts to external changes and updates the component accordingly.
   */
  color?: string;
  label: string;
  replacements?: TextReplacements;
  onColorChange?: (color: string) => void;
  formconfig?: FormConfigElement;
  onChange?: InputEventsProps['onChange'];
  /**
   * Controls max-width of the ColorPicker container. Accepts CSS length or percentage, e.g. "300px" or "50%".
   */
  maxWidth?: string;
  /**
   * Test ID for testing purposes.
   */
  testId?: string;
}

export const ColorPicker: React.FC<ColorPickerProps> = (props) => {
  const contextFieldConfig = useFieldConfigContext();
  const resolvedFormConfig = (props.formconfig ?? contextFieldConfig) ?? null;
  const {
    label,
    replacements,
    onColorChange,
    initialColor,
    color: externalColor,
    formconfig: _formconfig,
    maxWidth,
    testId,
  } = props;
  // Use color prop if provided, fallback to initialColor for backward compatibility
  const effectiveColor = externalColor ?? initialColor ?? '';

  const [color, setColor] = useState(effectiveColor);
  const [textInputValue, setTextInputValue] = useState(effectiveColor);
  const lastValidColorRef = useRef(effectiveColor);
  const isControlledByForm = !!resolvedFormConfig;

  // Check if we're inside a Form context
  const context = useFormConfigContext();
  const contextFormConfig = context?.formConfig;

  // React to external color changes
  useEffect(() => {
    if (externalColor !== undefined) {
      setColor(externalColor);
      setTextInputValue(externalColor);
      if (isValidHexColor(externalColor)) {
        lastValidColorRef.current = externalColor;
      }
    }
  }, [externalColor]);

  // Create internal formConfig if none is provided and we're not in a Form context
  const { formConfig: internalFormConfig } = useFormConfig({
    inputs: {
      hexColor: {
        fieldType: 'ColorPicker',
        validation: {
          validateHexColor: true,
        },
      },
    },
  });

  // Use provided formconfig or internal one
  const activeFormConfig = resolvedFormConfig || internalFormConfig.hexColor;

  if (activeFormConfig?.validation) {
    (activeFormConfig.validation as FormConfigHexValidation).validateHexColor = true;
  }

  useEffect(() => {
    const runtimeInputValue = resolvedFormConfig?.getInputValue?.();
    const runtimeStateValue = resolvedFormConfig?.stateValue;

    if (typeof runtimeStateValue === 'string' && isValidHexColor(runtimeStateValue)) {
      setColor(normalizeHexColor(runtimeStateValue));
      lastValidColorRef.current = normalizeHexColor(runtimeStateValue);
    }

    if (typeof runtimeInputValue === 'string') {
      setTextInputValue(runtimeInputValue);
      return;
    }

    if (typeof runtimeStateValue === 'string') {
      setTextInputValue(runtimeStateValue);
    }
  }, [resolvedFormConfig?.getInputValue?.(), resolvedFormConfig?.stateValue]);

  // Memoize the normalized color for the color picker input
  const normalizedColorForPicker = useMemo(() => {
    return color && isValidHexColor(color) ? normalizeHexColor(color) : '#000000';
  }, [color]);

  const debouncedColorChange = useCallback(
    debounce((color: string) => {
      onColorChange && onColorChange(color);
    }, DEBOUNCE_VALUE_DEFAULT),
    [onColorChange],
  );

  const commitValidColor = (nextColor: string) => {
    const normalizedColor = normalizeHexColor(nextColor);

    if (resolvedFormConfig?.setStateValue) {
      resolvedFormConfig.setStateValue(normalizedColor);
    }

    resolvedFormConfig?.setInputValue?.(normalizedColor);
    if (resolvedFormConfig?.__runtimeValueRef) {
      resolvedFormConfig.__runtimeValueRef.current = undefined;
    }
    resolvedFormConfig?.setIsDirty?.(normalizedColor !== resolvedFormConfig.getInitialValue?.());
  };

  const syncDraftInputValue = (nextValue: string) => {
    resolvedFormConfig?.setInputValue?.(nextValue);
    if (resolvedFormConfig?.__runtimeValueRef) {
      resolvedFormConfig.__runtimeValueRef.current = nextValue;
    }
  };

  const handleColorChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = normalizeHexColor(event.target.value);
    setColor(newColor);
    setTextInputValue(newColor);
    lastValidColorRef.current = newColor;
    commitValidColor(newColor);
    debouncedColorChange(newColor);
    props.onChange?.(event);
  };

  const handleTextInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const inputValue = event.target.value;

    setTextInputValue(inputValue);

    if (!resolvedFormConfig || !resolvedFormConfig.validation?.validateHexColor) {
      if (isValidHexColor(inputValue)) {
        const normalizedColor = normalizeHexColor(inputValue);
        setColor(normalizedColor);
        lastValidColorRef.current = normalizedColor;
        commitValidColor(normalizedColor);
        debouncedColorChange(normalizedColor);
      } else {
        syncDraftInputValue(inputValue);
      }

      props.onChange?.(event);
      return;
    }

    if (inputValue === '') {
      syncDraftInputValue(inputValue);
      props.onChange?.(event);
      return;
    }

    if (isValidHexColor(inputValue)) {
      const normalizedColor = normalizeHexColor(inputValue);
      setColor(normalizedColor);
      lastValidColorRef.current = normalizedColor;
      commitValidColor(normalizedColor);
      debouncedColorChange(normalizedColor);
      props.onChange?.(event);
      return;
    }

    syncDraftInputValue(inputValue);
    resolvedFormConfig?.setHasError?.(true);
    resolvedFormConfig?.setErrors?.([
      'HEX value is incorrect. If you have problems use the color picker next to this field.' as any,
    ]);
    props.onChange?.(event);
  };

  // If we're not in a Form context, wrap with Form
  return (
    <Form config={contextFormConfig ?? activeFormConfig}>
      <div
        className={styles.container}
        style={maxWidth ? ({ ['--colorPickerMaxWidth' as any]: maxWidth } as React.CSSProperties) : undefined}
      >
        <Label value={label} replacements={replacements} />
        <div className={styles.inputContainer}>
          <input
            type="color"
            value={normalizedColorForPicker}
            onChange={handleColorChange}
            className={styles.colorInput}
            data-testid={testId ? `${testId}-color` : undefined}
          />
          <InputBase
            formFieldType={'ColorPicker'}
            fieldConfig={activeFormConfig}
            value={textInputValue}
            onChange={handleTextInputChange}
            testId={testId ? `${testId}-text` : undefined}
          />
        </div>
      </div>
    </Form>
  );
};
