import React from "react";
import { useFormConfig } from "@custom-hooks/useFormConfig";
import { Autocomplete } from "@vanguard/Autocomplete/Autocomplete";
import { ColorPicker } from "@vanguard/ColorPicker/ColorPicker";
import { Form } from "@vanguard/Form/Form";
import { Input } from "@vanguard/Input/Input";
import { expect, within, userEvent } from "storybook/test";
import { FormRootState, FormSLice } from "./bootstrap/form.test.slice";
import { Story, waitForFormUpdate } from "./_Form.default";

const skillOptions = ["SEO", "Content", "Ads", "Analytics"];

const getValidationField = (canvas: ReturnType<typeof within>, testId: string) => {
  return (
    canvas.queryByTestId(testId) ??
    canvas.queryByTestId(`${testId}-input`) ??
    canvas.queryByTestId(`${testId}-text`)
  );
};

const expectFieldErrorState = (
  canvas: ReturnType<typeof within>,
  testId: string,
  shouldShow: boolean,
) => {
  const field = getValidationField(canvas, testId);

  if (!field) {
    throw new Error(`Validation field not found for ${testId}`);
  }

  const errorElement = within(field).queryByTestId("vanguard-input-error-text");
  if (shouldShow) {
    expect(errorElement).not.toBeNull();
  } else {
    expect(errorElement).toBeNull();
  }
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
  const field = canvas.getByTestId(testId);
  const input = field.querySelector("input, textarea") as HTMLInputElement | HTMLTextAreaElement | null;

  if (!input) {
    throw new Error(`Text input not found for ${testId}`);
  }

  await user.clear(input);
  if (options?.forceDirtyBeforeBlur && value.length === 0 && input.value.length === 0) {
    await user.type(input, "temp");
    await user.clear(input);
  }
  if (value.length > 0) {
    await user.type(input, value);
  }
  await user.tab();
  await waitForFormUpdate(20);
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
  const input = within(canvas.getByTestId(testId)).getByRole("spinbutton");
  await user.clear(input);
  if (options?.forceDirtyBeforeBlur && value.length === 0 && input.value.length === 0) {
    await user.type(input, "1");
    await user.clear(input);
  }
  if (value.length > 0) {
    await user.type(input, value);
  }
  await user.tab();
  await waitForFormUpdate(20);
};

const fillColorInput = async (
  user: ReturnType<typeof userEvent.setup>,
  canvas: ReturnType<typeof within>,
  testId: string,
  value: string,
) => {
  const colorField = canvas.getByTestId(testId);
  const input =
    (canvas.queryByTestId(`${testId}-text`)?.querySelector('input[type="text"]') as HTMLInputElement | null) ??
    (colorField.querySelector('input[type="text"]') as HTMLInputElement | null);

  if (!input) {
    throw new Error(`Color input not found for ${testId}`);
  }

  await user.clear(input);
  if (value.length > 0) {
    await user.type(input, value);
  }
  await user.tab();
  await waitForFormUpdate(20);
};

