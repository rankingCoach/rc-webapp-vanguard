import React from "react";
import { useFormConfig } from "@custom-hooks/useFormConfig";
import { Autocomplete } from "@vanguard/Autocomplete/Autocomplete";
import { Form } from "@vanguard/Form/Form";
import { expect, fireEvent, waitFor, within, userEvent } from "storybook/test";
import { FormRootState, FormSLice } from "./bootstrap/form.test.slice";
import { Story } from "./_Form.default";

const skillOptions = ["SEO", "Content", "Ads", "Analytics", "Social"];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const waitForStatusValue = async (
  statusMap: HTMLElement,
  fieldName: string,
  isValid: boolean,
) => {
  await waitFor(() => {
    expect(statusMap).toHaveTextContent(`"${fieldName}":${isValid}`);
  });
};

/**
 * Select an option from the dropdown by clicking on it.
 * Works for both single and multiple autocompletes.
 */
const chooseAutocompleteOption = async (
  user: ReturnType<typeof userEvent.setup>,
  canvas: ReturnType<typeof within>,
  testId: string,
  label: string,
) => {
  const field = canvas.getByTestId(testId);
  const input = field.querySelector("input") as HTMLInputElement | null;

  if (!input) throw new Error(`Autocomplete input not found for testId: ${testId}`);

  await user.click(input);
  fireEvent.change(input, { target: { value: label } });

  const option = await within(document.body).findByRole("option", { name: label });
  await user.click(option);
};

/**
 * Click the autocomplete input and then click away — triggers blur validation
 * without selecting anything. Used to verify "required" errors.
 */
const blurAutocompleteWithoutSelection = async (
  user: ReturnType<typeof userEvent.setup>,
  canvas: ReturnType<typeof within>,
  testId: string,
) => {
  const field = canvas.getByTestId(testId);
  const input = field.querySelector("input") as HTMLInputElement | null;

  if (!input) throw new Error(`Autocomplete input not found for testId: ${testId}`);

  await user.click(input);
  await user.click(canvas.getByTestId("ac-validation-debug"));
};

/**
 * Type comma-separated values into a splitCommaTag autocomplete and press Enter
 * to convert them into tags. The splitOnEnter handler splits the input value by
 * comma and fires onChange with the resulting array.
 *
 * Note: optionFocused starts as null (never truthy until ArrowUp/Down is used),
 * so !optionFocused.current is true and splitOnEnter always fires on Enter when
 * the user has only typed — not navigated the dropdown with keys.
 */
const typeCommaTagsAndSubmit = async (
  user: ReturnType<typeof userEvent.setup>,
  canvas: ReturnType<typeof within>,
  testId: string,
  commaValue: string,
) => {
  const field = canvas.getByTestId(testId);
  const input = field.querySelector("input") as HTMLInputElement | null;

  if (!input) throw new Error(`Autocomplete input not found for testId: ${testId}`);

  await user.click(input);

  // Set the value via the native setter so innerInputRef.current.value reflects it
  const proto = Object.getPrototypeOf(input);
  const descriptor = Object.getOwnPropertyDescriptor(proto, "value");
  descriptor?.set?.call(input, commaValue);
  fireEvent.input(input, { target: { value: commaValue } });
  fireEvent.change(input, { target: { value: commaValue } });

  // Fire keydown Enter — splitOnEnter reads innerInputRef.current.value and
  // splits by comma, then calls onChange with the resulting array
  fireEvent.keyDown(input, {
    key: "Enter",
    code: "Enter",
    keyCode: 13,
    bubbles: true,
  });
};

// ─── Story ────────────────────────────────────────────────────────────────────

