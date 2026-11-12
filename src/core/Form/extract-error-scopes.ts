import { PayloadAction } from '@reduxjs/toolkit';

/**
 * One failed validation rule of a backend `BadRequestException`: the same shape as the consumer's generated
 * `ValidationResult` model, so the results can be stored as that type.
 */
export type ValidationResult = {
  propertyName?: string;
  errorMessage?: string;
  receivedValue?: string;
  className?: string;
  objectType: string;
};

/** The validation errors of one property, at `jsonPath` in the request body. */
export type ValidationError = {
  jsonPath?: string;
  elements?: ValidationResult[];
  objectType: string;
};

export type ValidationErrors = {
  elements?: ValidationError[];
  objectType: string;
};

/** The rejected payload of a backend 400: only its `validationErrors` are read. */
export type BadRequestException = {
  validationErrors?: ValidationErrors;
};

export type ValidationResultWithInfo = ValidationResult & {
  info: unknown;
};
export const extractErrorScopes = <T extends Record<string, string>>(
  request: PayloadAction<any, any, any>,
): ValidationResult[] => {
  const payloadErrors = request.payload as unknown as BadRequestException;
  const errors = payloadErrors.validationErrors;
  const formattedErrors: ValidationResultWithInfo[] = [];

  errors?.elements?.map((item) => {
    if (item.elements) {
      const jsonPath = item.jsonPath;
      const error = item.elements[0];
      let allFields = {} as any;
      if (jsonPath && error && error.errorMessage) {
        for (const key in request.meta.arg.requestBody) {
          const subElement = request.meta.arg.requestBody[key];

          const fn = function (prev: any, key: any) {
            if (prev && key) {
              if (prev[key]) {
                return prev[key];
              }
            }
          };
          // @ts-ignore //TODO FIXME
          const extractedField: any = (jsonPath.match(/\d+|\w+/gm) ?? []).reduce(fn, subElement);
          allFields = { ...allFields, ...extractedField };
        }
        const validationResultWithInfo: ValidationResultWithInfo = { ...error, info: allFields };
        formattedErrors.push(validationResultWithInfo);
      }
    }
  });

  // console.log("formattedErrors", formattedErrors);
  return formattedErrors;
};
