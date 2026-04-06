/**
 * Shared Input Test Helpers
 *
 * This file provides common helper functions for testing input components in Storybook stories.
 * These helpers are shared between different validation test files to avoid code duplication.
 *
 * Key Features:
 * - Element selection utilities
 * - User interaction helpers
 * - Error assertion utilities
 * - Variable replacement in error messages
 * - Regex pattern matching for dynamic content
 *
 * Usage:
 * Import these helpers in your validation test files:
 * import { getTestElements, expectErrorToContain, inputAndBlur } from '../shared/test-helpers';
 */

import { useFormConfig } from '@custom-hooks/useFormConfig';
import type { BoundFunctions, queries } from '@testing-library/react';
import { Form } from '@vanguard/Form/Form.tsx';
import { Input } from '@vanguard/Input/Input';
import React from 'react';
import { expect, userEvent, within } from 'storybook/test';

// Element selection helpers
export const getTestElements = async (
  canvasElement: HTMLElement,
  inputType?: string,
  testId: string = 'validation-input',
): Promise<{ canvas: BoundFunctions<typeof queries>; input: HTMLInputElement }> => {
  const canvas = within(canvasElement);
  const inputWrapper = await canvas.findByTestId(testId);

  let input: HTMLInputElement;
  if (inputType === 'password') {
    input = inputWrapper.querySelector('input[type="password"]') as HTMLInputElement;
    if (!input) {
      throw new Error('Password input not found');
    }
  } else if (inputType === 'number') {
    input = inputWrapper.querySelector('input[type="number"]') as HTMLInputElement;
    if (!input) {
      throw new Error('Number input not found');
    }
  } else {
    try {
      input = within(inputWrapper).getByRole('textbox') as HTMLInputElement;
    } catch (error) {
      input = inputWrapper.querySelector('input') as HTMLInputElement;
      if (!input) {
        throw new Error(`Input element not found for type: ${inputType || 'text'}`);
      }
    }
  }

  return { canvas, input };
};

export const getErrorDisplayAfterError = async (canvasElement: HTMLElement): Promise<HTMLElement> => {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const canvas = within(canvasElement);
  return await canvas.findByTestId('vanguard-input-error-text', {}, { timeout: 2000 });
};

// User interaction helpers
export const triggerValidation = async (input: HTMLElement) => {
  await userEvent.click(input);
  await userEvent.type(input, 'a');
  await userEvent.type(input, '{backspace}'); // Simulate a change to trigger validation
  await userEvent.tab();
};

export const triggerBlurValidation = async (input: HTMLElement) => {
  await userEvent.click(input);
  await userEvent.type(input, 'a');
  await userEvent.type(input, '{backspace}'); // Simulate a change to trigger validation
  await userEvent.tab(); // Just blur without typing to trigger validation
};

export const inputAndBlur = async (input: HTMLElement, value: string) => {
  await userEvent.click(input);
  await userEvent.type(input, value);
  await userEvent.tab(); // Blur to trigger validation
};

export const clearAndInputAndBlur = async (input: HTMLElement, value: string, delayAfterClear: number = 0) => {
  await userEvent.clear(input);
  // Optional delay to ensure clear operation is complete
  if (delayAfterClear > 0) {
    await new Promise((resolve) => setTimeout(resolve, delayAfterClear));
  }
  await userEvent.type(input, value);
  await userEvent.tab(); // Blur to trigger validation
};

// Variable replacement helper
const replaceVariablePatterns = (text: string, variables: Record<string, string | number> = {}) => {
  let pattern = text;

  // Replace variables with actual expected values first
  Object.entries(variables).forEach(([key, value]) => {
    const variablePattern = `%${key}%`;
    pattern = pattern.replace(new RegExp(variablePattern, 'g'), String(value));
  });

  // Replace any remaining variable patterns with regex patterns
  pattern = pattern
    .replace(/%field_name%/g, '.*?') // Match any field name
    .replace(/%gt%/g, '\\d+') // Match numbers for greater than
    .replace(/%lt%/g, '\\d+') // Match numbers for less than
    .replace(/%gte%/g, '\\d+') // Match numbers for greater than or equal
    .replace(/%lte%/g, '\\d+') // Match numbers for less than or equal
    .replace(/%domain%/g, '[\\w.-]+') // Match domain patterns
    .replace(/%regex%/g, '.*?') // Match any regex pattern
    .replace(/%notIn%/g, '.*?'); // Match any not-in array content

  // Escape special characters that might interfere with regex (like parentheses in "Number (≥ 10)")
  pattern = pattern.replace(/[()≥≤<>]/g, '\\$&');

  return pattern;
};

