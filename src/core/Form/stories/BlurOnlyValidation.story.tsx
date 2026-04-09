import React from "react";
import { Form } from "@vanguard/Form/Form";
import { Input } from "@vanguard/Input/Input";
import { useFormConfig } from "@custom-hooks/useFormConfig";
import { within, expect, userEvent } from "storybook/test";
import { FormRootState, FormSLice } from "./bootstrap/form.test.slice";
import { Story, waitForFormUpdate } from "./_Form.default";

export const BlurOnlyValidation: Story = {
  render: () => {
    const [changeCount, setChangeCount] = React.useState(0);
    const [hasChanges, setHasChanges] = React.useState<boolean>(false);

    const { formConfig } = useFormConfig({
      slice: FormSLice,
      reducer: ((state: FormRootState) => state.form) as any,
      validateOn: "blur",
      inputs: {
        blurField: {
          fieldType: "Input",
          validation: {
            required: true,
          },
        },
      },
    });

    return (
      <div data-testid="blur-only-story">
        <Form
          config={formConfig}
          onChange={(status) => {
            setChangeCount((prev) => prev + 1);
            setHasChanges(status.hasChanges);
          }}
        >
          <Input label="Blur field" type="text" testId="blur-only-input" formconfig={formConfig.blurField} />
        </Form>
        <div data-testid="blur-only-debug">
          <span data-testid="blur-only-count">{changeCount}</span>
          <span data-testid="blur-only-has-changes">{hasChanges ? "true" : "false"}</span>
        </div>
      </div>
    );
  },

  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const user = userEvent.setup();
    const input = within(canvas.getByTestId("blur-only-input")).getByRole("textbox");
    const initialCount = Number(canvas.getByTestId("blur-only-count").textContent || "0");

    await user.click(input);
    await user.tab();
    await waitForFormUpdate(200);

    await expect(Number(canvas.getByTestId("blur-only-count").textContent || "0")).toBeGreaterThan(initialCount);
    await expect(canvas.getByTestId("blur-only-has-changes")).toHaveTextContent("false");
  },
};
