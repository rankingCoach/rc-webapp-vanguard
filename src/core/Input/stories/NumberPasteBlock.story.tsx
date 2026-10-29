import { expect, userEvent, within } from "storybook/test";
import { Story } from "./_Input.default";
import { dispatchBeforeInput, nativeInsert } from "./shared/test-helpers";

/**
 * Pastes into type="number" are decided on beforeinput (insertFromPaste). A
 * paste is rejected when it contains scientific-notation chars (e/E), a
 * non-leading or second sign (4+1, --3), or a sign while one already leads (a
 * lone "-" reports value="" with badInput). Number inputs expose no caret, so a
 * signed number pasted into a value is let through and reverted if the result
 * isn't a number ("-3" before "12" -> -312, after it -> 12 kept).
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

    // scientific char / inner or second sign -> whole paste rejected, value stays empty
    await user.click(input);
    await user.paste("12e3");
    await expect(input).toHaveValue(null);
    await user.paste("4+1");
    await expect(input).toHaveValue(null);
    await user.paste("--3");
    await expect(input).toHaveValue(null);

    // clean numeric paste accepted
    await user.paste("123");
    await expect(input).toHaveValue(123);

    // leading-sign paste into an empty field accepted -> negative number
    await user.clear(input);
    await user.paste("-5");
    await expect(input).toHaveValue(-5);

    // select "5", paste "-3" -> -3
    await user.clear(input);
    await user.type(input, "5");
    await user.keyboard("{Control>}a{/Control}");
    await user.paste("-3");
    await expect(input).toHaveValue(-3);

    // cursor before "12", paste "-3" -> -312
    await user.clear(input);
    await user.type(input, "12");
    await user.keyboard("{Home}");
    await user.paste("-3");
    await expect(input).toHaveValue(-312);

    // scientific char onto content rejected
    await user.clear(input);
    await user.type(input, "12");
    await user.paste("1e5");
    await expect(input).toHaveValue(12);

    // "-3" after "12" gives no number -> reverted to 12
    await user.paste("-3");
    await expect(input).toHaveValue(12);

    // lone "-" (badInput): pasting "-3" rejected (no "--3"), "3" accepted -> -3
    input.value = "";
    nativeInsert(input, "-");
    await expect(dispatchBeforeInput(input, "insertFromPaste", "-3")).toBe(true);
    await expect(input.validity.badInput).toBe(true);
    await expect(dispatchBeforeInput(input, "insertFromPaste", "3")).toBe(false);
    nativeInsert(input, "3");
    await expect(input).toHaveValue(-3);

    // drop with the text only in dataTransfer (data null) is checked too
    const dataTransfer = new DataTransfer();
    dataTransfer.setData("text/plain", "1e5");
    const drop = new InputEvent("beforeinput", {
      inputType: "insertFromDrop",
      dataTransfer,
      cancelable: true,
      bubbles: true,
    });
    input.dispatchEvent(drop);
    await expect(drop.defaultPrevented).toBe(true);
  },
};
