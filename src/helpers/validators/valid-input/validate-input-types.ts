import { TextReplacements } from '@vanguard/Text/Text';
import { CountryCode } from 'libphonenumber-js';

import { CustomErrorsKeys } from './validate-input-errors';

export type FormConfigWithMessage<T> = { value: T; customErrorMessage: CustomErrorsKeys } | T;

export type FormConfigValidation = { replacements?: TextReplacements } & FormConfigBaseValidation &
  (
    | FormConfigTextValidation
    | FormConfigHexValidation
    | FormConfigNumberValidation
    | FormConfigAutocompleteValidation
    | FormConfigSpecificValidation
  );

/** --------------------------------------------------------------------------------------------------------------------
 *
 * Base
 */
export type FormConfigBaseValidation = {
  required?: boolean;
  /**
   * Overrides the default `validation_required` message shown when a required field is empty.
   * Accepts a translation key or a plain string; the value is rendered through `<Text>` like every other error.
   */
  requiredErrorMessage?: CustomErrorsKeys | string;
};

/**
 * Text
 */
export type FormConfigTextValidation = {
  minLength?: number;
  maxLength?: number;
  regex?: RegExp;
  urlNotAllowed?: boolean;
  urlFormat?: boolean;
  pathFormat?: boolean;
  specialCharsNotAllowed?: boolean;
  multipleSpacesNotAllowed?: boolean;
  exclamationMarksNotAllowed?: boolean;
  fullStopMarkNotAllowed?: boolean;
  textAfterCommaOrPeriodNotAllowed?: boolean;
  onlySpacesNotAllowed?: boolean;
  fullCapitalizationNotAllowed?: boolean;
  excessiveCapitalisationNotAllowed?: boolean;
  pathNotAllowed?: boolean;
  domain?: string;
  rootDomain?: FormConfigWithMessage<string>;
  notIn?: FormConfigWithMessage<string[]>;
  isPassword?: boolean;
};

export type FormConfigHexValidation = FormConfigTextValidation & {
  validateHexColor?: boolean;
};

/**
 * Number
 */
export type FormConfigNumberValidation = {
  gt?: number;
  gte?: number;
  lt?: number;
  lte?: number;
  isValid?: boolean;
  notIn?: FormConfigWithMessage<number[]>;
};

/**
 * Autocomplete (multiple select)
 */
export type FormConfigAutocompleteValidation = {
  minCount?: number;
  maxCount?: number;
};

/**
 * Specific type of value: Phone / Email / HEX Color
 */
export type FormConfigSpecificValidation = {
  validatePhone?: boolean;
  validatePhoneNumberForCountry?: CountryCode;
  validateEmail?: boolean;
  validateHexColor?: boolean;
};
