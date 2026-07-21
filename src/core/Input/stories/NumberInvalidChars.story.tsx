import { expect, userEvent, within } from "storybook/test";
import { Story } from "./_Input.default";

/**
 * Type="number" must reject scientific-notation chars (e/E)
 * and a non-leading +/- at input time, while a leading sign into an empty
 * field is allowed (negative numbers). Native number inputs accept e/E
 * anywhere, which reports value="" for the invalid intermediate state. After
 * the fix the keys are blocked and the numeric value is preserved.
 */
export const NumberInvalidChars: Story = {
  args: {
    type: "number",
    label: "Service price",
    testId: "number-invalid-chars",
  },
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole("spinbutton") as HTMLInputElement;
    const user = userEvent.setup();

    await user.click(input);
    await user.type(input, "12");
    await expect(input).toHaveValue(12);

    // e / E (scientific notation) blocked -> value stays 12
    await user.type(input, "e");
    await expect(input).toHaveValue(12);
    await user.type(input, "E");
    await expect(input).toHaveValue(12);

    // non-leading sign blocked -> value stays 12
    await user.type(input, "-");
    await expect(input).toHaveValue(12);

    // decimal still works
    await user.type(input, ".5");
    await expect(input).toHaveValue(12.5);

    // leading sign into an empty field allowed -> negative number
    await user.clear(input);
    await user.type(input, "-5");
    await expect(input).toHaveValue(-5);
  },
};