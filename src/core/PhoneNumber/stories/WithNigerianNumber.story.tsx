import { ErrorsKeys } from "@helpers/validators/valid-input/validate-input-errors.ts";
import { useFormConfig } from "@custom-hooks/useFormConfig";
import {
  clearAndInputAndBlur,
  expectErrorToContain,
  expectErrorToNotExist,
  inputAndBlur,
} from "@vanguard/Input/stories";
import { Form } from "@vanguard/Form/Form.tsx";
import React from "react";
import { within } from "storybook/test";

import { PhoneNumber } from "../PhoneNumber";
import { Story, testCountryCodes, testPhoneNumbers } from "./_PhoneNumber.default";

const NigerianPhoneNumberValidation = () => {
  const { formConfig } = useFormConfig({
    inputs: {
      nigerianPhone: {
        fieldType: "InputBase",
        validation: { validatePhoneNumberForCountry: testCountryCodes.NG },
      },
    },
  });

  return (
    <Form config={formConfig}>
      <PhoneNumber formConfig={formConfig.nigerianPhone} countryCode={testCountryCodes.NG} />
    </Form>
  );
};

export const WithNigerianNumber: Story = {
  render: () => <NigerianPhoneNumberValidation />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const phoneNumberComponent = canvas.getByTestId("phoneNumberComponent");
    const phoneNumberInput = phoneNumberComponent.getElementsByTagName("input")[1] as HTMLInputElement;

    // Too short to be a valid Nigerian number - should trigger the mask/format error
    await inputAndBlur(phoneNumberInput, "123");
    await expectErrorToContain(canvas, ErrorsKeys.INCORRECT_PHONE);

    // A properly formatted Nigerian number should clear the error
    await clearAndInputAndBlur(phoneNumberInput, testPhoneNumbers.nigerian);
    await expectErrorToNotExist(canvas);
  },
};
