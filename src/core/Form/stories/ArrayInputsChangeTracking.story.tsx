import React from "react";
import { Form } from "@vanguard/Form/Form";
import { Input } from "@vanguard/Input/Input";
import { useFormConfig } from "@custom-hooks/useFormConfig";
import { within, expect, userEvent } from "storybook/test";
import { useSelector } from "react-redux";
import { FormRootState, FormSLice } from "./bootstrap/form.test.slice";
import { Story, waitForFormUpdate } from "./_Form.default";

export const ArrayInputsChangeTracking: Story = {
  render: () => {
    const [latestInputsChanges, setLatestInputsChanges] = React.useState<string>("{}");
    const [latestField, setLatestField] = React.useState<string>("null");

    const { formConfig } = useFormConfig({
      slice: FormSLice,
      reducer: ((state: FormRootState) => state.form) as any,
      inputs: {
        items: {
          fieldType: "Input",
          isArray: true,
          validation: {
            required: true,
            minLength: 3,
          },
        },
      },
    });

    const items = useSelector((state: FormRootState) => state.form.items);

    return (
      <div data-testid="array-inputs-story">
        <Form
          config={formConfig}
          onChange={(status) => {
            setLatestInputsChanges(JSON.stringify(status.inputsChanges));
            setLatestField(
              `${status.currentConfig?.stateFieldName ?? "null"}:${status.currentConfig?.arrayPosition ?? "none"}`,
            );
          }}
        >
          <Input label="Item 1" type="text" testId="array-item-0" formconfig={formConfig.items} />
          <Input label="Item 2" type="text" testId="array-item-1" formconfig={formConfig.items} />
        </Form>
        <div data-testid="array-debug">
          <span data-testid="array-latest-field">{latestField}</span>
          <span data-testid="array-inputs-changes">{latestInputsChanges}</span>
          <span data-testid="array-store-values">{JSON.stringify(items)}</span>
        </div>
      </div>
    );
  },

  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const user = userEvent.setup();
    const firstWrapper = canvas.getByTestId("array-item-0");
    const secondWrapper = canvas.getByTestId("array-item-1");
    const firstInput = within(firstWrapper).getByRole("textbox");
    const secondInput = within(secondWrapper).getByRole("textbox");

    await user.clear(firstInput);
    await user.type(firstInput, "updated first");
    await user.tab();
    await waitForFormUpdate(200);

    await expect(canvas.getByTestId("array-latest-field")).toHaveTextContent("items:0");
    await expect(canvas.getByTestId("array-inputs-changes")).toHaveTextContent('"items0":true');
    await expect(canvas.getByTestId("array-store-values")).toHaveTextContent("updated first");

    await user.clear(secondInput);
    await user.type(secondInput, "updated second");
    await user.tab();
    await waitForFormUpdate(200);

    await expect(canvas.getByTestId("array-latest-field")).toHaveTextContent("items:1");
    await expect(canvas.getByTestId("array-inputs-changes")).toHaveTextContent('"items1":true');
    await expect(canvas.getByTestId("array-store-values")).toHaveTextContent("updated second");
  },
};
