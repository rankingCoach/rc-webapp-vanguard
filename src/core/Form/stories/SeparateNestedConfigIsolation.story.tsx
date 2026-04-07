import React from "react";
import { Form } from "@vanguard/Form/Form";
import { Input } from "@vanguard/Input/Input";
import { useFormConfig } from "@custom-hooks/useFormConfig";
import { within, expect, userEvent } from "storybook/test";
import { useSelector } from "react-redux";
import { FormRootState, FormSLice } from "./bootstrap/form.test.slice";
import { Story, waitForFormUpdate } from "./_Form.default";

export const SeparateNestedConfigIsolation: Story = {
  render: () => {
    const [outerCount, setOuterCount] = React.useState(0);
    const [innerCount, setInnerCount] = React.useState(0);
    const [outerField, setOuterField] = React.useState("null");

    const outerForm = useFormConfig({
      slice: FormSLice,
      reducer: ((state: FormRootState) => state.form) as any,
      inputs: {
        textValue: {
          fieldType: "Input",
        },
      },
    });

    const innerForm = useFormConfig({
      slice: FormSLice,
      reducer: ((state: FormRootState) => state.form) as any,
      inputs: {
        aliasField: {
          fieldType: "Input",
        },
      },
    });

    const textValue = useSelector((state: FormRootState) => state.form.textValue);
    const aliasField = useSelector((state: FormRootState) => state.form.aliasField);

    return (
      <div data-testid="separate-nested-story">
        <Form
          config={outerForm.formConfig}
          onChange={(status) => {
            setOuterCount((prev) => prev + 1);
            setOuterField(status.currentConfig?.stateFieldName ?? "null");
          }}
        >
          <Input label="Outer field" type="text" testId="separate-outer-input" formconfig={outerForm.formConfig.textValue} />
          <Form
            config={innerForm.formConfig}
            onChange={() => {
              setInnerCount((prev) => prev + 1);
            }}
          >
            <Input label="Inner field" type="text" testId="separate-inner-input" formConfig={innerForm.formConfig.aliasField} />
          </Form>
        </Form>

        <div data-testid="separate-nested-debug">
          <span data-testid="separate-outer-count">{outerCount}</span>
          <span data-testid="separate-inner-count">{innerCount}</span>
          <span data-testid="separate-outer-field">{outerField}</span>
          <span data-testid="separate-outer-store">{textValue || "(empty)"}</span>
          <span data-testid="separate-inner-store">{aliasField || "(empty)"}</span>
        </div>
      </div>
    );
  },

  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const user = userEvent.setup();
    const innerInput = within(canvas.getByTestId("separate-inner-input")).getByRole("textbox");
    const outerCountBefore = Number(canvas.getByTestId("separate-outer-count").textContent || "0");
    const innerCountBefore = Number(canvas.getByTestId("separate-inner-count").textContent || "0");

    await user.clear(innerInput);
    await user.type(innerInput, "inner only");
    await user.tab();
    await waitForFormUpdate(200);

    await expect(Number(canvas.getByTestId("separate-outer-count").textContent || "0")).toBeGreaterThan(outerCountBefore);
    await expect(Number(canvas.getByTestId("separate-inner-count").textContent || "0")).toBe(innerCountBefore);
    await expect(canvas.getByTestId("separate-outer-field")).toHaveTextContent("aliasField");
    await expect(canvas.getByTestId("separate-outer-store")).toHaveTextContent("(empty)");
    await expect(canvas.getByTestId("separate-inner-store")).toHaveTextContent("inner only");
  },
};
