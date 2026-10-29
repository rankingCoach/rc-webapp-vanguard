import { expect, userEvent, waitFor, within } from "storybook/test";
import { Story } from "./_Input.default";
import { dispatchBeforeInput, nativeInsert } from "./shared/test-helpers";

/**
 * Type="number" must reject scientific-notation chars (e/E) at input time, on
 * desktop keyboards as well as mobile/IME keyboards (decided on beforeinput).
 * Number inputs expose no caret or selection, so a sign is decided from the
 * inserted text, the value and badInput: a sign is allowed into an empty field,
 * over a selected value or before the digits, and blocked while a sign already
 * leads (a lone "-" reports value="" with badInput). A sign typed after the
 * digits ("12-") can't be told apart from those cases and is left to the
 * browser (the next sign is blocked).
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

    // decimal still works
    await user.type(input, ".5");
    await expect(input).toHaveValue(12.5);

    // cursor before "12", type "-" -> -12
    await user.clear(input);
    await user.type(input, "12");
    await user.keyboard("{Home}-");
    await expect(input).toHaveValue(-12);

    // select "5", type "-" -> shows "-", then "5" -> -5
    await user.clear(input);
    await user.type(input, "5");
    await user.keyboard("{Control>}a{/Control}-");
    await expect(input).toHaveValue(null);
    await user.type(input, "5");
    await expect(input).toHaveValue(-5);

    // leading sign into an empty field allowed -> negative number
    await user.clear(input);
    await user.type(input, "-5");
    await expect(input).toHaveValue(-5);

    // mobile keyboards (keydown "Unidentified"/"Process"): beforeinput decides
    await user.clear(input);
    await user.type(input, "12");
    await expect(dispatchBeforeInput(input, "insertText", "e")).toBe(true);
    await expect(dispatchBeforeInput(input, "insertText", "5")).toBe(false);
    await expect(input).toHaveValue(12);

    // lone "-" (badInput): a second sign is blocked, a digit is not
    input.value = "";
    nativeInsert(input, "-");
    await expect(input.validity.badInput).toBe(true);
    await expect(dispatchBeforeInput(input, "insertText", "-")).toBe(true);
    await expect(dispatchBeforeInput(input, "insertText", "+")).toBe(true);
    await expect(dispatchBeforeInput(input, "insertText", "3")).toBe(false);
    nativeInsert(input, "3");
    await expect(input).toHaveValue(-3);

    // IME composition can't be cancelled: an "e" is reverted on compositionend
    input.value = "";
    nativeInsert(input, "12");
    await expect(input).toHaveValue(12);
    input.dispatchEvent(new CompositionEvent("compositionstart", { bubbles: true }));
    dispatchBeforeInput(input, "insertCompositionText", "e", false);
    nativeInsert(input, "e");
    await expect(input.validity.badInput).toBe(true);
    input.dispatchEvent(new CompositionEvent("compositionend", { bubbles: true, data: "e" }));
    await waitFor(() => expect(input).toHaveValue(12));
    await expect(input.validity.badInput).toBe(false);

    // non-cancelable "e" outside a composition (e.g. autocorrect) is undone right away,
    // back to the last valid value even if it was set programmatically ("42", then ".")
    input.value = "42";
    dispatchBeforeInput(input, "insertText", ".");
    nativeInsert(input, ".");
    await expect(input.validity.badInput).toBe(true);
    dispatchBeforeInput(input, "insertText", "e", false);
    nativeInsert(input, "e");
    await expect(input).toHaveValue(42);
    await expect(input.validity.badInput).toBe(false);
  },
};
