import { REGEX } from '@config/regex.ts';
import { FormConfigElement } from '@custom-hooks/useFormConfig';
import { isValidHexColor } from '@helpers/validators/hex-color/hex-color';
import { translationService } from '@services/translation.service';
import { extractSetErrorsFromConfig } from '@vanguard/Form/FormElement/extract-set-errors-from-config';
import { isValidPhoneNumber } from 'libphonenumber-js';

import { CustomErrorsKeys, ErrorsKeys } from './validate-input-errors';
import {
  FormConfigAutocompleteValidation,
  FormConfigNumberValidation,
  FormConfigSpecificValidation,
  FormConfigTextValidation,
} from './validate-input-types';

const valueExists = (value: number | null | undefined): boolean => {
  return value !== undefined && value !== null;
};
/**
 * *********************************************************************************************************************
 * MAIN: Validate A Form Field
 * *********************************************************************************************************************
 */
export const validInput = (formConfig?: FormConfigElement | null, validateOnlyPositive = false): boolean => {
  if (!formConfig) return true;
  if (!formConfig.validation) return true;
  if (!formConfig.getValue) return true;
  if (!formConfig.setErrors) return true;
  const value = formConfig.getValue();

  const setErrorsByDev = extractSetErrorsFromConfig(formConfig) as ErrorsKeys;

  if (setErrorsByDev) {
    formConfig.errors = [];
    return setFieldValidity(formConfig, false, setErrorsByDev, validateOnlyPositive);
  }
  /**
   * Is Required
   * -------------------------------------------------------------------------------------------------------------------
   */
  if (formConfig.validation.required) {
    const isNotValid = !validateIsRequired(value);
    if (isNotValid) {
      return setFieldValidity(formConfig, false, ErrorsKeys.REQUIRED, validateOnlyPositive);
    }
  }

  /**
   * Number: SMALLER / BIGGER / EQUALS
   * -------------------------------------------------------------------------------------------------------------------
   */
  if (formConfig.fieldType === 'InputNumber') {
    // @todo Should we allow to other than "InputNumber" input types?

    const { gte, lte, lt, gt, isValid } = formConfig.validation as FormConfigNumberValidation;
    let { notIn } = formConfig.validation as FormConfigNumberValidation;

    if (isValid) {
      if (isNaN(parseInt(value))) {
        return setFieldValidity(formConfig, false, ErrorsKeys.NR_IS_VALID, validateOnlyPositive);
      }
    }

    if (valueExists(gte)) {
      if (!validateNumberSize(value, gte, 'gte')) {
        return setFieldValidity(formConfig, false, ErrorsKeys.NR_GTE, validateOnlyPositive);
      }
    }
    if (valueExists(lte)) {
      if (!validateNumberSize(value, lte, 'lte')) {
        return setFieldValidity(formConfig, false, ErrorsKeys.NR_LTE, validateOnlyPositive);
      }
    }
    if (valueExists(gt)) {
      if (!validateNumberSize(value, gt, 'gt')) {
        return setFieldValidity(formConfig, false, ErrorsKeys.NR_GT, validateOnlyPositive);
      }
    }
    if (valueExists(lt)) {
      if (!validateNumberSize(value, lt, 'lt')) {
        return setFieldValidity(formConfig, false, ErrorsKeys.NR_LT, validateOnlyPositive);
      }
    }

    if (notIn) {
      let errorMessage: ErrorsKeys | CustomErrorsKeys = ErrorsKeys.NOT_IN_ARRAY;

      if (!Array.isArray(notIn)) {
        errorMessage = notIn?.customErrorMessage;
        notIn = notIn?.value;
      }

      if (notIn.length && notIn.find((e) => e === value)) {
        return setFieldValidity(formConfig, false, ErrorsKeys.NOT_IN_ARRAY, validateOnlyPositive);
      }
    }
  }

  /**
   * TEXT: Minimum / Maximum / REGEX / URLs
   * -------------------------------------------------------------------------------------------------------------------
   */
  if (
    formConfig.fieldType === 'Input' ||
    formConfig.fieldType === 'Textarea' ||
    formConfig.fieldType === 'Autocomplete'
  ) {
    const {
      minLength,
      maxLength,
      regex,
      urlNotAllowed,
      urlFormat,
      specialCharsNotAllowed,
      multipleSpacesNotAllowed,
      pathFormat,
      fullCapitalizationNotAllowed,
      excessiveCapitalisationNotAllowed,
      pathNotAllowed,
      domain,
      rootDomain,
      isPassword,
      onlySpacesNotAllowed,
      exclamationMarksNotAllowed,
      fullStopMarkNotAllowed,
      textAfterCommaOrPeriodNotAllowed,
    } = formConfig.validation as FormConfigTextValidation;
    let { notIn } = formConfig.validation as FormConfigTextValidation;

    // MIN LENGTH

    if (minLength) {
      if (value && value.length < minLength) {
        return setFieldValidity(formConfig, false, ErrorsKeys.MIN_LEN, validateOnlyPositive);
      }
    }

    // MAX LENGTH

    if (maxLength) {
      if (value && value.length > maxLength) {
        return setFieldValidity(formConfig, false, ErrorsKeys.MAX_LEN, validateOnlyPositive);
      }
    }

    // MATCH REGEX

    if (value && regex) {
      if (!regex.test(value)) {
        return setFieldValidity(formConfig, false, ErrorsKeys.NO_REGEX_MATCH, validateOnlyPositive);
      }
    }

    // URL NOT ALLOWED

    if (value && urlNotAllowed) {
      if (value && value.search(REGEX.url) >= 0) {
        return setFieldValidity(formConfig, false, ErrorsKeys.URL_NOT_ALLOWED, validateOnlyPositive);
      }
    }

    if (value && urlFormat) {
      if (value.search(REGEX.url) === -1) {
        return setFieldValidity(formConfig, false, ErrorsKeys.URL_FORMAT, validateOnlyPositive);
      }
    }

    // PATH FORMAT

    if (value && pathFormat) {
      if (value && value.search(REGEX.invalidPathChars) >= 0) {
        return setFieldValidity(formConfig, false, ErrorsKeys.PATH_FORMAT, validateOnlyPositive);
      }
    }

    // SPECIAL CHARS NOT ALLOWED

    if (value && specialCharsNotAllowed) {
      if (value && value.search(REGEX.specialChars) >= 0) {
        return setFieldValidity(formConfig, false, ErrorsKeys.SPECIAL_CHARS_NOT_ALLOWED, validateOnlyPositive);
      }
    }

    if (value && multipleSpacesNotAllowed) {
      if (value && value.search(REGEX.multipleSpaces) >= 0) {
        return setFieldValidity(formConfig, false, ErrorsKeys.MULTIPLE_SPACES_NOT_ALLOWED, validateOnlyPositive);
      }
    }

    if (value && onlySpacesNotAllowed) {
      if (value && value.search(REGEX.onlySpaces) >= 0) {
        return setFieldValidity(formConfig, false, ErrorsKeys.ONLY_SPACES_NOT_ALLOWED, validateOnlyPositive);
      }
    }

    if (value && exclamationMarksNotAllowed) {
      if (value && value.search(REGEX.exclamationMark) >= 0) {
        return setFieldValidity(formConfig, false, ErrorsKeys.EXCLAMATION_MARKS_NOT_ALLOWED, validateOnlyPositive);
      }
    }

    if (value && fullStopMarkNotAllowed) {
      if (value && value.search(REGEX.fullStopMark) >= 0) {
        return setFieldValidity(formConfig, false, ErrorsKeys.FULL_STOP_MARKS_NOT_ALLOWED, validateOnlyPositive);
      }
    }

    if (value && textAfterCommaOrPeriodNotAllowed) {
      if (value && REGEX.textAfterCommaOrPeriod.test(value)) {
        return setFieldValidity(
          formConfig,
          false,
          ErrorsKeys.TEXT_AFTER_COMMA_OR_PERIOD_NOT_ALLOWED,
          validateOnlyPositive,
        );
      }
    }

    if (value && fullCapitalizationNotAllowed) {
      if (value && value.search(REGEX.fullCapitalization) >= 0) {
        return setFieldValidity(formConfig, false, ErrorsKeys.FULL_CAPITALIZATION_NOT_ALLOWED, validateOnlyPositive);
      }
    }

    if (value && excessiveCapitalisationNotAllowed) {
      if (value && value.search(REGEX.excessiveCapitalisation) >= 0) {
        return setFieldValidity(
          formConfig,
          false,
          ErrorsKeys.EXCESSIVE_CAPITALIZATION_NOT_ALLOWED,
          validateOnlyPositive,
        );
      }
    }

    if (value && pathNotAllowed) {
      if (value && value.search(REGEX.path) >= 0) {
        return setFieldValidity(formConfig, false, ErrorsKeys.PATH_NOT_ALLOWED, validateOnlyPositive);
      }
    }

    if (domain) {
      if (value && value.search(REGEX.at) >= 0) {
        const domainValue = value.substring(value.indexOf('@') + 1, value.length);
        if (domainValue === domain) {
          return setFieldValidity(formConfig, false, ErrorsKeys.AT_DOMAIN_NOT_ALLOWED, validateOnlyPositive);
        }
        if (domainValue.length > 0) {
          return setFieldValidity(formConfig, false, ErrorsKeys.WRONG_DOMAIN, validateOnlyPositive);
        }
        return setFieldValidity(formConfig, false, ErrorsKeys.AT_NOT_ALLOWED, validateOnlyPositive);
      }
    }

    if (rootDomain) {
      const match = value.match(REGEX.domain);
      let rootDomainValue = '';
      let rootDomainErrorMsg: CustomErrorsKeys | undefined = undefined;
      if (typeof rootDomain === 'string') {
        rootDomainValue = rootDomain;
      } else {
        rootDomainValue = rootDomain.value;
        rootDomainErrorMsg = translationService.get(rootDomain.customErrorMessage, { rootDomain: rootDomainValue })
          .value as any;
      }
      if (match && match[1]) {
        const domainValue = match[1];
        const normalizedDomainValue = domainValue.startsWith('www.') ? domainValue.slice(4) : domainValue;
        const normalizedRootDomain = rootDomainValue.startsWith('www.') ? rootDomainValue.slice(4) : rootDomainValue;

        if (normalizedDomainValue !== normalizedRootDomain) {
          return setFieldValidity(
            formConfig,
            false,
            rootDomainErrorMsg ?? ErrorsKeys.ROOT_DOMAIN_INVALID,
            validateOnlyPositive,
          );
        }
      } else {
        return setFieldValidity(
          formConfig,
          false,
          rootDomainErrorMsg ?? ErrorsKeys.ROOT_DOMAIN_INVALID,
          validateOnlyPositive,
        );
      }
    }

    if (isPassword) {
      if (!validateIsRequired(value)) {
        return setFieldValidity(formConfig, false, ErrorsKeys.REQUIRED, validateOnlyPositive);
      }

      if (value && value.length < 4) {
        return setFieldValidity(formConfig, false, ErrorsKeys.PASSWORD_MIN_LEN, validateOnlyPositive);
      }

      if (value && value.length > 100) {
        return setFieldValidity(formConfig, false, ErrorsKeys.PASSWORD_MAX_LEN, validateOnlyPositive);
      }
    }

    if (notIn) {
      let errorMessage: ErrorsKeys | CustomErrorsKeys = ErrorsKeys.NOT_IN_ARRAY;

      if (!Array.isArray(notIn)) {
        errorMessage = notIn?.customErrorMessage;
        notIn = notIn?.value;
      }

      if (notIn.length && notIn.find((e) => e === value)) {
        return setFieldValidity(formConfig, false, errorMessage, validateOnlyPositive);
      }
    }
  }

  /**
   * Like a PHONE / EMAIL
   * -------------------------------------------------------------------------------------------------------------------
   */

  if (
    formConfig.fieldType === 'Input' ||
    formConfig.fieldType === 'InputBase' ||
    formConfig.fieldType === 'ColorPicker'
  ) {
    const { email, validatePhone, validatePhoneNumberForCountry, validateEmail, validateHexColor } =
      formConfig.validation as FormConfigSpecificValidation;

    if (value && validatePhone) {
      if (!REGEX.phone.test(value)) {
        return setFieldValidity(formConfig, false, ErrorsKeys.INVALID_PHONE, validateOnlyPositive);
      }
    }

    if (value && validatePhoneNumberForCountry) {
      if (!isValidPhoneNumber(value, validatePhoneNumberForCountry)) {
        return setFieldValidity(formConfig, false, ErrorsKeys.INCORRECT_PHONE, validateOnlyPositive);
      }
    }

    if (value && (validateEmail || email)) {
      if (!REGEX.email.test(value)) {
        return setFieldValidity(formConfig, false, ErrorsKeys.INVALID_EMAIL, validateOnlyPositive);
      }
    }

    if (value && validateHexColor) {
      if (!isValidHexColor(value)) {
        return setFieldValidity(formConfig, false, ErrorsKeys.INVALID_HEX_COLOR, validateOnlyPositive);
      }
    }
  }

  /**
   * AUTOCOMPLETE multiple selected items count
   * -------------------------------------------------------------------------------------------------------------------
   */
  if (formConfig.fieldType === 'Autocomplete') {
    const { minCount, maxCount } = formConfig.validation as FormConfigAutocompleteValidation;
    if (minCount) {
      if (Array.isArray(value)) {
        if (value.length < minCount) {
          return setFieldValidity(formConfig, false, undefined, validateOnlyPositive); // @todo Add a message?
        }
      }
    }
    if (maxCount) {
      if (Array.isArray(value)) {
        if (value.length > maxCount) {
          return setFieldValidity(formConfig, false, undefined, validateOnlyPositive); // @todo Add a message?
        }
      }
    }
  }

  /**
   * *******************************************************************************************************************
   * FIELD IS VALID
   * *******************************************************************************************************************
   */
  formConfig.setErrors([]);
  return setFieldValidity(formConfig, true, undefined, validateOnlyPositive);
};

