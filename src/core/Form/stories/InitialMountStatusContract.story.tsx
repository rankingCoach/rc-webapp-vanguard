import React from "react";
import { Form } from "@vanguard/Form/Form";
import { Input } from "@vanguard/Input/Input";
import { useFormConfig } from "@custom-hooks/useFormConfig";
import { within, expect } from "storybook/test";
import { FormRootState, FormSLice } from "./bootstrap/form.test.slice";
import { Story, waitForFormUpdate } from "./_Form.default";

export const InitialMountStatusContract: Story = {
  render: () => {
    const [hasChanges, setHasChanges] = React.useState<boolean>(false);
    const [isValid, setIsValid] = React.useState<boolean>(true);
    const [currentField, setCurrentField] = React.useState<string>("null");

    const { formConfig } = useFormConfig({
      slice: FormSLice,
      reducer: ((state: FormRootState) => state.form) as any,
      inputs: {
        textValue: {
          fieldType: "Input",
          validation: {
            required: true,
          },
        },
      },
    });

    return (
      <div data-testid="initial-status-story">
        <Form
          config={formConfig}
          onChange={(status) => {
            setHasChanges(status.hasChanges);
            setIsValid(status.isValid);
            setCurrentField(status.currentConfig?.stateFieldName ?? "null");
          }}
        >
          <Input label="Mount contract input" type="text" testId="initial-status-input" formconfig={formConfig.textValue} />
        </Form>

        <div data-testid="initial-status-debug">
          <span data-testid="initial-status-has-changes">{hasChanges ? "true" : "false"}</span>
          <span data-testid="initial-status-is-valid">{isValid ? "true" : "false"}</span>
          <span data-testid="initial-status-current">{currentField}</span>
        </div>
      </div>
    );
  },

  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await waitForFormUpdate(200);

    await expect(canvas.getByTestId("initial-status-has-changes")).toHaveTextContent("false");
    await expect(canvas.getByTestId("initial-status-is-valid")).toHaveTextContent("true");
    await expect(canvas.getByTestId("initial-status-current")).toHaveTextContent("textValue");
  },
};
