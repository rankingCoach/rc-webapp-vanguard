import {
  clearAndInputAndBlur,
  expectErrorToContain,
  expectErrorToNotExist,
  getTestElements,
  inputAndBlur,
  ValidationTestWrapper,
} from "@vanguard/Input/stories";
import { Story } from "./_Input.default";
import { within, expect } from "storybook/test";
import { writeInInput } from "@test-utils/input-test-utils";
import { ErrorsKeys } from "@helpers/validators/valid-input/validate-input-errors.ts";

export const EmailValidation: Story = {
  render: (args) => (
    <ValidationTestWrapper
      validationConfig={{ validateEmail: true }}
      inputType="email"
      label="Email Address"
      placeholder="Enter a valid email"
      {...args}
    />
  ),
  play: async ({ canvasElement }) => {
    const { canvas, input } = await getTestElements(canvasElement);

    // Test short input shows error
    await inputAndBlur(input, "invalid-email");
    await expectErrorToContain(canvas, ErrorsKeys.INVALID_EMAIL);

    // Test valid length clears error
    await clearAndInputAndBlur(input, "validemail@email.ro");
    await expectErrorToNotExist(canvas);

    // Internationalised (IDN) domains are valid too
    await clearAndInputAndBlur(input, "info@die-bänd.com");
    await expectErrorToNotExist(canvas);
  },
};
