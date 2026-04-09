import React from "react";
import { useFormConfig } from "@custom-hooks/useFormConfig";
import { Autocomplete } from "@vanguard/Autocomplete/Autocomplete";
import { ColorPicker } from "@vanguard/ColorPicker/ColorPicker";
import { Form } from "@vanguard/Form/Form";
import { Input } from "@vanguard/Input/Input";
import { expect, fireEvent, waitFor, within, userEvent } from "storybook/test";
import { FormRootState, FormSLice } from "./bootstrap/form.test.slice";
import { Story } from "./_Form.default";

const skillOptions = ["SEO", "Content", "Ads", "Analytics"];

const getValidationField = (canvas: ReturnType<typeof within>, testId: string) => {
  return (
    canvas.queryByTestId(testId) ??
    canvas.queryByTestId(`${testId}-input`) ??
    canvas.queryByTestId(`${testId}-text`) ??
    canvas.queryByTestId(`${testId}-color`)
  );
};

const waitForStatusValue = async (
  statusMap: HTMLElement,
  fieldName: string,
  isValid: boolean,
) => {
  await waitFor(() => {
    expect(statusMap).toHaveTextContent(`"${fieldName}":${isValid}`);
  });
};

const setElementValue = (
  input: HTMLInputElement | HTMLTextAreaElement,
  value: string,
) => {
  const prototype = Object.getPrototypeOf(input);
  const descriptor = Object.getOwnPropertyDescriptor(prototype, "value");

  descriptor?.set?.call(input, value);
};

const setFieldValue = async (
  user: ReturnType<typeof userEvent.setup>,
  input: HTMLInputElement | HTMLTextAreaElement,
  value: string,
  blurTarget: HTMLElement,
  _options?: {
    forceDirtyBeforeBlur?: boolean;
    dirtyValue?: string;
  },
) => {
  await user.click(input);
  setElementValue(input, value);
  fireEvent.input(input, { target: { value } });
  fireEvent.change(input, { target: { value } });
  await user.click(blurTarget);
};

const expectFieldErrorState = async (
  canvas: ReturnType<typeof within>,
  testId: string,
  shouldShow: boolean,
) => {
  await waitFor(() => {
    const field = getValidationField(canvas, testId);

    if (!field) {
      throw new Error(`Validation field not found for ${testId}`);
    }

    const errorElement = within(field).queryByTestId("vanguard-input-error-text");
    const invalidInput = field.querySelector('[aria-invalid="true"]');
    if (shouldShow) {
      if (!errorElement && !invalidInput) {
        throw new Error(`Expected visible error state for ${testId}`);
      }
    } else {
      if (errorElement || invalidInput) {
        throw new Error(`Expected no visible error state for ${testId}`);
      }
    }
  });
};

const fillTextbox = async (
  user: ReturnType<typeof userEvent.setup>,
  canvas: ReturnType<typeof within>,
  testId: string,
  value: string,
  options?: {
    forceDirtyBeforeBlur?: boolean;
  },
) => {
  const blurTarget = canvas.getByTestId("validation-debug");
  const field = canvas.getByTestId(testId);
  const input = field.querySelector("input, textarea") as HTMLInputElement | HTMLTextAreaElement | null;

  if (!input) {
    throw new Error(`Text input not found for ${testId}`);
  }

  await setFieldValue(user, input, value, blurTarget, options);
};

const fillSpinbutton = async (
  user: ReturnType<typeof userEvent.setup>,
  canvas: ReturnType<typeof within>,
  testId: string,
  value: string,
  options?: {
    forceDirtyBeforeBlur?: boolean;
  },
) => {
  const blurTarget = canvas.getByTestId("validation-debug");
  const input = within(canvas.getByTestId(testId)).getByRole("spinbutton");
  await setFieldValue(user, input, value, blurTarget, { ...options, dirtyValue: "1" });
};

