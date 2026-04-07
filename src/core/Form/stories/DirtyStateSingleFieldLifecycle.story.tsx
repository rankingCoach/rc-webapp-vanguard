import React from "react";
import { Form } from "@vanguard/Form/Form";
import { Input } from "@vanguard/Input/Input";
import { useFormConfig } from "@custom-hooks/useFormConfig";
import { within, expect, userEvent } from "storybook/test";
import { FormRootState, FormSLice } from "./bootstrap/form.test.slice";
import { Story, waitForFormUpdate } from "./_Form.default";

export const DirtyStateSingleFieldLifecycle: Story = {
  render: () => {
    const [hasChanges, setHasChanges] = React.useState<boolean>(false);
    const [dirtyMap, setDirtyMap] = React.useState<string>("{}");
    const [currentField, setCurrentField] = React.useState<string>("null");

    const { formConfig } = useFormConfig({
      slice: FormSLice,
      reducer: ((state: FormRootState) => state.form) as any,
      inputs: {
        colorValue: {
          fieldType: "Input",
        },
      },
    });

    return (
      <div data-testid="dirty-single-story">
        <Form
          config={formConfig}
          onChange={(status) => {
            setHasChanges(status.hasChanges);
            setDirtyMap(JSON.stringify(status.inputsChanges));
            setCurrentField(status.currentConfig?.stateFieldName ?? "null");
          }}
        >
          <Input label="Color field" type="text" testId="dirty-single-input" formconfig={formConfig.colorValue} />
        </Form>

        <div data-testid="dirty-single-debug">
          <span data-testid="dirty-single-has-changes">{hasChanges ? "true" : "false"}</span>
          <span data-testid="dirty-single-map">{dirtyMap}</span>
          <span data-testid="dirty-single-current">{currentField}</span>
        </div>
      </div>
    );
  },

  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const user = userEvent.setup();
    const input = within(canvas.getByTestId("dirty-single-input")).getByRole("textbox");

    await expect(input).toHaveValue("#3366cc");

    await user.clear(input);
    await user.type(input, "manual");
    await user.tab();
    await waitForFormUpdate(200);

    await expect(canvas.getByTestId("dirty-single-has-changes")).toHaveTextContent("true");
    await expect(canvas.getByTestId("dirty-single-map")).toHaveTextContent('"colorValue":true');
    await expect(canvas.getByTestId("dirty-single-current")).toHaveTextContent("colorValue");

    await user.clear(input);
    await user.type(input, "#3366cc");
    await user.tab();
    await waitForFormUpdate(200);

    await expect(canvas.getByTestId("dirty-single-has-changes")).toHaveTextContent("false");
    await expect(canvas.getByTestId("dirty-single-map")).toHaveTextContent('"colorValue":false');
  },
};
