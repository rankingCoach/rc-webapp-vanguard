import React from "react";
import { Form } from "@vanguard/Form/Form";
import { Input } from "@vanguard/Input/Input";
import { useFormConfig } from "@custom-hooks/useFormConfig";
import { within, expect, userEvent } from "storybook/test";
import { useSelector } from "react-redux";
import { FormRootState, FormSLice } from "./bootstrap/form.test.slice";
import { Story, waitForFormUpdate } from "./_Form.default";

export const MixedConfigKeyNesting: Story = {
  render: () => {
    const [latestField, setLatestField] = React.useState<string>("null");

    const { formConfig } = useFormConfig({
      slice: FormSLice,
      reducer: ((state: FormRootState) => state.form) as any,
      inputs: {
        aliasField: {
          fieldType: "Input",
        },
        textValue: {
          fieldType: "Input",
        },
      },
    });

    const aliasField = useSelector((state: FormRootState) => state.form.aliasField);
    const textValue = useSelector((state: FormRootState) => state.form.textValue);

    return (
      <div data-testid="mixed-config-story">
        <Form
          config={formConfig}
          onChange={(status) => {
            setLatestField(status.currentConfig?.stateFieldName ?? "null");
          }}
        >
          <section data-testid="mixed-wrapper-1">
            <div data-testid="mixed-wrapper-2">
              <Input label="Nested text field" type="text" testId="mixed-text-field" formconfig={formConfig.textValue} />
            </div>
          </section>

          <article data-testid="mixed-wrapper-3">
            <Input label="Alias field" type="text" testId="mixed-alias-field" formConfig={formConfig.aliasField} />
          </article>
        </Form>

        <div data-testid="mixed-config-debug">
          <span data-testid="mixed-config-current">{latestField}</span>
          <span data-testid="mixed-config-text">{textValue || "(empty)"}</span>
          <span data-testid="mixed-config-alias">{aliasField || "(empty)"}</span>
        </div>
      </div>
    );
  },

  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const user = userEvent.setup();
    const textInput = within(canvas.getByTestId("mixed-text-field")).getByRole("textbox");
    const aliasInput = within(canvas.getByTestId("mixed-alias-field")).getByRole("textbox");

    await user.clear(textInput);
    await user.type(textInput, "nested text");
    await user.tab();
    await waitForFormUpdate(200);

    await expect(canvas.getByTestId("mixed-config-current")).toHaveTextContent("textValue");
    await expect(canvas.getByTestId("mixed-config-text")).toHaveTextContent("nested text");

    await user.clear(aliasInput);
    await user.type(aliasInput, "alias via camel");
    await user.tab();
    await waitForFormUpdate(200);

    await expect(canvas.getByTestId("mixed-config-current")).toHaveTextContent("aliasField");
    await expect(canvas.getByTestId("mixed-config-text")).toHaveTextContent("nested text");
    await expect(canvas.getByTestId("mixed-config-alias")).toHaveTextContent("alias via camel");
  },
};
