import React from "react";
import { Form } from "@vanguard/Form/Form";
import { Input } from "@vanguard/Input/Input";
import { useFormConfig } from "@custom-hooks/useFormConfig";
import { within, expect, userEvent } from "storybook/test";
import { useSelector } from "react-redux";
import { FormRootState, FormSLice } from "./bootstrap/form.test.slice";
import { Story, waitForFormUpdate } from "./_Form.default";

export const NestedContainerFields: Story = {
  render: () => {
    const [currentField, setCurrentField] = React.useState<string>("null");
    const [hasChanges, setHasChanges] = React.useState<boolean>(false);

    const { formConfig } = useFormConfig({
      slice: FormSLice,
      reducer: ((state: FormRootState) => state.form) as any,
      inputs: {
        textValue: {
          fieldType: "Input",
          validation: {
            required: true,
            minLength: 3,
          },
        },
      },
    });

    const storedValue = useSelector((state: FormRootState) => state.form.textValue);

    return (
      <div data-testid="nested-form-story">
        <Form
          config={formConfig}
          onChange={(status) => {
            setCurrentField(status.currentConfig?.stateFieldName || "null");
            setHasChanges(status.hasChanges);
          }}
        >
          <section data-testid="level-1-wrapper">
            <div data-testid="level-2-wrapper">
              <Input
                label="Nested input"
                type="text"
                testId="nested-input"
                formconfig={formConfig.textValue}
              />
            </div>
          </section>
        </Form>
        <div data-testid="nested-debug">
          <span data-testid="nested-current-field">{currentField}</span>
          <span data-testid="nested-has-changes">{hasChanges ? "true" : "false"}</span>
          <span data-testid="nested-store-value">{storedValue || "(empty)"}</span>
        </div>
      </div>
    );
  },

  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const user = userEvent.setup();
    const inputWrapper = canvas.getByTestId("nested-input");
    const input = within(inputWrapper).getByRole("textbox");

    await user.clear(input);
    await user.type(input, "nested value");
    await user.tab();
    await waitForFormUpdate(200);

    await expect(canvas.getByTestId("nested-current-field")).toHaveTextContent("textValue");
    await expect(canvas.getByTestId("nested-has-changes")).toHaveTextContent("true");
    await expect(canvas.getByTestId("nested-store-value")).toHaveTextContent("nested value");
  },
};
