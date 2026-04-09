import React from "react";
import { Form } from "@vanguard/Form/Form";
import { Input } from "@vanguard/Input/Input";
import { CheckBox } from "@vanguard/CheckBox/CheckBox";
import { useFormConfig } from "@custom-hooks/useFormConfig";
import { within, expect, userEvent } from "storybook/test";
import { useSelector } from "react-redux";
import { FormRootState, FormSLice } from "./bootstrap/form.test.slice";
import { Story, waitForFormUpdate } from "./_Form.default";

// --- Custom sub-component ---
// Renders an Input + CheckBox internally; receives their formConfig elements as props.

interface CustomSubComponentProps {
  inputFormConfig: any;
  checkboxFormConfig: any;
}

const CustomSubComponent: React.FC<CustomSubComponentProps> = ({
  inputFormConfig,
  checkboxFormConfig,
}) => {
  return (
    <div
      data-testid="custom-sub-component"
      style={{
        border: "1px solid #c4c4c4",
        borderRadius: "6px",
        padding: "16px",
        marginTop: "12px",
      }}
    >
      <p style={{ margin: "0 0 12px", fontWeight: 600, fontSize: "14px" }}>
        Custom Component
      </p>
      <Input
        label="Custom Input"
        type="text"
        testId="custom-inner-input"
        formconfig={inputFormConfig}
      />
      <CheckBox
        label="Custom Checkbox"
        formconfig={checkboxFormConfig}
        testId="custom-inner-checkbox"
      />
    </div>
  );
};

// --- Story ---

export const InputCheckboxWithCustomComponent: Story = {
  render: () => {
    const [isValid, setIsValid] = React.useState<boolean>(true);
    const [hasChanges, setHasChanges] = React.useState<boolean>(false);

    const { formConfig } = useFormConfig({
      slice: FormSLice,
      reducer: ((state: FormRootState) => state.form) as any,
      inputs: {
        textValue: {
          fieldType: "Input",
          validation: { required: true },
        },
        termsAccepted: {
          fieldType: "Checkbox",
          validation: { required: true },
        },
        customInput: {
          fieldType: "Input",
          validation: { required: true },
        },
        customCheckbox: {
          fieldType: "Checkbox",
        },
      },
    });

    // Read all 4 values from the store for the debug panel
    const textValue = useSelector((state: FormRootState) => state.form.textValue);
    const termsAccepted = useSelector((state: FormRootState) => state.form.termsAccepted);
    const customInput = useSelector((state: FormRootState) => state.form.customInput);
    const customCheckbox = useSelector((state: FormRootState) => state.form.customCheckbox);

    return (
      <div data-testid="input-checkbox-custom-story">
        <Form
          config={formConfig}
          onChange={(status) => {
            setIsValid(status.isValid);
            setHasChanges(status.hasChanges);
          }}
        >
          {/* Top-level Input */}
          <Input
            label="Main Input"
            type="text"
            testId="main-input"
            formconfig={formConfig.textValue}
          />

          {/* Top-level CheckBox */}
          <CheckBox
            label="Main Checkbox"
            formconfig={formConfig.termsAccepted}
            testId="main-checkbox"
          />

          {/* Custom component containing inner Input + CheckBox */}
          <CustomSubComponent
            inputFormConfig={formConfig.customInput}
            checkboxFormConfig={formConfig.customCheckbox}
          />
        </Form>

        {/* Debug panel — shows live store values for all 4 fields */}
        <div data-testid="story-debug">
          <span data-testid="debug-is-valid">{isValid ? "true" : "false"}</span>
          <span data-testid="debug-has-changes">{hasChanges ? "true" : "false"}</span>
          <span data-testid="debug-text-value">{textValue || "(empty)"}</span>
          <span data-testid="debug-terms-accepted">{termsAccepted ? "true" : "false"}</span>
          <span data-testid="debug-custom-input">{customInput || "(empty)"}</span>
          <span data-testid="debug-custom-checkbox">{customCheckbox ? "true" : "false"}</span>
        </div>
      </div>
    );
  },

  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const user = userEvent.setup();

    // Helper: always re-query from the live DOM to avoid stale references after re-renders
    const getMainInput = () =>
      within(canvas.getByTestId("main-input")).getByRole("textbox");
    const getMainCheckboxInput = () =>
      within(canvas.getByTestId("main-checkbox")).getByRole("checkbox");
    const getMainCheckboxLabel = () => canvas.getByText("Main Checkbox");
    const getCustomSub = () => canvas.getByTestId("custom-sub-component");
    const getCustomInput = () =>
      within(within(getCustomSub()).getByTestId("custom-inner-input")).getByRole("textbox");
    const getCustomCheckboxInput = () =>
      within(within(getCustomSub()).getByTestId("custom-inner-checkbox")).getByRole("checkbox");
    const getCustomCheckboxLabel = () => within(getCustomSub()).getByText("Custom Checkbox");

    // --- Initial state: all fields empty / unchecked ---
    await expect(getMainInput()).toHaveValue("");
    await expect(getMainCheckboxInput()).not.toBeChecked();
    await expect(getCustomInput()).toHaveValue("");
    await expect(getCustomCheckboxInput()).not.toBeChecked();

    // --- 1. Type into Main Input ---
    // Explicit click to focus, then type, then blur by clicking outside the form
    await user.click(getMainInput());
    await user.clear(getMainInput());
    await user.type(getMainInput(), "Hello World");
    await user.click(canvas.getByTestId("story-debug")); // blur
    await waitForFormUpdate(200);

    await expect(canvas.getByTestId("debug-text-value")).toHaveTextContent("Hello World");
    await expect(canvas.getByTestId("debug-has-changes")).toHaveTextContent("true");

    // --- 2. Toggle Main Checkbox (click the label, not the hidden input) ---
    await user.click(getMainCheckboxLabel());
    await waitForFormUpdate(200);

    await expect(getMainCheckboxInput()).toBeChecked();
    await expect(canvas.getByTestId("debug-terms-accepted")).toHaveTextContent("true");

    // --- 3. Type into Custom (inner) Input ---
    // Re-query after re-render triggered by checkbox click; blur outside the form to commit
    await user.click(getCustomInput());
    await user.type(getCustomInput(), "Custom value");
    await user.click(canvas.getByTestId("story-debug")); // blur
    await waitForFormUpdate(200);

    await expect(canvas.getByTestId("debug-custom-input")).toHaveTextContent("Custom value");

    // --- 4. Toggle Custom (inner) Checkbox (click the label) ---
    await user.click(getCustomCheckboxLabel());
    await waitForFormUpdate(200);

    await expect(getCustomCheckboxInput()).toBeChecked();
    await expect(canvas.getByTestId("debug-custom-checkbox")).toHaveTextContent("true");

    // --- All 4 fields filled → form should be valid ---
    await expect(canvas.getByTestId("debug-is-valid")).toHaveTextContent("true");
  },
};