const fillColorInput = async (
  user: ReturnType<typeof userEvent.setup>,
  canvas: ReturnType<typeof within>,
  testId: string,
  value: string,
) => {
  const blurTarget = canvas.getByTestId("validation-debug");
  const colorField = getValidationField(canvas, testId);
  const input =
    (canvas.queryByTestId(`${testId}-text`)?.querySelector('input[type="text"]') as HTMLInputElement | null) ??
    (colorField?.querySelector('input[type="text"]') as HTMLInputElement | null);

  if (!input) {
    throw new Error(`Color input not found for ${testId}`);
  }

  await user.click(input);
  await user.clear(input);
  if (value.length > 0) {
    await user.type(input, value);
  }
  await user.click(blurTarget);
};

const chooseAutocompleteOption = async (
  user: ReturnType<typeof userEvent.setup>,
  canvas: ReturnType<typeof within>,
  label: string,
) => {
  const field = canvas.getByTestId("validation-autocomplete");
  const input = field.querySelector("input") as HTMLInputElement | null;

  if (!input) {
    throw new Error("Autocomplete input not found");
  }

  await user.click(input);
  fireEvent.change(input, { target: { value: label } });

  const option = await within(document.body).findByRole("option", { name: label });
  await user.click(option);
};

export const FormValidInputValidationMatrix: Story = {
  render: () => {
    const [isValid, setIsValid] = React.useState(true);
    const [currentField, setCurrentField] = React.useState("null");
    const [inputsStatus, setInputsStatus] = React.useState("{}");

    const { formConfig } = useFormConfig<Record<string, unknown>>({
      validateOn: "blur",
      slice: FormSLice,
      reducer: ((state: FormRootState) => state.form) as any,
      inputs: {
        requiredText: {
          fieldType: "Input",
          validation: { required: true },
        },
        minLengthText: {
          fieldType: "Input",
          validation: { minLength: 5 },
        },
        maxLengthText: {
          fieldType: "Input",
          validation: { maxLength: 10 },
        },
        regexText: {
          fieldType: "Input",
          validation: { regex: /^\d{3}-[A-Z]{2}$/ },
        },
        urlNotAllowedText: {
          fieldType: "Input",
          validation: { urlNotAllowed: true },
        },
        urlFormatText: {
          fieldType: "Input",
          validation: { urlFormat: true },
        },
        pathFormatText: {
          fieldType: "Input",
          validation: { pathFormat: true },
        },
        specialCharsText: {
          fieldType: "Input",
          validation: { specialCharsNotAllowed: true },
        },
        multipleSpacesText: {
          fieldType: "Input",
          validation: { multipleSpacesNotAllowed: true },
        },
        onlySpacesText: {
          fieldType: "Input",
          validation: { onlySpacesNotAllowed: true },
        },
        exclamationText: {
          fieldType: "Input",
          validation: { exclamationMarksNotAllowed: true },
        },
        fullStopText: {
          fieldType: "Input",
          validation: { fullStopMarkNotAllowed: true },
        },
        punctuationSpacingText: {
          fieldType: "Input",
          validation: { textAfterCommaOrPeriodNotAllowed: true },
        },
        fullCapsText: {
          fieldType: "Input",
          validation: { fullCapitalizationNotAllowed: true },
        },
        excessiveCapsText: {
          fieldType: "Input",
          validation: { excessiveCapitalisationNotAllowed: true },
        },
        pathNotAllowedText: {
          fieldType: "Input",
          validation: { pathNotAllowed: true },
        },
        domainText: {
          fieldType: "Input",
          validation: { domain: "gmail.com" },
        },
        rootDomainText: {
          fieldType: "Input",
          validation: { rootDomain: "example.com" },
        },
        passwordText: {
          fieldType: "Input",
          validation: { isPassword: true },
        },
        textNotInList: {
          fieldType: "Input",
          validation: { notIn: ["blocked", "reserved"] },
        },
        numberIsValid: {
          fieldType: "InputNumber",
          validation: { isValid: true },
        },
        numberGte: {
          fieldType: "InputNumber",
          validation: { gte: 5 },
        },
        numberLte: {
          fieldType: "InputNumber",
          validation: { lte: 20 },
        },
        numberGt: {
          fieldType: "InputNumber",
          validation: { gt: 10 },
        },
        numberLt: {
          fieldType: "InputNumber",
          validation: { lt: 10 },
        },
        numberNotIn: {
          fieldType: "InputNumber",
          validation: { notIn: [13, 21] },
        },
        phoneText: {
          fieldType: "Input",
          validation: { validatePhone: true },
        },
        usPhoneText: {
          fieldType: "Input",
          validation: { validatePhoneNumberForCountry: "US" },
        },
        emailText: {
          fieldType: "Input",
          validation: { email: true },
        },
        validateEmailText: {
          fieldType: "Input",
          validation: { validateEmail: true },
        },
        hexColor: {
          fieldType: "ColorPicker",
          validation: { validateHexColor: true },
        },
        multiTags: {
          fieldType: "Autocomplete",
          validation: { minCount: 2, maxCount: 3 },
        },
      },
    });

    return (
      <div data-testid="valid-input-form-story" style={{ padding: "20px" }}>
        <Form
          config={formConfig}
          onChange={(status) => {
            setIsValid(status.isValid);
            setCurrentField(status.currentConfig?.stateFieldName ?? "null");
            setInputsStatus(JSON.stringify(status.inputsStatus));
          }}
        >
          <div style={{ display: "grid", gap: "12px", maxWidth: "760px" }}>
            <Input label="Required input" testId="validation-required" formconfig={formConfig.requiredText} />
            <Input label="Minimum length" testId="validation-min-length" formconfig={formConfig.minLengthText} />
            <Input label="Maximum length" testId="validation-max-length" formconfig={formConfig.maxLengthText} />
            <Input label="Regex match" testId="validation-regex" formconfig={formConfig.regexText} />
            <Input label="URL not allowed" testId="validation-url-not-allowed" formconfig={formConfig.urlNotAllowedText} />
            <Input label="URL format" testId="validation-url-format" formconfig={formConfig.urlFormatText} />
            <Input label="Path format" testId="validation-path-format" formconfig={formConfig.pathFormatText} />
            <Input label="Special chars not allowed" testId="validation-special-chars" formconfig={formConfig.specialCharsText} />
            <Input label="Multiple spaces not allowed" testId="validation-multiple-spaces" formconfig={formConfig.multipleSpacesText} />
            <Input label="Only spaces not allowed" testId="validation-only-spaces" formconfig={formConfig.onlySpacesText} />
            <Input label="Exclamation mark not allowed" testId="validation-exclamation" formconfig={formConfig.exclamationText} />
            <Input label="Full stop not allowed" testId="validation-full-stop" formconfig={formConfig.fullStopText} />
            <Input
              label="Space after comma or period"
              testId="validation-punctuation-spacing"
              formconfig={formConfig.punctuationSpacingText}
            />
            <Input label="Full capitalization not allowed" testId="validation-full-caps" formconfig={formConfig.fullCapsText} />
            <Input
              label="Excessive capitalization not allowed"
              testId="validation-excessive-caps"
              formconfig={formConfig.excessiveCapsText}
            />
            <Input label="Path not allowed" testId="validation-path-not-allowed" formconfig={formConfig.pathNotAllowedText} />
            <Input label="Username only for gmail.com" testId="validation-domain" formconfig={formConfig.domainText} />
            <Input label="Root domain match" testId="validation-root-domain" formconfig={formConfig.rootDomainText} />
            <Input type="password" label="Password validation" testId="validation-password" formconfig={formConfig.passwordText} />
            <Input label="Text not in list" testId="validation-text-not-in" formconfig={formConfig.textNotInList} />
            <Input type="number" label="Number must be valid" testId="validation-number-is-valid" formconfig={formConfig.numberIsValid} />
            <Input type="number" label="Number gte" testId="validation-number-gte" formconfig={formConfig.numberGte} />
            <Input type="number" label="Number lte" testId="validation-number-lte" formconfig={formConfig.numberLte} />
            <Input type="number" label="Number gt" testId="validation-number-gt" formconfig={formConfig.numberGt} />
            <Input type="number" label="Number lt" testId="validation-number-lt" formconfig={formConfig.numberLt} />
            <Input type="number" label="Number not in list" testId="validation-number-not-in" formconfig={formConfig.numberNotIn} />
            <Input label="Phone format" testId="validation-phone" formconfig={formConfig.phoneText} />
            <Input label="US phone validation" testId="validation-us-phone" formconfig={formConfig.usPhoneText} />
            <Input type="email" label="Email shortcut validation" testId="validation-email" formconfig={formConfig.emailText} />
            <Input type="email" label="Email explicit validation" testId="validation-validate-email" formconfig={formConfig.validateEmailText} />
            <ColorPicker label="Hex color validation" testId="validation-hex" formconfig={formConfig.hexColor} />
            <Autocomplete
              label="Autocomplete min/max count"
              testId="validation-autocomplete"
              formconfig={formConfig.multiTags}
              multiple
              splitCommaTag
              options={skillOptions}
            />
          </div>
        </Form>

        <div data-testid="validation-debug" style={{ marginTop: "24px" }}>
          <p>
            Form valid: <span data-testid="validation-form-valid">{isValid ? "true" : "false"}</span>
          </p>
          <p>
            Current field: <span data-testid="validation-current-field">{currentField}</span>
          </p>
          <pre
            data-testid="validation-status-map"
            style={{ whiteSpace: "pre-wrap", padding: "12px", background: "#f5f5f5", borderRadius: "8px" }}
          >
            {inputsStatus}
          </pre>
        </div>
      </div>
    );
  },

  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const user = userEvent.setup();
    const statusMap = canvas.getByTestId("validation-status-map");
    const formValid = canvas.getByTestId("validation-form-valid");

    await fillTextbox(user, canvas, "validation-required", "temp");
    await fillTextbox(user, canvas, "validation-required", "");
    await waitForStatusValue(statusMap, "requiredText", false);
    await expectFieldErrorState(canvas, "validation-required", true);
    await expect(formValid).toHaveTextContent("false");
    await fillTextbox(user, canvas, "validation-required", "Filled");
    await waitForStatusValue(statusMap, "requiredText", true);
    await expectFieldErrorState(canvas, "validation-required", false);

    await fillTextbox(user, canvas, "validation-min-length", "abc");
    await waitForStatusValue(statusMap, "minLengthText", false);
    await expectFieldErrorState(canvas, "validation-min-length", true);
    await fillTextbox(user, canvas, "validation-min-length", "abcde");
    await waitForStatusValue(statusMap, "minLengthText", true);
    await expectFieldErrorState(canvas, "validation-min-length", false);

    await fillTextbox(user, canvas, "validation-max-length", "12345678901");
    await waitForStatusValue(statusMap, "maxLengthText", false);
    await expectFieldErrorState(canvas, "validation-max-length", true);
    await fillTextbox(user, canvas, "validation-max-length", "1234567890");
    await waitForStatusValue(statusMap, "maxLengthText", true);
    await expectFieldErrorState(canvas, "validation-max-length", false);

    await fillTextbox(user, canvas, "validation-regex", "12-ab");
    await waitForStatusValue(statusMap, "regexText", false);
    await expectFieldErrorState(canvas, "validation-regex", true);
    await fillTextbox(user, canvas, "validation-regex", "123-AB");
    await waitForStatusValue(statusMap, "regexText", true);
    await expectFieldErrorState(canvas, "validation-regex", false);

    await fillTextbox(user, canvas, "validation-url-not-allowed", "visit example.com");
    await waitForStatusValue(statusMap, "urlNotAllowedText", false);
    await expectFieldErrorState(canvas, "validation-url-not-allowed", true);
    await fillTextbox(user, canvas, "validation-url-not-allowed", "visit our homepage");
    await waitForStatusValue(statusMap, "urlNotAllowedText", true);
    await expectFieldErrorState(canvas, "validation-url-not-allowed", false);

    await fillTextbox(user, canvas, "validation-url-format", "not a url");
    await waitForStatusValue(statusMap, "urlFormatText", false);
    await expectFieldErrorState(canvas, "validation-url-format", true);
    await fillTextbox(user, canvas, "validation-url-format", "https://example.com/path");
    await waitForStatusValue(statusMap, "urlFormatText", true);
    await expectFieldErrorState(canvas, "validation-url-format", false);

    await fillTextbox(user, canvas, "validation-path-format", "folder<bad>");
    await waitForStatusValue(statusMap, "pathFormatText", false);
    await expectFieldErrorState(canvas, "validation-path-format", true);
    await fillTextbox(user, canvas, "validation-path-format", "folder/sub-path?x=1");
    await waitForStatusValue(statusMap, "pathFormatText", true);
    await expectFieldErrorState(canvas, "validation-path-format", false);

    await fillTextbox(user, canvas, "validation-special-chars", "hello@team");
    await waitForStatusValue(statusMap, "specialCharsText", false);
    await expectFieldErrorState(canvas, "validation-special-chars", true);
    await fillTextbox(user, canvas, "validation-special-chars", "hello team");
    await waitForStatusValue(statusMap, "specialCharsText", true);
    await expectFieldErrorState(canvas, "validation-special-chars", false);

    await fillTextbox(user, canvas, "validation-multiple-spaces", "too  many");
    await waitForStatusValue(statusMap, "multipleSpacesText", false);
    await expectFieldErrorState(canvas, "validation-multiple-spaces", true);
    await fillTextbox(user, canvas, "validation-multiple-spaces", "too many");
    await waitForStatusValue(statusMap, "multipleSpacesText", true);
    await expectFieldErrorState(canvas, "validation-multiple-spaces", false);

    await fillTextbox(user, canvas, "validation-only-spaces", "   ");
    await waitForStatusValue(statusMap, "onlySpacesText", false);
    await expectFieldErrorState(canvas, "validation-only-spaces", true);
    await fillTextbox(user, canvas, "validation-only-spaces", "content");
    await waitForStatusValue(statusMap, "onlySpacesText", true);
    await expectFieldErrorState(canvas, "validation-only-spaces", false);

    await fillTextbox(user, canvas, "validation-exclamation", "wow!");
    await waitForStatusValue(statusMap, "exclamationText", false);
    await expectFieldErrorState(canvas, "validation-exclamation", true);
    await fillTextbox(user, canvas, "validation-exclamation", "wow");
    await waitForStatusValue(statusMap, "exclamationText", true);
    await expectFieldErrorState(canvas, "validation-exclamation", false);

    await fillTextbox(user, canvas, "validation-full-stop", "sentence.");
    await waitForStatusValue(statusMap, "fullStopText", false);
    await expectFieldErrorState(canvas, "validation-full-stop", true);
    await fillTextbox(user, canvas, "validation-full-stop", "sentence");
    await waitForStatusValue(statusMap, "fullStopText", true);
    await expectFieldErrorState(canvas, "validation-full-stop", false);

    await fillTextbox(user, canvas, "validation-punctuation-spacing", "Hello,world");
    await waitForStatusValue(statusMap, "punctuationSpacingText", false);
    await expectFieldErrorState(canvas, "validation-punctuation-spacing", true);
    await fillTextbox(user, canvas, "validation-punctuation-spacing", "Hello, world");
    await waitForStatusValue(statusMap, "punctuationSpacingText", true);
    await expectFieldErrorState(canvas, "validation-punctuation-spacing", false);

    await fillTextbox(user, canvas, "validation-full-caps", "ALL CAPS");
    await waitForStatusValue(statusMap, "fullCapsText", false);
    await expectFieldErrorState(canvas, "validation-full-caps", true);
    await fillTextbox(user, canvas, "validation-full-caps", "Title Case");
    await waitForStatusValue(statusMap, "fullCapsText", true);
    await expectFieldErrorState(canvas, "validation-full-caps", false);

    await fillTextbox(user, canvas, "validation-excessive-caps", "abCDef");
    await waitForStatusValue(statusMap, "excessiveCapsText", false);
    await expectFieldErrorState(canvas, "validation-excessive-caps", true);
    await fillTextbox(user, canvas, "validation-excessive-caps", "Abcdef");
    await waitForStatusValue(statusMap, "excessiveCapsText", true);
    await expectFieldErrorState(canvas, "validation-excessive-caps", false);

    await fillTextbox(user, canvas, "validation-path-not-allowed", "folder/path");
    await waitForStatusValue(statusMap, "pathNotAllowedText", false);
    await expectFieldErrorState(canvas, "validation-path-not-allowed", true);
    await fillTextbox(user, canvas, "validation-path-not-allowed", "folder-path");
    await waitForStatusValue(statusMap, "pathNotAllowedText", true);
    await expectFieldErrorState(canvas, "validation-path-not-allowed", false);

    await fillTextbox(user, canvas, "validation-domain", "person@gmail.com");
    await waitForStatusValue(statusMap, "domainText", false);
    await expectFieldErrorState(canvas, "validation-domain", true);
    await fillTextbox(user, canvas, "validation-domain", "person");
    await waitForStatusValue(statusMap, "domainText", true);
    await expectFieldErrorState(canvas, "validation-domain", false);

    await fillTextbox(user, canvas, "validation-root-domain", "https://evil.com");
    await waitForStatusValue(statusMap, "rootDomainText", false);
    await expectFieldErrorState(canvas, "validation-root-domain", true);
    await fillTextbox(user, canvas, "validation-root-domain", "https://www.example.com/path");
    await waitForStatusValue(statusMap, "rootDomainText", true);
    await expectFieldErrorState(canvas, "validation-root-domain", false);

    await fillTextbox(user, canvas, "validation-password", "abc");
    await waitForStatusValue(statusMap, "passwordText", false);
    await expectFieldErrorState(canvas, "validation-password", true);
    await fillTextbox(user, canvas, "validation-password", "abcd");
    await waitForStatusValue(statusMap, "passwordText", true);
    await expectFieldErrorState(canvas, "validation-password", false);

    await fillTextbox(user, canvas, "validation-text-not-in", "blocked");
    await waitForStatusValue(statusMap, "textNotInList", false);
    await expectFieldErrorState(canvas, "validation-text-not-in", true);
    await fillTextbox(user, canvas, "validation-text-not-in", "approved");
    await waitForStatusValue(statusMap, "textNotInList", true);
    await expectFieldErrorState(canvas, "validation-text-not-in", false);

    await fillSpinbutton(user, canvas, "validation-number-is-valid", "1");
    await fillSpinbutton(user, canvas, "validation-number-is-valid", "");
    await waitForStatusValue(statusMap, "numberIsValid", false);
    await expectFieldErrorState(canvas, "validation-number-is-valid", true);
    await fillSpinbutton(user, canvas, "validation-number-is-valid", "7");
    await waitForStatusValue(statusMap, "numberIsValid", true);
    await expectFieldErrorState(canvas, "validation-number-is-valid", false);

    await fillSpinbutton(user, canvas, "validation-number-gte", "4");
    await waitForStatusValue(statusMap, "numberGte", false);
    await expectFieldErrorState(canvas, "validation-number-gte", true);
    await fillSpinbutton(user, canvas, "validation-number-gte", "5");
    await waitForStatusValue(statusMap, "numberGte", true);
    await expectFieldErrorState(canvas, "validation-number-gte", false);

    await fillSpinbutton(user, canvas, "validation-number-lte", "21");
    await waitForStatusValue(statusMap, "numberLte", false);
    await expectFieldErrorState(canvas, "validation-number-lte", true);
    await fillSpinbutton(user, canvas, "validation-number-lte", "20");
    await waitForStatusValue(statusMap, "numberLte", true);
    await expectFieldErrorState(canvas, "validation-number-lte", false);

    await fillSpinbutton(user, canvas, "validation-number-gt", "10");
    await waitForStatusValue(statusMap, "numberGt", false);
    await expectFieldErrorState(canvas, "validation-number-gt", true);
    await fillSpinbutton(user, canvas, "validation-number-gt", "11");
    await waitForStatusValue(statusMap, "numberGt", true);
    await expectFieldErrorState(canvas, "validation-number-gt", false);

    await fillSpinbutton(user, canvas, "validation-number-lt", "10");
    await waitForStatusValue(statusMap, "numberLt", false);
    await expectFieldErrorState(canvas, "validation-number-lt", true);
    await fillSpinbutton(user, canvas, "validation-number-lt", "9");
    await waitForStatusValue(statusMap, "numberLt", true);
    await expectFieldErrorState(canvas, "validation-number-lt", false);

    await fillSpinbutton(user, canvas, "validation-number-not-in", "13");
    await waitForStatusValue(statusMap, "numberNotIn", false);
    await expectFieldErrorState(canvas, "validation-number-not-in", true);
    await fillSpinbutton(user, canvas, "validation-number-not-in", "14");
    await waitForStatusValue(statusMap, "numberNotIn", true);
    await expectFieldErrorState(canvas, "validation-number-not-in", false);

    await fillTextbox(user, canvas, "validation-phone", "abc");
    await waitForStatusValue(statusMap, "phoneText", false);
    await expectFieldErrorState(canvas, "validation-phone", true);
    await fillTextbox(user, canvas, "validation-phone", "+40 723 456 789");
    await waitForStatusValue(statusMap, "phoneText", true);
    await expectFieldErrorState(canvas, "validation-phone", false);

    await fillTextbox(user, canvas, "validation-us-phone", "+1 123");
    await waitForStatusValue(statusMap, "usPhoneText", false);
    await expectFieldErrorState(canvas, "validation-us-phone", true);
    await fillTextbox(user, canvas, "validation-us-phone", "+1 202-555-0123");
    await waitForStatusValue(statusMap, "usPhoneText", true);
    await expectFieldErrorState(canvas, "validation-us-phone", false);

    await fillTextbox(user, canvas, "validation-email", "broken-email");
    await waitForStatusValue(statusMap, "emailText", false);
    await expectFieldErrorState(canvas, "validation-email", true);
    await fillTextbox(user, canvas, "validation-email", "user@example.com");
    await waitForStatusValue(statusMap, "emailText", true);
    await expectFieldErrorState(canvas, "validation-email", false);

    await fillTextbox(user, canvas, "validation-validate-email", "broken-email");
    await waitForStatusValue(statusMap, "validateEmailText", false);
    await expectFieldErrorState(canvas, "validation-validate-email", true);
    await fillTextbox(user, canvas, "validation-validate-email", "user@example.com");
    await waitForStatusValue(statusMap, "validateEmailText", true);
    await expectFieldErrorState(canvas, "validation-validate-email", false);

    await fillColorInput(user, canvas, "validation-hex", "#12");
    await waitForStatusValue(statusMap, "hexColor", false);
    await fillColorInput(user, canvas, "validation-hex", "#3366cc");
    await waitForStatusValue(statusMap, "hexColor", true);

    await chooseAutocompleteOption(user, canvas, "SEO");
    await waitForStatusValue(statusMap, "multiTags", false);
    await expect(formValid).toHaveTextContent("false");
  },
};
