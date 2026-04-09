import { StoryObj } from '@storybook/react';
import { Form } from '@vanguard/Form/Form';
import { fn } from 'storybook/test';
import { CountryCode } from 'libphonenumber-js';

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
export const createMockNotesChange = () => fn();
export const createMockSelectChange = () => fn();
export const createMockTermsAcceptedChange = () => fn();
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
  notes: {
    initial: 'Existing notes loaded from the store',
    updated: 'Notes updated from the UI and stored back',
  },
  selectedCms: {
    initial: 'WordPress',
    updated: 'Drupal',
  },
  termsAccepted: {
    initial: false,
    updated: true,
  },
  phoneNumber: {
    initial: '9876543210',
    updated: '9123456789',
  },
} as const;

export const loadedInputValues = {
  colorValue: '#11aa66',
  inputEmailValue: 'api-loaded@example.com',
  inputNumberValue: 314,
  inputPasswordValue: 'apiPassword890',
  inputTextValue: 'Loaded from API',
  notesValue: 'API hydrated notes value',
  phoneNumberValue: '9988776655',
  selectedCmsValue: 'Wix',
  termsAcceptedValue: true,
} as const;

export const showcaseCmsOptions = [
  { key: 0, value: 'WordPress', title: 'WordPress' },
  { key: 1, value: 'Drupal', title: 'Drupal' },
  { key: 2, value: 'Wix', title: 'Wix' },
] as const;

export const showcasePhoneCountryCode = 'IN' as CountryCode;

// Common selectors
export const selectors = {
  formContainer: '[data-testid="form-showcase"]',
  colorInput: '[data-testid="color-picker-showcase-text"] input',
  inputText: '[data-testid="input-text-showcase"]',
  inputNumber: '[data-testid="input-number-showcase"]',
  inputEmail: '[data-testid="input-email-showcase"]',
  datePicker: '[data-testid="datepicker-showcase"]',
  inputPassword: '[data-testid="input-password-showcase"]',
  notes: '[data-testid="textarea-showcase"] textarea',
  checkbox: '[data-testid="checkbox-showcase"] input[type="checkbox"]',
  phoneNumber: '[data-testid="phone-number-showcase"] input',
  select: '[data-testid="cms-select-showcase"] [role="combobox"]',
  debugSection: '.debug-section',
  textarea: '[data-testid="test-id"]',
  textField: '[data-testid="base-text-field"]',
} as const;
