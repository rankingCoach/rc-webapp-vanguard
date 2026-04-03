import { StoryObj } from '@storybook/react';
import { Form } from '@vanguard/Form/Form';
import { fn } from 'storybook/test';

export type Story = StoryObj<typeof Form>;

// Mock functions for testing
export const createMockFormChange = () => fn();
export const createMockTextareaChange = () => fn();
export const createMockTestFieldChange = () => fn();
export const createMockColorPickerChange = () => fn();
export const createMockInputTextChange = () => fn();
export const createMockInputNumberChange = () => fn();
export const createMockInputEmailChange = () => fn();
export const createMockDatePickerChange = () => fn();
export const createMockInputPasswordChange = () => fn();
export const createMockCheckBoxChange = () => fn();
export const createMockTextareaInputChange = () => fn();
export const createMockPhoneNumberChange = () => fn();

// Test utilities
export const waitForFormUpdate = (ms: number = 100) => new Promise((resolve) => setTimeout(resolve, ms));

// Test data constants
export const testColors = {
  blue: '#3366cc',
  red: '#ff0000',
  green: '#00ff00',
} as const;

export const testInputValues = {
  text: {
    initial: 'Sample text input',
    updated: 'Updated text value',
    empty: '',
  },
  number: {
    initial: 42,
    updated: 100,
    empty: 0,
  },
  email: {
    initial: 'user@example.com',
    updated: 'test@domain.com',
    invalid: 'invalid-email',
  },
  datePicker: {
    initial: 1705276800, // Unix timestamp for 2024-01-15
    updated: 1735084800, // Unix timestamp for 2024-12-25
    empty: null,
  },
  password: {
    initial: 'secretPassword123',
    updated: 'newPassword456',
    empty: '',
  },
} as const;

// Common selectors
export const selectors = {
  formContainer: '[data-testid="form-showcase"]',
  colorInput: 'input[type="text"]',
  inputText: '[data-testid="input-text-showcase"]',
  inputNumber: '[data-testid="input-number-showcase"]',
  inputEmail: '[data-testid="input-email-showcase"]',
  datePicker: '[data-testid="datepicker-showcase"]',
  inputPassword: '[data-testid="input-password-showcase"]',
  debugSection: '.debug-section',
  textarea: '[data-testid="test-id"]',
  textField: '[data-testid="base-text-field"]',
  phoneNumber: '[data-testid="phone-number-input"]',
  checkbox: '[data-testid="form-checkbox"]',
} as const;
