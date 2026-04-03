import React from "react";
import { Form } from "@vanguard/Form/Form";
import { Input } from "@vanguard/Input/Input";
import { useFormConfig } from "@custom-hooks/useFormConfig";
import { within, expect, userEvent } from "storybook/test";
import { FormRootState, FormSLice } from "./bootstrap/form.test.slice";
import { Story, waitForFormUpdate } from "./_Form.default";

export const ResetToInitialValueChangeDetection: Story = {
  render: () => {
    const [hasChanges, setHasChanges] = React.useState<boolean>(false);
    const [dirtyMap, setDirtyMap] = React.useState<string>("{}");

    const { formConfig } = useFormConfig({
      slice: FormSLice,
      reducer: ((state: FormRootState) => state.form) as any,
      inputs: {
        colorValue: {
          fieldType: "Input",
          validation: {
            required: true,
          },
        },
      },
    });

    return (
      <div data-testid="reset-change-story">
        <Form
          config={formConfig}
          onChange={(status) => {
            setHasChanges(status.hasChanges);
            setDirtyMap(JSON.stringify(status.inputsChanges));
          }}
        >
          <Input label="Resettable field" type="text" testId="reset-field" formconfig={formConfig.colorValue} />
        </Form>
        <div data-testid="reset-debug">
          <span data-testid="reset-has-changes">{hasChanges ? "true" : "false"}</span>
          <span data-testid="reset-inputs-changes">{dirtyMap}</span>
        </div>
      </div>
    );
  },

  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const user = userEvent.setup();
    const input = within(canvas.getByTestId("reset-field")).getByRole("textbox");

    await expect(input).toHaveValue("#3366cc");
    await user.clear(input);
    await user.type(input, "changed");
    await user.tab();
    await waitForFormUpdate(200);

    await expect(canvas.getByTestId("reset-has-changes")).toHaveTextContent("true");

    await user.clear(input);
    await user.type(input, "#3366cc");
    await user.tab();
    await waitForFormUpdate(200);

    await expect(canvas.getByTestId("reset-has-changes")).toHaveTextContent("false");
    await expect(canvas.getByTestId("reset-inputs-changes")).toHaveTextContent('"colorValue":false');
  },
};
