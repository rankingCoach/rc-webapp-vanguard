import React from "react";
import { Form } from "@vanguard/Form/Form";
import { Input } from "@vanguard/Input/Input";
import { useFormConfig } from "@custom-hooks/useFormConfig";
import { within, expect, userEvent } from "storybook/test";
import { FormRootState, FormSLice } from "./bootstrap/form.test.slice";
import { Story, waitForFormUpdate } from "./_Form.default";

export const FormMethodsLifecycle: Story = {
  render: () => {
    const [allData, setAllData] = React.useState<string>("{}");
    const [changedData, setChangedData] = React.useState<string>("{}");
    const [hasChanges, setHasChanges] = React.useState<boolean>(false);

    const formMethods = useFormConfig({
      slice: FormSLice,
      reducer: ((state: FormRootState) => state.form) as any,
      inputs: {
        aliasField: {
          fieldType: "Input",
        },
        textValue: {
          fieldType: "Input",
          validation: {
            required: true,
          },
        },
      },
    });

    return (
      <div data-testid="form-methods-story">
        <Form
          config={formMethods.formConfig}
          onChange={(status) => {
            setHasChanges(status.hasChanges);
          }}
        >
          <Input label="Alias field" type="text" testId="methods-alias" formConfig={formMethods.formConfig.aliasField} />
          <Input label="Text field" type="text" testId="methods-text" formconfig={formMethods.formConfig.textValue} />
        </Form>

        <div data-testid="form-methods-actions">
          <button type="button" data-testid="snapshot-all" onClick={() => setAllData(JSON.stringify(formMethods.getData()))}>
            snapshot-all
          </button>
          <button
            type="button"
            data-testid="snapshot-changed"
            onClick={() => setChangedData(JSON.stringify(formMethods.getChangedData()))}
          >
            snapshot-changed
          </button>
          <button
            type="button"
            data-testid="reset-form"
            onClick={() => {
              formMethods.resetForm();
            }}
          >
            reset-form
          </button>
        </div>

        <div data-testid="form-methods-debug">
          <span data-testid="form-methods-all">{allData}</span>
          <span data-testid="form-methods-changed">{changedData}</span>
          <span data-testid="form-methods-has-changes">{hasChanges ? "true" : "false"}</span>
        </div>
      </div>
    );
  },

  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const user = userEvent.setup();
    const aliasInput = within(canvas.getByTestId("methods-alias")).getByRole("textbox");
    const textInput = within(canvas.getByTestId("methods-text")).getByRole("textbox");

    await user.clear(textInput);
    await user.type(textInput, "draft");
    await user.tab();
    await waitForFormUpdate(200);

    await user.click(canvas.getByTestId("snapshot-all"));
    await user.click(canvas.getByTestId("snapshot-changed"));

    await expect(canvas.getByTestId("form-methods-all")).toHaveTextContent('"textValue":"draft"');
    await expect(canvas.getByTestId("form-methods-all")).toHaveTextContent('"aliasField":""');
    await expect(canvas.getByTestId("form-methods-changed")).toHaveTextContent('"textValue":"draft"');
    await expect(canvas.getByTestId("form-methods-has-changes")).toHaveTextContent("true");

    await user.clear(aliasInput);
    await user.type(aliasInput, "nickname");
    await user.tab();
    await waitForFormUpdate(200);

    await user.click(canvas.getByTestId("snapshot-changed"));

    await expect(canvas.getByTestId("form-methods-changed")).toHaveTextContent('"textValue":"draft"');
    await expect(canvas.getByTestId("form-methods-changed")).toHaveTextContent('"aliasField":"nickname"');

    await user.click(canvas.getByTestId("reset-form"));
    await waitForFormUpdate(200);
    await user.click(canvas.getByTestId("snapshot-all"));
    await user.click(canvas.getByTestId("snapshot-changed"));

    await expect(aliasInput).toHaveValue("");
    await expect(textInput).toHaveValue("");
    await expect(canvas.getByTestId("form-methods-all")).toHaveTextContent('"textValue":""');
    await expect(canvas.getByTestId("form-methods-all")).toHaveTextContent('"aliasField":""');
    await expect(canvas.getByTestId("form-methods-changed")).toHaveTextContent("{}");
  },
};
