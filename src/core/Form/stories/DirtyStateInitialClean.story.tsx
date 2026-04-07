import React from "react";
import { Form } from "@vanguard/Form/Form";
import { Input } from "@vanguard/Input/Input";
import { useFormConfig } from "@custom-hooks/useFormConfig";
import { within, expect } from "storybook/test";
import { FormRootState, FormSLice } from "./bootstrap/form.test.slice";
import { Story, waitForFormUpdate } from "./_Form.default";

export const DirtyStateInitialClean: Story = {
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
      },
    });

    return (
      <div data-testid="dirty-initial-story">
        <Form
          config={formConfig}
          onChange={(status) => {
            setHasChanges(status.hasChanges);
            setDirtyMap(JSON.stringify(status.inputsChanges));
          }}
        >
          <Input label="Alias field" type="text" testId="dirty-initial-input" formConfig={formConfig.aliasField} />
        </Form>

        <div data-testid="dirty-initial-debug">
          <span data-testid="dirty-initial-has-changes">{hasChanges ? "true" : "false"}</span>
          <span data-testid="dirty-initial-map">{dirtyMap}</span>
        </div>
      </div>
    );
  },

  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await waitForFormUpdate(200);

    await expect(canvas.getByTestId("dirty-initial-has-changes")).toHaveTextContent("false");
    await expect(canvas.getByTestId("dirty-initial-map")).toHaveTextContent("{}");
  },
};
