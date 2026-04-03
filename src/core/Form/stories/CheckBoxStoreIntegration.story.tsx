import React from "react";
import { Form } from "@vanguard/Form/Form";
import { CheckBox } from "@vanguard/CheckBox/CheckBox";
import { useFormConfig } from "@custom-hooks/useFormConfig";
import { within, expect, userEvent } from "storybook/test";
import { useSelector } from "react-redux";
import { FormRootState, FormSLice } from "./bootstrap/form.test.slice";
import { Story, waitForFormUpdate } from "./_Form.default";

export const CheckBoxStoreIntegration: Story = {
  render: () => {
    const [hasChanges, setHasChanges] = React.useState<boolean>(false);
    const [storeValueOnChange, setStoreValueOnChange] = React.useState<string>("false");

    const { formConfig } = useFormConfig({
      slice: FormSLice,
      reducer: ((state: FormRootState) => state.form) as any,
      inputs: {
        termsAccepted: {
          fieldType: "Checkbox",
          validation: {
            required: true,
          },
        },
      },
    });

    const accepted = useSelector((state: FormRootState) => state.form.termsAccepted);

    return (
      <div data-testid="checkbox-integration-story">
        <Form
          config={formConfig}
          onChange={(status) => {
            setHasChanges(status.hasChanges);
            setStoreValueOnChange(status.currentConfig?.getValue?.() ? "true" : "false");
          }}
        >
          <CheckBox
            label="Accept terms"
            formconfig={formConfig.termsAccepted}
            testId="form-checkbox"
          />
        </Form>
        <div data-testid="checkbox-debug">
          <span data-testid="checkbox-has-changes">{hasChanges ? "true" : "false"}</span>
          <span data-testid="checkbox-store-value">{accepted ? "true" : "false"}</span>
          <span data-testid="checkbox-current-value">{storeValueOnChange}</span>
        </div>
      </div>
    );
  },

  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const user = userEvent.setup();
    const checkboxContainer = canvas.getByTestId("form-checkbox");
    const checkbox = within(checkboxContainer).getByRole("checkbox");
    const label = canvas.getByText("Accept terms");

    await expect(checkbox).not.toBeChecked();
    await user.click(label);
    await waitForFormUpdate(200);

    await expect(checkbox).toBeChecked();
    await expect(canvas.getByTestId("checkbox-store-value")).toHaveTextContent("true");
    await expect(canvas.getByTestId("checkbox-current-value")).toHaveTextContent("true");
  },
};
