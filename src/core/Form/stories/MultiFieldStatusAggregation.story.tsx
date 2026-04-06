import React from "react";
import { Form } from "@vanguard/Form/Form";
import { Input } from "@vanguard/Input/Input";
import { useFormConfig } from "@custom-hooks/useFormConfig";
import { within, expect, userEvent } from "storybook/test";
import { FormRootState, FormSLice } from "./bootstrap/form.test.slice";
import { Story, waitForFormUpdate } from "./_Form.default";

export const MultiFieldStatusAggregation: Story = {
  render: () => {
    const [isValid, setIsValid] = React.useState<boolean>(true);
    const [inputsStatus, setInputsStatus] = React.useState<string>("{}");
    const [latestField, setLatestField] = React.useState<string>("null");

    const { formConfig } = useFormConfig({
      slice: FormSLice,
      reducer: ((state: FormRootState) => state.form) as any,
      inputs: {
        firstName: {
          fieldType: "Input",
          validation: {
            required: true,
            minLength: 2,
          },
        },
        emailAddress: {
          fieldType: "Input",
          validation: {
            required: true,
            email: true,
          },
        },
      },
    });

    return (
      <div data-testid="multi-field-story">
        <Form
          config={formConfig}
          onChange={(status) => {
            setIsValid(status.isValid);
            setInputsStatus(JSON.stringify(status.inputsStatus));
            setLatestField(status.currentConfig?.stateFieldName ?? "null");
          }}
        >
          <Input label="First name" type="text" testId="multi-first-name" formconfig={formConfig.firstName} />
          <Input label="Email address" type="email" testId="multi-email" formconfig={formConfig.emailAddress} />
        </Form>
        <div data-testid="multi-field-debug">
          <span data-testid="multi-field-valid">{isValid ? "true" : "false"}</span>
          <span data-testid="multi-field-status-map">{inputsStatus}</span>
          <span data-testid="multi-field-current">{latestField}</span>
        </div>
      </div>
    );
  },

  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const user = userEvent.setup();
    const firstNameInput = within(canvas.getByTestId("multi-first-name")).getByRole("textbox");
    const emailInput = within(canvas.getByTestId("multi-email")).getByRole("textbox");

    await user.clear(firstNameInput);
    await user.type(firstNameInput, "John");
    await user.tab();
    await waitForFormUpdate(200);

    await expect(canvas.getByTestId("multi-field-valid")).toHaveTextContent("true");
    await expect(canvas.getByTestId("multi-field-status-map")).toHaveTextContent('"firstName":true');
    await expect(canvas.getByTestId("multi-field-current")).toHaveTextContent("firstName");

    await user.clear(emailInput);
    await user.type(emailInput, "broken-email");
    await user.tab();
    await waitForFormUpdate(200);

    await expect(canvas.getByTestId("multi-field-valid")).toHaveTextContent("false");
    await expect(canvas.getByTestId("multi-field-status-map")).toHaveTextContent('"firstName":true');
    await expect(canvas.getByTestId("multi-field-status-map")).toHaveTextContent('"emailAddress":false');
    await expect(canvas.getByTestId("multi-field-current")).toHaveTextContent("emailAddress");
  },
};
