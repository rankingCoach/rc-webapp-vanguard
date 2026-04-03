import React from "react";
import { Form } from "@vanguard/Form/Form";
import { PhoneNumber } from "@vanguard/PhoneNumber/PhoneNumber";
import { useFormConfig } from "@custom-hooks/useFormConfig";
import { within, expect, userEvent } from "storybook/test";
import { useSelector } from "react-redux";
import { FormRootState, FormSLice } from "./bootstrap/form.test.slice";
import { Story, waitForFormUpdate } from "./_Form.default";
import { testCountryCodes } from "@vanguard/PhoneNumber/stories/_PhoneNumber.default";

const PHONE_NUMBER_INPUT_TEST_ID = "phone-number-input";

export const PhoneNumberStoreIntegration: Story = {
  render: () => {
    const [hasChanges, setHasChanges] = React.useState<boolean>(false);

    const { formConfig } = useFormConfig({
      slice: FormSLice,
      reducer: ((state: FormRootState) => state.form) as any,
      inputs: {
        phoneNumber: {
          fieldType: "Input",
          validation: {
            required: true,
            validatePhone: true,
          },
        },
      },
    });

    const phoneNumber = useSelector((state: FormRootState) => state.form.phoneNumber);

    return (
      <div data-testid="phone-integration-story">
        <Form
          config={formConfig}
          onChange={(status) => {
            setHasChanges(status.hasChanges);
          }}
        >
          <PhoneNumber
            phoneNumberBase={phoneNumber}
            formConfig={formConfig.phoneNumber}
            countryCode={testCountryCodes.IN}
            id={PHONE_NUMBER_INPUT_TEST_ID}
            testId={PHONE_NUMBER_INPUT_TEST_ID}
          />
        </Form>
        <div data-testid="phone-debug">
          <span data-testid="phone-has-changes">{hasChanges ? "true" : "false"}</span>
          <span data-testid="phone-store-value">{phoneNumber}</span>
        </div>
      </div>
    );
  },

  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const user = userEvent.setup();
    const storyRoot = canvas.getByTestId("phone-integration-story");
    const textboxes = within(storyRoot).getAllByRole("textbox");
    const phoneNumberField = textboxes[textboxes.length - 1] as HTMLInputElement;

    await expect(phoneNumberField).toBeInTheDocument();
    await user.clear(phoneNumberField);
    await user.type(phoneNumberField, "9123456789");
    await user.tab();
    await waitForFormUpdate(300);

    await expect(phoneNumberField.value.replace(/\D/g, "")).toContain("9123456789");
    await expect(canvas.getByTestId("phone-has-changes")).toHaveTextContent("true");
    await expect(canvas.getByTestId("phone-store-value").textContent?.replace(/\D/g, "")).toContain("9123456789");
  },
};