// Error assertion helpers
export const expectErrorToContain = async (
  canvas: BoundFunctions<typeof queries>,
  expectedText: string,
  variables: Record<string, string | number> = {},
): Promise<void> => {
  try {
    const errorDisplay = await canvas.findByTestId('vanguard-input-error-text', {}, { timeout: 2000 });
    const actualText = errorDisplay.textContent ?? '';

    if (expectedText.includes('%')) {
      const expectedPattern = replaceVariablePatterns(expectedText, variables);
      const regex = new RegExp(expectedPattern, 'i');
      await expect(actualText).toMatch(regex);
      return;
    }

    try {
      await expect(actualText).toContain(expectedText);
    } catch {
      try {
        const { translationService } = await import('@services/translation.service');
        const translated = translationService.get(expectedText, variables as any).value;
        await expect(actualText).toContain(translated);
      } catch (e) {
        throw new Error(
          `Expected error text to contain "${expectedText}" (or its translation), but got: "${actualText}".\nInner: ${
            (e as Error)?.message || e
          }`,
        );
      }
    }
  } catch {
    throw new Error('Error element with testId "vanguard-input-error-text" not found');
  }
};

export const expectErrorToNotExist = async (canvas: BoundFunctions<typeof queries>): Promise<void> => {
  // Wait for validation to complete and error to be removed
  let attempts = 0;
  const maxAttempts = 10;

  while (attempts < maxAttempts) {
    await new Promise((resolve) => setTimeout(resolve, 100));
    const errorDisplay = canvas.queryByTestId('vanguard-input-error-text');

    if (!errorDisplay) {
      // Error element is not present, validation passed
      return;
    }

    attempts++;
  }

  // Final check - if we get here, the error is still present
  const errorDisplay = canvas.queryByTestId('vanguard-input-error-text');
  await expect(errorDisplay).toBeNull();
};

// Helper component for validation testing
interface ValidationTestWrapperProps {
  validationConfig: any;
  inputType?: string;
  testId?: string;
  [key: string]: any;
}

export const ValidationTestWrapper = (props: ValidationTestWrapperProps) => {
  const { validationConfig, inputType = 'text', testId = 'validation-input', ...rest } = props;
  // Determine fieldType based on validation config. Number validations only run for fieldType = "InputNumber".
  const isNumberValidation = !!(
    validationConfig &&
    ('gt' in (validationConfig || {}) ||
      'gte' in (validationConfig || {}) ||
      'lt' in (validationConfig || {}) ||
      'lte' in (validationConfig || {}) ||
      'isValid' in (validationConfig || {}) ||
      'isValidNumber' in (validationConfig || {}) ||
      'notIn' in (validationConfig || {}))
  );

  // Map story prop isValidNumber to the actual validator flag name used by the library (isValid)
  const normalizedValidationConfig = { ...validationConfig } as any;
  if (normalizedValidationConfig && typeof normalizedValidationConfig === 'object') {
    if ('isValidNumber' in normalizedValidationConfig && !('isValid' in normalizedValidationConfig)) {
      normalizedValidationConfig.isValid = normalizedValidationConfig.isValidNumber;
    }
  }

  const { formConfig } = useFormConfig({
    inputs: {
      testField: {
        fieldType: isNumberValidation ? ('InputNumber' as const) : ('Input' as const),
        validation: normalizedValidationConfig,
      },
    },
  });

  return (
    <Form config={formConfig}>
      <Input testId={testId} type={inputType as any} formconfig={formConfig.testField} {...rest} />
    </Form>
  );
};
