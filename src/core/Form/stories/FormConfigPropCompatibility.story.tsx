import React from "react";
import { Form } from "@vanguard/Form/Form";
import { Input } from "@vanguard/Input/Input";
import { useFormConfig } from "@custom-hooks/useFormConfig";
import { within, expect, userEvent } from "storybook/test";
import { useSelector } from "react-redux";
import { FormRootState, FormSLice } from "./bootstrap/form.test.slice";
import { Story, waitForFormUpdate } from "./_Form.default";

export const FormConfigPropCompatibility: Story = {
  render: () => {
    const [currentField, setCurrentField] = React.useState<string>("null");

    const { formConfig } = useFormConfig({
      slice: FormSLice,
      reducer: ((state: FormRootState) => state.form) as any,
      inputs: {
        aliasField: {
          fieldType: "Input",
          validation: {
            required: true,
          },
        },
      },
    });

    const storedValue = useSelector((state: FormRootState) => state.form.aliasField);

    return (
      <div data-testid="form-config-prop-story">
        <Form
          config={formConfig}
          onChange={(status) => {
            setCurrentField(status.currentConfig?.stateFieldName ?? "null");
          }}
        >
          <Input label="Alias field" type="text" testId="alias-field" formConfig={formConfig.aliasField} />
        </Form>
        <div data-testid="form-config-prop-debug">
          <span data-testid="form-config-prop-current">{currentField}</span>
          <span data-testid="form-config-prop-store">{storedValue || "(empty)"}</span>
        </div>
      </div>
    );
  },

  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const user = userEvent.setup();
    const input = within(canvas.getByTestId("alias-field")).getByRole("textbox");

    await user.clear(input);
    await user.type(input, "camel case config");
    await user.tab();
    await waitForFormUpdate(200);

    await expect(canvas.getByTestId("form-config-prop-current")).toHaveTextContent("aliasField");
    await expect(canvas.getByTestId("form-config-prop-store")).toHaveTextContent("camel case config");
  },
};