export const FormAutocompleteValidationMatrix: Story = {
  render: () => {
    const [isValid, setIsValid] = React.useState(true);
    const [inputsStatus, setInputsStatus] = React.useState("{}");

    const { formConfig } = useFormConfig<Record<string, unknown>>({
      validateOn: "blur",
      slice: FormSLice,
      reducer: ((state: FormRootState) => state.form) as any,
      inputs: {
        // 1. Single select — required
        acSingleRequired: {
          fieldType: "Autocomplete",
          validation: { required: true },
        },
        // 2. Multiple select — required (at least one tag)
        acMultiRequired: {
          fieldType: "Autocomplete",
          validation: { required: true },
        },
        // 3. Multiple select — minCount: must have ≥ 2 selections
        acMinCount: {
          fieldType: "Autocomplete",
          validation: { minCount: 2 },
        },
        // 4. Multiple select — maxCount: cannot have > 2 selections
        acMaxCount: {
          fieldType: "Autocomplete",
          validation: { maxCount: 2 },
        },
        // 5. Multiple select — minCount + maxCount combined
        acMinMax: {
          fieldType: "Autocomplete",
          validation: { minCount: 2, maxCount: 3 },
        },
        // 6. Multiple select — splitCommaTag: type "A,B" + Enter → two tags
        acSplitComma: {
          fieldType: "Autocomplete",
          validation: { minCount: 2 },
        },
      },
    });

    return (
      <div data-testid="ac-validation-story" style={{ padding: "20px" }}>
        <Form
          config={formConfig}
          onChange={(status) => {
            setIsValid(status.isValid);
            setInputsStatus(JSON.stringify(status.inputsStatus));
          }}
        >
          <div style={{ display: "grid", gap: "24px", maxWidth: "600px" }}>
            {/* 1 */}
            <Autocomplete
              label="Single select — required"
              testId="validation-ac-single-required"
              formconfig={formConfig.acSingleRequired}
              options={skillOptions}
            />

            {/* 2 */}
            <Autocomplete
              label="Multiple select — required (≥ 1)"
              testId="validation-ac-multi-required"
              formconfig={formConfig.acMultiRequired}
              multiple
              options={skillOptions}
            />

            {/* 3 */}
            <Autocomplete
              label="Multiple select — minCount 2"
              testId="validation-ac-min-count"
              formconfig={formConfig.acMinCount}
              multiple
              options={skillOptions}
            />

            {/* 4 */}
            <Autocomplete
              label="Multiple select — maxCount 2"
              testId="validation-ac-max-count"
              formconfig={formConfig.acMaxCount}
              multiple
              options={skillOptions}
            />

            {/* 5 */}
            <Autocomplete
              label="Multiple select — minCount 2 / maxCount 3"
              testId="validation-ac-min-max"
              formconfig={formConfig.acMinMax}
              multiple
              options={skillOptions}
            />

            {/* 6 */}
            <Autocomplete
              label="Multiple select — splitCommaTag (minCount 2)"
              testId="validation-ac-split-comma"
              formconfig={formConfig.acSplitComma}
              multiple
              splitCommaTag
              options={skillOptions}
            />
          </div>
        </Form>

        {/* Blur target + status display */}
        <div data-testid="ac-validation-debug" style={{ marginTop: "24px" }}>
          <p>
            Form valid:{" "}
            <span data-testid="ac-validation-form-valid">{isValid ? "true" : "false"}</span>
          </p>
          <pre
            data-testid="ac-validation-status-map"
            style={{
              whiteSpace: "pre-wrap",
              padding: "12px",
              background: "#f5f5f5",
              borderRadius: "8px",
            }}
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
    const statusMap = canvas.getByTestId("ac-validation-status-map");
    const formValid = canvas.getByTestId("ac-validation-form-valid");

    // ─── 1. Single select: required ───────────────────────────────────────────
    // Blur without selecting anything → should be invalid (required)
    await blurAutocompleteWithoutSelection(user, canvas, "validation-ac-single-required");
    await waitForStatusValue(statusMap, "acSingleRequired", false);
    await expect(formValid).toHaveTextContent("false");

    // Select one option → should become valid
    await chooseAutocompleteOption(user, canvas, "validation-ac-single-required", "SEO");
    await waitForStatusValue(statusMap, "acSingleRequired", true);

    // ─── 2. Multiple select: required ─────────────────────────────────────────
    // Blur without selecting anything → should be invalid (required)
    await blurAutocompleteWithoutSelection(user, canvas, "validation-ac-multi-required");
    await waitForStatusValue(statusMap, "acMultiRequired", false);

    // Select one option → should become valid (required = at least 1)
    await chooseAutocompleteOption(user, canvas, "validation-ac-multi-required", "Ads");
    await waitForStatusValue(statusMap, "acMultiRequired", true);

    // ─── 3. Multiple select: minCount 2 ───────────────────────────────────────
    // Select 1 option → invalid (below minCount: 2)
    await chooseAutocompleteOption(user, canvas, "validation-ac-min-count", "SEO");
    await waitForStatusValue(statusMap, "acMinCount", false);

    // Select 2nd option → valid (meets minCount: 2)
    await chooseAutocompleteOption(user, canvas, "validation-ac-min-count", "Content");
    await waitForStatusValue(statusMap, "acMinCount", true);

    // ─── 4. Multiple select: maxCount 2 ───────────────────────────────────────
    // Select 1 option → valid (below maxCount: 2)
    await chooseAutocompleteOption(user, canvas, "validation-ac-max-count", "SEO");
    await waitForStatusValue(statusMap, "acMaxCount", true);

    // Select 2nd option → still valid (exactly at maxCount: 2)
    await chooseAutocompleteOption(user, canvas, "validation-ac-max-count", "Content");
    await waitForStatusValue(statusMap, "acMaxCount", true);

    // Select 3rd option → invalid (exceeds maxCount: 2)
    await chooseAutocompleteOption(user, canvas, "validation-ac-max-count", "Ads");
    await waitForStatusValue(statusMap, "acMaxCount", false);

    // ─── 5. Multiple select: minCount 2 / maxCount 3 ──────────────────────────
    // Select 1 option → invalid (below minCount: 2)
    await chooseAutocompleteOption(user, canvas, "validation-ac-min-max", "SEO");
    await waitForStatusValue(statusMap, "acMinMax", false);

    // Select 2nd option → valid (meets minCount: 2, within maxCount: 3)
    await chooseAutocompleteOption(user, canvas, "validation-ac-min-max", "Content");
    await waitForStatusValue(statusMap, "acMinMax", true);

    // Select 3rd option → still valid (exactly at maxCount: 3)
    await chooseAutocompleteOption(user, canvas, "validation-ac-min-max", "Ads");
    await waitForStatusValue(statusMap, "acMinMax", true);

    // Select 4th option → invalid (exceeds maxCount: 3)
    await chooseAutocompleteOption(user, canvas, "validation-ac-min-max", "Analytics");
    await waitForStatusValue(statusMap, "acMinMax", false);

    // ─── 6. splitCommaTag: type comma-separated values + Enter ────────────────
    // Type one tag → invalid (minCount: 2 not met yet)
    await typeCommaTagsAndSubmit(user, canvas, "validation-ac-split-comma", "SEO,");
    await waitForStatusValue(statusMap, "acSplitComma", false);

    // Select a second tag via dropdown → now meets minCount: 2 → valid
    await chooseAutocompleteOption(user, canvas, "validation-ac-split-comma", "Ads");
    await waitForStatusValue(statusMap, "acSplitComma", true);
  },
};