/**
 * *********************************************************************************************************************
 */

/**
 * ---------------------------------------------------------------------------------------------------------------------
 * VALIDATE: Is Required
 * ---------------------------------------------------------------------------------------------------------------------
 */
const validateIsRequired = (value: string | number | []) => {
  if (!value) {
    return false;
  }
  if (Array.isArray(value) || typeof value === 'string') {
    // Autocomplete with multiple select has an array of items
    // Strings have length
    if (value.length === 0) {
      return false;
    }
  }
  return true;
};

/**
 ---------------------------------------------------------------------------------------------------------------------
 * VALIDATE: Is a number BIGGER / SMALLER / EQUAL to a "checkValue"
 * ---------------------------------------------------------------------------------------------------------------------
 */
const validateNumberSize = (
  fieldValue: number | string | undefined,
  checkValue: number | undefined,
  operator: 'gt' | 'lt' | 'gte' | 'lte',
) => {
  // Process Check Value
  if (typeof checkValue === 'undefined') return true;
  checkValue = Number(checkValue);
  if (checkValue === undefined || checkValue === null) return true;
  // Process Field Value
  let fieldValueCopy: number | null = null;
  if (typeof fieldValue === 'number' || typeof fieldValue === 'string') {
    fieldValueCopy = Number(fieldValue);
  }
  if (fieldValueCopy === undefined || fieldValueCopy === null || isNaN(fieldValueCopy)) return true;
  // Compare numbers
  switch (operator) {
    case 'gt':
      return fieldValueCopy > checkValue;
    case 'lt':
      return fieldValueCopy < checkValue;
    case 'gte':
      return fieldValueCopy >= checkValue;
    case 'lte':
      return fieldValueCopy <= checkValue;
  }
};

/**
 * ---------------------------------------------------------------------------------------------------------------------
 * FUNCTION: Set Field Validity
 * ---------------------------------------------------------------------------------------------------------------------
 */
export const setFieldValidity = (
  formConfig: FormConfigElement,
  isValid: boolean,
  errorMessage?: ErrorsKeys | CustomErrorsKeys,
  validateOnlyPositive: boolean = false,
): boolean => {
  if (isValid) {
    formConfig.hasError = false;
    formConfig.setHasError && formConfig.setHasError(false);
    return true;
  }

  if (validateOnlyPositive) {
    return false;
  }

  // Error State
  formConfig.hasError = true;
  formConfig.setHasError && formConfig.setHasError(true);

  // Error Messages
  if (formConfig.setErrors && errorMessage) {
    if (!formConfig.errors || formConfig.errors.indexOf(errorMessage) < 0) {
      formConfig.setErrors([errorMessage]);
    }
  }

  return false;
};
