import React from "react";
import { Form } from "@vanguard/Form/Form";
import { Input } from "@vanguard/Input/Input";
import { useFormConfig } from "@custom-hooks/useFormConfig";
import { within, expect, userEvent } from "storybook/test";
import { FormRootState, FormSLice } from "./bootstrap/form.test.slice";
import { Story, waitForFormUpdate } from "./_Form.default";

const CUSTOM_REQUIRED_MESSAGE = "Please tell us your company name before continuing";

/**
 * `validation.requiredErrorMessage` replaces the default `validation_required` key
 * for the "field is empty" error, so the message can depend on context.
 */
export const FormValidationRequiredCustomMessage: Story = {
  render: () => {
    const { formConfig } = useFormConfig({
      slice: FormSLice,
      reducer: ((s: FormRootState) => s.form) as any,
      inputs: {
        textValue: {
          fieldType: "Input",
          validation: {
            required: true,
            requiredErrorMessage: CUSTOM_REQUIRED_MESSAGE,
          },
        },
      },
    });

    return (
      <Form config={formConfig}>
        <Input label="Company name" formconfig={formConfig.textValue} testId="company-input" />
      </Form>
    );
  },

  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const user = userEvent.setup({ delay: 10 });

    const input = within(canvas.getByTestId("company-input")).getByRole("textbox");

    // Type then clear so the "required" branch runs on an empty value
    await user.type(input, "a");
    await user.clear(input);
    await user.tab();
    await waitForFormUpdate(200);

    const error = await canvas.findByTestId("vanguard-input-error-text");
    await expect(error).toHaveTextContent(CUSTOM_REQUIRED_MESSAGE);
    await expect(error).not.toHaveTextContent("validation_required");

    // Filling the field clears the error again
    await user.type(input, "rankingCoach");
    await user.tab();
    await waitForFormUpdate(200);
    await expect(canvas.queryByTestId("vanguard-input-error-text")).not.toBeInTheDocument();
  },
};
