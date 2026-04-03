import React from "react";
import { Form } from "@vanguard/Form/Form";
import { Input } from "@vanguard/Input/Input";
import { useFormConfig } from "@custom-hooks/useFormConfig";
import { within, expect, userEvent } from "storybook/test";
import { useSelector } from "react-redux";
import { FormRootState, FormSLice } from "./bootstrap/form.test.slice";
import { Story, createMockFormChange, waitForFormUpdate } from "./_Form.default";

export const WithOnChange: Story = {
  render: () => {
    const [changeCount, setChangeCount] = React.useState(0);
    const [lastStatus, setLastStatus] = React.useState<any>(null);

    const { formConfig } = useFormConfig({
      slice: FormSLice,
      reducer: ((s: FormRootState) => s.form) as any,
      inputs: {
        testField: {
          fieldType: "Input",
          validation: {
            required: true,
          },
        },
      },
    });

    const handleFormChange = (status: any) => {
      setChangeCount(prev => prev + 1);
      setLastStatus(status);
    };

    return (
      <div data-testid="onchange-test">
        <Form config={formConfig} onChange={handleFormChange}>
          <Input
            label="Test Input"
            type="text"
            formconfig={formConfig.testField}
            testId="test-input"
          />
        </Form>
        <div data-testid="change-info">
          <p>Change count: <span data-testid="change-count">{changeCount}</span></p>
          <p>Has changes: <span data-testid="has-changes">{lastStatus?.hasChanges ? 'true' : 'false'}</span></p>
          <p>Is valid: <span data-testid="is-valid">{lastStatus?.isValid ? 'true' : 'false'}</span></p>
        </div>
      </div>
    );
  },

  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Initial state - form may trigger onChange on mount due to validation
    const initialCount = canvas.getByTestId("change-count").textContent;
    await expect(canvas.getByTestId("has-changes")).toHaveTextContent("false");
    await expect(canvas.getByTestId("is-valid")).toHaveTextContent("true");

    // Find and interact with input
    const inputWrapper = canvas.getByTestId("test-input");
    const input = within(inputWrapper).getByRole("textbox") as HTMLInputElement;
    await expect(input).toBeInTheDocument();

    // Type in the input
    await userEvent.clear(input);
    await userEvent.type(input, "test value");
    await userEvent.tab(); // Trigger blur

    await waitForFormUpdate(200);

    // Verify onChange was called (count should be higher than initial)
    const finalCount = parseInt(canvas.getByTestId("change-count").textContent || "0");
    await expect(finalCount).toBeGreaterThan(parseInt(initialCount || "0"));
    await expect(canvas.getByTestId("has-changes")).toHaveTextContent("true");
    await expect(canvas.getByTestId("is-valid")).toHaveTextContent("true");
  },
};
