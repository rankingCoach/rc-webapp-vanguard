import React from "react";
import { Form } from "@vanguard/Form/Form";
import { Input } from "@vanguard/Input/Input";
import { useFormConfig } from "@custom-hooks/useFormConfig";
import { within, expect, userEvent } from "storybook/test";
import { FormRootState, FormSLice } from "./bootstrap/form.test.slice";
import { Story, waitForFormUpdate } from "./_Form.default";

export const DirtyStateMultiFieldRevert: Story = {
  render: () => {
    const [hasChanges, setHasChanges] = React.useState<boolean>(false);
    const [dirtyMap, setDirtyMap] = React.useState<string>("{}");

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

    return (
      <div data-testid="dirty-multi-story">
        <Form
          config={formConfig}
          onChange={(status) => {
            setHasChanges(status.hasChanges);
            setDirtyMap(JSON.stringify(status.inputsChanges));
          }}
        >
          <Input label="Alias field" type="text" testId="dirty-multi-alias" formConfig={formConfig.aliasField} />
          <Input label="Text field" type="text" testId="dirty-multi-text" formconfig={formConfig.textValue} />
        </Form>

        <div data-testid="dirty-multi-debug">
          <span data-testid="dirty-multi-has-changes">{hasChanges ? "true" : "false"}</span>
          <span data-testid="dirty-multi-map">{dirtyMap}</span>
        </div>
      </div>
    );
  },

  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const user = userEvent.setup();
    const aliasInput = within(canvas.getByTestId("dirty-multi-alias")).getByRole("textbox");
    const textInput = within(canvas.getByTestId("dirty-multi-text")).getByRole("textbox");

    await user.type(aliasInput, "alias value");
    await user.tab();
    await waitForFormUpdate(200);

    await user.type(textInput, "text value");
    await user.tab();
    await waitForFormUpdate(200);

    await expect(canvas.getByTestId("dirty-multi-has-changes")).toHaveTextContent("true");
    await expect(canvas.getByTestId("dirty-multi-map")).toHaveTextContent('"aliasField":true');
    await expect(canvas.getByTestId("dirty-multi-map")).toHaveTextContent('"textValue":true');

    await user.clear(aliasInput);
    await user.tab();
    await waitForFormUpdate(200);

    await expect(canvas.getByTestId("dirty-multi-has-changes")).toHaveTextContent("true");
    await expect(canvas.getByTestId("dirty-multi-map")).toHaveTextContent('"aliasField":false');
    await expect(canvas.getByTestId("dirty-multi-map")).toHaveTextContent('"textValue":true');

    await user.clear(textInput);
    await user.tab();
    await waitForFormUpdate(200);

    await expect(canvas.getByTestId("dirty-multi-has-changes")).toHaveTextContent("false");
    await expect(canvas.getByTestId("dirty-multi-map")).toHaveTextContent('"aliasField":false');
    await expect(canvas.getByTestId("dirty-multi-map")).toHaveTextContent('"textValue":false');
  },
};
