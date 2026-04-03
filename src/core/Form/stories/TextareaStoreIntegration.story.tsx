import React from "react";
import { Form } from "@vanguard/Form/Form";
import { Textarea } from "@vanguard/Textarea/Textarea";
import { useFormConfig } from "@custom-hooks/useFormConfig";
import { within, expect, userEvent } from "storybook/test";
import { useSelector } from "react-redux";
import { FormRootState, FormSLice } from "./bootstrap/form.test.slice";
import { Story, waitForFormUpdate } from "./_Form.default";

export const TextareaStoreIntegration: Story = {
  render: () => {
    const [currentField, setCurrentField] = React.useState<string>("null");

    const { formConfig } = useFormConfig({
      slice: FormSLice,
      reducer: ((state: FormRootState) => state.form) as any,
      inputs: {
        notes: {
          fieldType: "Textarea",
          validation: {
            required: true,
            minLength: 10,
          },
        },
      },
    });

    const notes = useSelector((state: FormRootState) => state.form.notes);

    return (
      <div data-testid="textarea-integration-story">
        <Form
          config={formConfig}
          onChange={(status) => {
            setCurrentField(status.currentConfig?.stateFieldName || "null");
          }}
        >
          <Textarea
            label="Notes"
            testId="form-notes"
            placeholder="Describe the issue"
            formconfig={formConfig.notes}
          />
        </Form>
        <div data-testid="textarea-debug">
          <span data-testid="textarea-current-field">{currentField}</span>
          <span data-testid="textarea-store-value">{notes || "(empty)"}</span>
        </div>
      </div>
    );
  },

  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const user = userEvent.setup();
    const textareaWrapper = canvas.getByTestId("form-notes");
    const textarea = within(textareaWrapper).getByRole("textbox");
    const value = "Detailed notes for the integration story";

    await user.clear(textarea);
    await user.type(textarea, value);
    await user.tab();
    await waitForFormUpdate(200);

    await expect(canvas.getByTestId("textarea-current-field")).toHaveTextContent("notes");
    await expect(textarea).toHaveValue(value);
    await expect(canvas.getByTestId("textarea-store-value")).toHaveTextContent(value);
  },
};
