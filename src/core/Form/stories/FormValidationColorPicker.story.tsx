import React from "react";
import { Form } from "@vanguard/Form/Form";
import { ColorPicker } from "@vanguard/ColorPicker/ColorPicker";
import { useFormConfig } from "@custom-hooks/useFormConfig";
import { within, expect, userEvent } from "storybook/test";
import { useSelector } from "react-redux";
import { FormRootState, FormSLice } from "./bootstrap/form.test.slice";
import { Story, createMockFormChange, waitForFormUpdate } from "./_Form.default";

export const FormValidationColorPicker: Story = {
  render: () => {
    const [isValid, setIsValid] = React.useState<boolean>(true);
    const [hasChanges, setHasChanges] = React.useState<boolean>(false);
    const [currentField, setCurrentField] = React.useState<string>('null');
    const [currentInputValue, setCurrentInputValue] = React.useState<string>('');
    
    const { formConfig } = useFormConfig({
      slice: FormSLice,
      reducer: ((s: FormRootState) => s.form) as any,
      inputs: {
        colorValue: {
          fieldType: "ColorPicker",
          validation: {
            validateHexColor: true,
            required: true,
          },
        },
      },
    });

    const currentStateValue = useSelector((state: FormRootState) => state.form.colorValue);

    const handleFormChange = (status: any) => {
      console.log('Current Form Status: ', status);
      setIsValid(status.isValid);
      setHasChanges(status.hasChanges);
      setCurrentField(status.currentConfig?.stateFieldName || 'null');
      // Track the current input value regardless of validation
      if (status.currentConfig?.stateFieldName === 'colorValue') {
        const currentInput = status.currentConfig?.getInputValue?.() || '';
        const currentStoredValue = status.currentConfig?.stateValue || '';
        console.log('ColorPicker debug values:', {
          statusFieldType: status.currentConfig?.fieldType,
          inputValue: currentInput,
          storedValue: currentStoredValue,
          runtimeValue: status.currentConfig?.getValue?.(),
        });
        setCurrentInputValue(currentInput);
      }
    };

    return (
      <div data-testid="form-showcase">
        <Form config={formConfig} onChange={handleFormChange}>
          <ColorPicker
            label="Pick a color"
            formconfig={formConfig.colorValue}
          />
        </Form>
        <div className="debug-section" data-testid="debug-section">
          <p>Form validation test for ColorPicker</p>
          <div data-testid="validation-status">
            <p><strong>Form Status:</strong></p>
            <p>Valid: <span data-testid="form-valid">{isValid ? 'true' : 'false'}</span></p>
            <p>Has Changes: <span data-testid="form-changes">{hasChanges ? 'true' : 'false'}</span></p>
            <p>Current Field: <span data-testid="form-config">{currentField}</span></p>
            <p>Current Input Value: <span data-testid="input-value">{currentInputValue || "(empty)"}</span></p>
            <p>Stored State Value: <span data-testid="state-value">{currentStateValue || "(empty)"}</span></p>
          </div>
        </div>
      </div>
    );
  },

  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const user = userEvent.setup({ delay: 10 });

    // Find the color picker text input (not the color input type="color")
    const textInput = canvasElement.querySelector('input[type="text"]') as HTMLInputElement;
    const validStatus = canvas.getByTestId("form-valid");
    const inputValue = canvas.getByTestId("input-value");
    const stateValue = canvas.getByTestId("state-value");
    
    // Test 1: Type incorrect color value
    await user.clear(textInput);
    await user.type(textInput, "invalid-color");
    await user.tab(); // Trigger blur to validate
    await waitForFormUpdate(200);

    // The form should be invalid at this point
    await expect(validStatus).toHaveTextContent("false");
    await expect(inputValue).toHaveTextContent("invalid-color");
    // State value should remain the initial valid value since invalid values aren't stored
    await expect(stateValue).toHaveTextContent("#3366cc");

    // Test 2: Type correct color value
    await user.clear(textInput);
    await user.type(textInput, "#ff0000");
    await user.tab(); // Trigger blur to validate
    await waitForFormUpdate(200);

    // The form should be valid now
    await expect(validStatus).toHaveTextContent("true");
    await expect(textInput).toHaveValue("#ff0000");
    await expect(inputValue).toHaveTextContent("#ff0000");
    await expect(stateValue).toHaveTextContent("#ff0000");
  },
};