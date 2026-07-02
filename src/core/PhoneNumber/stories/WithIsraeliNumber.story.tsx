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

const IsraeliPhoneNumberValidation = () => {
  const { formConfig } = useFormConfig({
    inputs: {
      israeliPhone: {
        fieldType: "InputBase",
        validation: { validatePhoneNumberForCountry: testCountryCodes.IL },
      },
    },
  });

  return (
    <Form config={formConfig}>
      <PhoneNumber formConfig={formConfig.israeliPhone} countryCode={testCountryCodes.IL} />
    </Form>
  );
};

export const WithIsraeliNumber: Story = {
  render: () => <IsraeliPhoneNumberValidation />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const phoneNumberComponent = canvas.getByTestId("phoneNumberComponent");
    const phoneNumberInput = phoneNumberComponent.getElementsByTagName("input")[1] as HTMLInputElement;

    // Too short to be a valid Israeli number - should trigger the mask/format error
    await inputAndBlur(phoneNumberInput, "123");
    await expectErrorToContain(canvas, ErrorsKeys.INCORRECT_PHONE);

    // A properly formatted Israeli mobile number (national format, fits the 5#-###-#### mask) should clear the error
    await clearAndInputAndBlur(phoneNumberInput, testPhoneNumbers.israeli);
    await expectErrorToNotExist(canvas);
  },
};
