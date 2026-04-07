import React from "react";
import { Form } from "@vanguard/Form/Form";
import { Input } from "@vanguard/Input/Input";
import { useFormConfig } from "@custom-hooks/useFormConfig";
import { within, expect, userEvent } from "storybook/test";
import { FormRootState, FormSLice } from "./bootstrap/form.test.slice";
import { Story, waitForFormUpdate } from "./_Form.default";

export const DirtyStateArrayLifecycle: Story = {
  render: () => {
    const [hasChanges, setHasChanges] = React.useState<boolean>(false);
    const [dirtyMap, setDirtyMap] = React.useState<string>("{}");
    const [latestField, setLatestField] = React.useState<string>("null");

    const { formConfig } = useFormConfig({
      slice: FormSLice,
      reducer: ((state: FormRootState) => state.form) as any,
      inputs: {
        items: {
          fieldType: "Input",
          isArray: true,
        },
      },
    });

    return (
      <div data-testid="dirty-array-story">
        <Form
          config={formConfig}
          onChange={(status) => {
            setHasChanges(status.hasChanges);
            setDirtyMap(JSON.stringify(status.inputsChanges));
            setLatestField(`${status.currentConfig?.stateFieldName ?? "null"}:${status.currentConfig?.arrayPosition ?? "none"}`);
          }}
        >
          <Input label="Array item 1" type="text" testId="dirty-array-0" formconfig={formConfig.items} />
          <Input label="Array item 2" type="text" testId="dirty-array-1" formconfig={formConfig.items} />
        </Form>

        <div data-testid="dirty-array-debug">
          <span data-testid="dirty-array-has-changes">{hasChanges ? "true" : "false"}</span>
          <span data-testid="dirty-array-map">{dirtyMap}</span>
          <span data-testid="dirty-array-current">{latestField}</span>
        </div>
      </div>
    );
  },

  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const user = userEvent.setup();

    let firstInput = within(canvas.getByTestId("dirty-array-0")).getByRole("textbox");
    await user.clear(firstInput);
    await user.type(firstInput, "updated first");
    await user.tab();
    await waitForFormUpdate(200);

    await expect(canvas.getByTestId("dirty-array-has-changes")).toHaveTextContent("true");
    await expect(canvas.getByTestId("dirty-array-map")).toHaveTextContent('"items":true');
    await expect(canvas.getByTestId("dirty-array-map")).toHaveTextContent('"items0":true');
    await expect(canvas.getByTestId("dirty-array-current")).toHaveTextContent("items:0");

    firstInput = within(canvas.getByTestId("dirty-array-0")).getByRole("textbox");
    await user.clear(firstInput);
    await user.type(firstInput, "first item");
    await user.tab();
    await waitForFormUpdate(200);

    await expect(canvas.getByTestId("dirty-array-map")).toHaveTextContent('"items0":false');
    await expect(canvas.getByTestId("dirty-array-has-changes")).toHaveTextContent("false");

    const secondInput = within(canvas.getByTestId("dirty-array-1")).getByRole("textbox");
    await user.clear(secondInput);
    await user.type(secondInput, "changed second");
    await user.tab();
    await waitForFormUpdate(200);

    await expect(canvas.getByTestId("dirty-array-has-changes")).toHaveTextContent("true");
    await expect(canvas.getByTestId("dirty-array-map")).toHaveTextContent('"items1":true');
    await expect(canvas.getByTestId("dirty-array-current")).toHaveTextContent("items:1");
  },
};