const chooseAutocompleteOption = async (
  user: ReturnType<typeof userEvent.setup>,
  canvas: ReturnType<typeof within>,
  label: string,
) => {
  const input = within(canvas.getByTestId("validation-autocomplete")).getByRole("textbox");
  await user.click(input);
  await user.clear(input);
  await user.type(input, label);

  const option = await within(document.body).findByRole("option", { name: label });
  await user.click(option);
  await waitForFormUpdate(40);
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

    await fillTextbox(user, canvas, "validation-required", "", { forceDirtyBeforeBlur: true });
    await expect(statusMap).toHaveTextContent('"requiredText":false');
    expectFieldErrorState(canvas, "validation-required", true);
    await expect(formValid).toHaveTextContent("false");
    await fillTextbox(user, canvas, "validation-required", "Filled");
    await expect(statusMap).toHaveTextContent('"requiredText":true');
    expectFieldErrorState(canvas, "validation-required", false);

    await fillTextbox(user, canvas, "validation-min-length", "abc");
    await expect(statusMap).toHaveTextContent('"minLengthText":false');
    expectFieldErrorState(canvas, "validation-min-length", true);
    await fillTextbox(user, canvas, "validation-min-length", "abcde");
    await expect(statusMap).toHaveTextContent('"minLengthText":true');
    expectFieldErrorState(canvas, "validation-min-length", false);

    await fillTextbox(user, canvas, "validation-max-length", "12345678901");
    await expect(statusMap).toHaveTextContent('"maxLengthText":false');
    expectFieldErrorState(canvas, "validation-max-length", true);
    await fillTextbox(user, canvas, "validation-max-length", "1234567890");
    await expect(statusMap).toHaveTextContent('"maxLengthText":true');
    expectFieldErrorState(canvas, "validation-max-length", false);

    await fillTextbox(user, canvas, "validation-regex", "12-ab");
    await expect(statusMap).toHaveTextContent('"regexText":false');
    expectFieldErrorState(canvas, "validation-regex", true);
    await fillTextbox(user, canvas, "validation-regex", "123-AB");
    await expect(statusMap).toHaveTextContent('"regexText":true');
    expectFieldErrorState(canvas, "validation-regex", false);

    await fillTextbox(user, canvas, "validation-url-not-allowed", "visit example.com");
    await expect(statusMap).toHaveTextContent('"urlNotAllowedText":false');
    expectFieldErrorState(canvas, "validation-url-not-allowed", true);
    await fillTextbox(user, canvas, "validation-url-not-allowed", "visit our homepage");
    await expect(statusMap).toHaveTextContent('"urlNotAllowedText":true');
    expectFieldErrorState(canvas, "validation-url-not-allowed", false);

    await fillTextbox(user, canvas, "validation-url-format", "not a url");
    await expect(statusMap).toHaveTextContent('"urlFormatText":false');
    expectFieldErrorState(canvas, "validation-url-format", true);
    await fillTextbox(user, canvas, "validation-url-format", "https://example.com/path");
    await expect(statusMap).toHaveTextContent('"urlFormatText":true');
    expectFieldErrorState(canvas, "validation-url-format", false);

    await fillTextbox(user, canvas, "validation-path-format", "folder<bad>");
    await expect(statusMap).toHaveTextContent('"pathFormatText":false');
    expectFieldErrorState(canvas, "validation-path-format", true);
    await fillTextbox(user, canvas, "validation-path-format", "folder/sub-path?x=1");
    await expect(statusMap).toHaveTextContent('"pathFormatText":true');
    expectFieldErrorState(canvas, "validation-path-format", false);

    await fillTextbox(user, canvas, "validation-special-chars", "hello@team");
    await expect(statusMap).toHaveTextContent('"specialCharsText":false');
    expectFieldErrorState(canvas, "validation-special-chars", true);
    await fillTextbox(user, canvas, "validation-special-chars", "hello team");
    await expect(statusMap).toHaveTextContent('"specialCharsText":true');
    expectFieldErrorState(canvas, "validation-special-chars", false);

    await fillTextbox(user, canvas, "validation-multiple-spaces", "too  many");
    await expect(statusMap).toHaveTextContent('"multipleSpacesText":false');
    expectFieldErrorState(canvas, "validation-multiple-spaces", true);
    await fillTextbox(user, canvas, "validation-multiple-spaces", "too many");
    await expect(statusMap).toHaveTextContent('"multipleSpacesText":true');
    expectFieldErrorState(canvas, "validation-multiple-spaces", false);

    await fillTextbox(user, canvas, "validation-only-spaces", "   ");
    await expect(statusMap).toHaveTextContent('"onlySpacesText":false');
    expectFieldErrorState(canvas, "validation-only-spaces", true);
    await fillTextbox(user, canvas, "validation-only-spaces", "content");
    await expect(statusMap).toHaveTextContent('"onlySpacesText":true');
    expectFieldErrorState(canvas, "validation-only-spaces", false);

    await fillTextbox(user, canvas, "validation-exclamation", "wow!");
    await expect(statusMap).toHaveTextContent('"exclamationText":false');
    expectFieldErrorState(canvas, "validation-exclamation", true);
    await fillTextbox(user, canvas, "validation-exclamation", "wow");
    await expect(statusMap).toHaveTextContent('"exclamationText":true');
    expectFieldErrorState(canvas, "validation-exclamation", false);

    await fillTextbox(user, canvas, "validation-full-stop", "sentence.");
    await expect(statusMap).toHaveTextContent('"fullStopText":false');
    expectFieldErrorState(canvas, "validation-full-stop", true);
    await fillTextbox(user, canvas, "validation-full-stop", "sentence");
    await expect(statusMap).toHaveTextContent('"fullStopText":true');
    expectFieldErrorState(canvas, "validation-full-stop", false);

    await fillTextbox(user, canvas, "validation-punctuation-spacing", "Hello,world");
    await expect(statusMap).toHaveTextContent('"punctuationSpacingText":false');
    expectFieldErrorState(canvas, "validation-punctuation-spacing", true);
    await fillTextbox(user, canvas, "validation-punctuation-spacing", "Hello, world");
    await expect(statusMap).toHaveTextContent('"punctuationSpacingText":true');
    expectFieldErrorState(canvas, "validation-punctuation-spacing", false);

    await fillTextbox(user, canvas, "validation-full-caps", "ALL CAPS");
    await expect(statusMap).toHaveTextContent('"fullCapsText":false');
    expectFieldErrorState(canvas, "validation-full-caps", true);
    await fillTextbox(user, canvas, "validation-full-caps", "Title Case");
    await expect(statusMap).toHaveTextContent('"fullCapsText":true');
    expectFieldErrorState(canvas, "validation-full-caps", false);

    await fillTextbox(user, canvas, "validation-excessive-caps", "abCDef");
    await expect(statusMap).toHaveTextContent('"excessiveCapsText":false');
    expectFieldErrorState(canvas, "validation-excessive-caps", true);
    await fillTextbox(user, canvas, "validation-excessive-caps", "Abcdef");
    await expect(statusMap).toHaveTextContent('"excessiveCapsText":true');
    expectFieldErrorState(canvas, "validation-excessive-caps", false);

    await fillTextbox(user, canvas, "validation-path-not-allowed", "folder/path");
    await expect(statusMap).toHaveTextContent('"pathNotAllowedText":false');
    expectFieldErrorState(canvas, "validation-path-not-allowed", true);
    await fillTextbox(user, canvas, "validation-path-not-allowed", "folder-path");
    await expect(statusMap).toHaveTextContent('"pathNotAllowedText":true');
    expectFieldErrorState(canvas, "validation-path-not-allowed", false);

    await fillTextbox(user, canvas, "validation-domain", "person@gmail.com");
    await expect(statusMap).toHaveTextContent('"domainText":false');
    expectFieldErrorState(canvas, "validation-domain", true);
    await fillTextbox(user, canvas, "validation-domain", "person");
    await expect(statusMap).toHaveTextContent('"domainText":true');
    expectFieldErrorState(canvas, "validation-domain", false);

    await fillTextbox(user, canvas, "validation-root-domain", "https://evil.com");
    await expect(statusMap).toHaveTextContent('"rootDomainText":false');
    expectFieldErrorState(canvas, "validation-root-domain", true);
    await fillTextbox(user, canvas, "validation-root-domain", "https://www.example.com/path");
    await expect(statusMap).toHaveTextContent('"rootDomainText":true');
    expectFieldErrorState(canvas, "validation-root-domain", false);

    await fillTextbox(user, canvas, "validation-password", "abc");
    await expect(statusMap).toHaveTextContent('"passwordText":false');
    expectFieldErrorState(canvas, "validation-password", true);
    await fillTextbox(user, canvas, "validation-password", "abcd");
    await expect(statusMap).toHaveTextContent('"passwordText":true');
    expectFieldErrorState(canvas, "validation-password", false);

    await fillTextbox(user, canvas, "validation-text-not-in", "blocked");
    await expect(statusMap).toHaveTextContent('"textNotInList":false');
    expectFieldErrorState(canvas, "validation-text-not-in", true);
    await fillTextbox(user, canvas, "validation-text-not-in", "approved");
    await expect(statusMap).toHaveTextContent('"textNotInList":true');
    expectFieldErrorState(canvas, "validation-text-not-in", false);

    await fillSpinbutton(user, canvas, "validation-number-is-valid", "", { forceDirtyBeforeBlur: true });
    await expect(statusMap).toHaveTextContent('"numberIsValid":false');
    expectFieldErrorState(canvas, "validation-number-is-valid", true);
    await fillSpinbutton(user, canvas, "validation-number-is-valid", "7");
    await expect(statusMap).toHaveTextContent('"numberIsValid":true');
    expectFieldErrorState(canvas, "validation-number-is-valid", false);

    await fillSpinbutton(user, canvas, "validation-number-gte", "4");
    await expect(statusMap).toHaveTextContent('"numberGte":false');
    expectFieldErrorState(canvas, "validation-number-gte", true);
    await fillSpinbutton(user, canvas, "validation-number-gte", "5");
    await expect(statusMap).toHaveTextContent('"numberGte":true');
    expectFieldErrorState(canvas, "validation-number-gte", false);

    await fillSpinbutton(user, canvas, "validation-number-lte", "21");
    await expect(statusMap).toHaveTextContent('"numberLte":false');
    expectFieldErrorState(canvas, "validation-number-lte", true);
    await fillSpinbutton(user, canvas, "validation-number-lte", "20");
    await expect(statusMap).toHaveTextContent('"numberLte":true');
    expectFieldErrorState(canvas, "validation-number-lte", false);

    await fillSpinbutton(user, canvas, "validation-number-gt", "10");
    await expect(statusMap).toHaveTextContent('"numberGt":false');
    expectFieldErrorState(canvas, "validation-number-gt", true);
    await fillSpinbutton(user, canvas, "validation-number-gt", "11");
    await expect(statusMap).toHaveTextContent('"numberGt":true');
    expectFieldErrorState(canvas, "validation-number-gt", false);

    await fillSpinbutton(user, canvas, "validation-number-lt", "10");
    await expect(statusMap).toHaveTextContent('"numberLt":false');
    expectFieldErrorState(canvas, "validation-number-lt", true);
    await fillSpinbutton(user, canvas, "validation-number-lt", "9");
    await expect(statusMap).toHaveTextContent('"numberLt":true');
    expectFieldErrorState(canvas, "validation-number-lt", false);

    await fillSpinbutton(user, canvas, "validation-number-not-in", "13");
    await expect(statusMap).toHaveTextContent('"numberNotIn":false');
    expectFieldErrorState(canvas, "validation-number-not-in", true);
    await fillSpinbutton(user, canvas, "validation-number-not-in", "14");
    await expect(statusMap).toHaveTextContent('"numberNotIn":true');
    expectFieldErrorState(canvas, "validation-number-not-in", false);

    await fillTextbox(user, canvas, "validation-phone", "abc");
    await expect(statusMap).toHaveTextContent('"phoneText":false');
    expectFieldErrorState(canvas, "validation-phone", true);
    await fillTextbox(user, canvas, "validation-phone", "+40 723 456 789");
    await expect(statusMap).toHaveTextContent('"phoneText":true');
    expectFieldErrorState(canvas, "validation-phone", false);

    await fillTextbox(user, canvas, "validation-us-phone", "+1 123");
    await expect(statusMap).toHaveTextContent('"usPhoneText":false');
    expectFieldErrorState(canvas, "validation-us-phone", true);
    await fillTextbox(user, canvas, "validation-us-phone", "+1 202-555-0123");
    await expect(statusMap).toHaveTextContent('"usPhoneText":true');
    expectFieldErrorState(canvas, "validation-us-phone", false);

    await fillTextbox(user, canvas, "validation-email", "broken-email");
    await expect(statusMap).toHaveTextContent('"emailText":false');
    expectFieldErrorState(canvas, "validation-email", true);
    await fillTextbox(user, canvas, "validation-email", "user@example.com");
    await expect(statusMap).toHaveTextContent('"emailText":true');
    expectFieldErrorState(canvas, "validation-email", false);

    await fillTextbox(user, canvas, "validation-validate-email", "broken-email");
    await expect(statusMap).toHaveTextContent('"validateEmailText":false');
    expectFieldErrorState(canvas, "validation-validate-email", true);
    await fillTextbox(user, canvas, "validation-validate-email", "user@example.com");
    await expect(statusMap).toHaveTextContent('"validateEmailText":true');
    expectFieldErrorState(canvas, "validation-validate-email", false);

    await fillColorInput(user, canvas, "validation-hex", "#12");
    await expect(statusMap).toHaveTextContent('"hexColor":false');
    expectFieldErrorState(canvas, "validation-hex", true);
    await fillColorInput(user, canvas, "validation-hex", "#3366cc");
    await expect(statusMap).toHaveTextContent('"hexColor":true');
    expectFieldErrorState(canvas, "validation-hex", false);

    await chooseAutocompleteOption(user, canvas, "SEO");
    await expect(statusMap).toHaveTextContent('"multiTags":false');
    expectFieldErrorState(canvas, "validation-autocomplete", true);
    await chooseAutocompleteOption(user, canvas, "Content");
    await expect(statusMap).toHaveTextContent('"multiTags":true');
    expectFieldErrorState(canvas, "validation-autocomplete", false);
    await chooseAutocompleteOption(user, canvas, "Ads");
    await expect(statusMap).toHaveTextContent('"multiTags":true');
    expectFieldErrorState(canvas, "validation-autocomplete", false);
    await chooseAutocompleteOption(user, canvas, "Analytics");
    await expect(statusMap).toHaveTextContent('"multiTags":false');
    expectFieldErrorState(canvas, "validation-autocomplete", true);
    await chooseAutocompleteOption(user, canvas, "Analytics");
    await expect(statusMap).toHaveTextContent('"multiTags":true');
    expectFieldErrorState(canvas, "validation-autocomplete", false);
    await expect(formValid).toHaveTextContent("true");
  },
};
