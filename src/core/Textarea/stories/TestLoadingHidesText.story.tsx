import { Story } from "./_Textarea.default";
import { within, expect } from "storybook/test";

/** While loading, only the skeleton shows: no text, no highlight marks, and the skeleton stays inside the field. */
export const TestLoadingHidesText: Story = {
  args: {
    value: "Fresh baked goods every morning",
    valueAsDefaultValue: true,
    highlightWords: ["baked goods"],
    isLoading: true,
  },
  play: async ({ canvasElement }) => {
    const textarea = within(canvasElement).getByDisplayValue("Fresh baked goods every morning");
    const style = getComputedStyle(textarea);
    await expect(style.color).toBe("rgba(0, 0, 0, 0)");
    await expect(style.webkitTextFillColor).toBe("rgba(0, 0, 0, 0)");

    const root = textarea.closest(".vanguard-input") as HTMLElement;
    const backdrop = root.querySelector(".vanguard-input-backdrop") as HTMLElement;
    await expect(getComputedStyle(backdrop).visibility).toBe("hidden");

    const skeleton = root.querySelector(".vanguard-input-skeleton") as HTMLElement;
    const field = root.querySelector(".MuiOutlinedInput-root") as HTMLElement;
    await expect(skeleton.getBoundingClientRect().right).toBeLessThanOrEqual(field.getBoundingClientRect().right + 0.5);
  },
};
