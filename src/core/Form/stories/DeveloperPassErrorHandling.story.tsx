import React from "react";
import { Form } from "@vanguard/Form/Form";
import { Input } from "@vanguard/Input/Input";
import { within, expect } from "storybook/test";
import { useFormConfig } from "@custom-hooks/useFormConfig";
import { FormRootState, FormSLice } from "./bootstrap/form.test.slice";
import { Story, waitForFormUpdate } from "./_Form.default";

export const DeveloperPassErrorHandling: Story = {
  render: () => {
    const [isValid, setIsValid] = React.useState<boolean>(true);
    const [errorMessage, setErrorMessage] = React.useState<string>("(empty)");

    const { formConfig } = useFormConfig({
      slice: FormSLice,
      reducer: ((state: FormRootState) => state.form) as any,
      inputs: {
        items: {
          fieldType: "Input",
          isArray: true,
          passError: [undefined, "Second item backend error"],
          validation: {
            required: true,
          },
        },
      },
    });

    React.useEffect(() => {
      const configuredError = Array.isArray(formConfig.items?.passError) ? formConfig.items.passError[1] : undefined;
      setErrorMessage(configuredError ?? "(empty)");
    }, [formConfig]);

    return (
      <div data-testid="developer-pass-error-story">
        <Form
          config={formConfig}
          onChange={(status) => {
            setIsValid(status.isValid);
          }}
        >
          <Input label="First array item" type="text" testId="pass-error-0" formconfig={formConfig.items} />
          <Input label="Second array item" type="text" testId="pass-error-1" formconfig={formConfig.items} />
        </Form>
        <div data-testid="pass-error-debug">
          <span data-testid="pass-error-valid">{isValid ? "true" : "false"}</span>
          <span data-testid="pass-error-message">{errorMessage}</span>
        </div>
      </div>
    );
  },

  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitForFormUpdate(200);

    await expect(canvas.getByTestId("pass-error-valid")).toHaveTextContent("false");
    await expect(canvas.getByTestId("pass-error-message")).toHaveTextContent("Second item backend error");
  },
};
