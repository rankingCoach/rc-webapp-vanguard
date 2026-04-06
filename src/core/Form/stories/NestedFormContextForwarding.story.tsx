import React from "react";
import { Form } from "@vanguard/Form/Form";
import { Input } from "@vanguard/Input/Input";
import { useFormConfig } from "@custom-hooks/useFormConfig";
import { within, expect, userEvent } from "storybook/test";
import { FormRootState, FormSLice } from "./bootstrap/form.test.slice";
import { Story, waitForFormUpdate } from "./_Form.default";

export const NestedFormContextForwarding: Story = {
  render: () => {
    const [outerCount, setOuterCount] = React.useState(0);
    const [innerCount, setInnerCount] = React.useState(0);

    const { formConfig } = useFormConfig({
      slice: FormSLice,
      reducer: ((state: FormRootState) => state.form) as any,
      inputs: {
        nestedValue: {
          fieldType: "Input",
          validation: {
            required: true,
          },
        },
      },
    });

    return (
      <div data-testid="nested-form-context-story">
        <Form
          config={formConfig}
          onChange={() => {
            setOuterCount((prev) => prev + 1);
          }}
        >
          <Form
            config={formConfig}
            onChange={() => {
              setInnerCount((prev) => prev + 1);
            }}
          >
            <Input label="Nested form field" type="text" testId="nested-form-context-input" formconfig={formConfig.nestedValue} />
          </Form>
        </Form>
        <div data-testid="nested-form-context-debug">
          <span data-testid="nested-form-context-outer">{outerCount}</span>
          <span data-testid="nested-form-context-inner">{innerCount}</span>
        </div>
      </div>
    );
  },

  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const user = userEvent.setup();
    const input = within(canvas.getByTestId("nested-form-context-input")).getByRole("textbox");

    const initialOuterCount = Number(canvas.getByTestId("nested-form-context-outer").textContent || "0");
    const initialInnerCount = Number(canvas.getByTestId("nested-form-context-inner").textContent || "0");

    await user.clear(input);
    await user.type(input, "forward me");
    await user.tab();
    await waitForFormUpdate(200);

    await expect(Number(canvas.getByTestId("nested-form-context-outer").textContent || "0")).toBeGreaterThan(initialOuterCount);
    await expect(Number(canvas.getByTestId("nested-form-context-inner").textContent || "0")).toBe(initialInnerCount);
  },
};
