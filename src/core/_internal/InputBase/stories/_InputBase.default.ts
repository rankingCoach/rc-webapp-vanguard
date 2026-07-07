import { StoryObj } from '@storybook/react';
import { InputBase } from '@vanguard/_internal/InputBase/InputBase';
import { fn } from 'storybook/test';

export type Story = StoryObj<typeof InputBase>;

// Common mock functions
export const createMockOnChange = () => fn();
export const createMockOnClick = () => fn();
export const createMockOnInput = () => fn();
export const createMockOnStepUpNumericClick = () => fn();
export const createMockOnStepDownNumericClick = () => fn();
export const createMockOnHelperLinkClick = () => fn();

// Test utilities
export const waitForDebounce = (ms: number = 100) => new Promise((resolve) => setTimeout(resolve, ms));

// Test data constants
export const testValues = {
  sampleValue: 'Sample value',
  defaultValue: 'Default value',
  testValue: 'Test value',
  placeholder: 'Enter text here',
  sampleLabel: 'Sample Label',
  customClassName: 'custom-class-name',
  inputBaseId: 'input-base-id',
} as const;

export const testTypes = {
  text: 'text',
  number: 'number',
  password: 'password',
} as const;

export const testThemes = {
  grey: 'grey',
  default: 'default',
} as const;

// Common selectors
export const selectors = {
  textInput: 'input[type="text"]',
  numberInput: 'input[type="number"]',
  passwordInput: 'input[type="password"]',
  inputElement: 'input',
  labelElement: 'label',
  greyThemeContainer: '.vanguard-input-grey',
} as const;

// URL mask test data
export const urlMaskTestData = {
  testUrl: 'www.google.ro',
  testText: 'Test www.google.ro',
  placeholder: 'Test placeholder',
} as const;

// Color constants for URL highlighting
export const urlHighlightColors = {
  default: '--e100',
  positive: '--s100',
  info: '--i100',
} as const;
