import { expect, userEvent, within } from "storybook/test";
import { Story } from "./_Input.default";

/**
 * The onPaste handler (numericPasteIsInvalid) rejects a paste that contains
 * scientific-notation chars (e/E), a non-leading sign (4+1), or a leading sign
 * while the field already has content (pasting "+3" onto "-2" would give the
 * invalid "-2+3"). Clean numeric pastes and a leading sign into an empty field
 * are accepted.
 */
export const NumberPasteBlock: Story = {
  args: {
    type: "number",
    label: "Service price",
    testId: "number-paste-block",
  },
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole("spinbutton") as HTMLInputElement;
    const user = userEvent.setup();

    // scientific char anywhere -> whole paste rejected, value stays empty
    await user.click(input);
    await user.paste("12e3");
    await expect(input).toHaveValue(null);

    // non-leading sign -> whole paste rejected
    await user.paste("4+1");
    await expect(input).toHaveValue(null);

    // clean numeric paste accepted
    await user.paste("123");
    await expect(input).toHaveValue(123);

    // leading-sign paste accepted -> negative number
    await user.clear(input);
    await user.paste("-5");
    await expect(input).toHaveValue(-5);

    // leading-sign paste onto existing content rejected (would append to -2+3)
    await user.paste("+3");
    await expect(input).toHaveValue(-5);
  },
};