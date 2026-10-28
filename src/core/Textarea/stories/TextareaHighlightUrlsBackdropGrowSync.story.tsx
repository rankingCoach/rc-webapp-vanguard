import { expect, userEvent } from "storybook/test";
import { wait } from "@helpers/wait";
import { Story } from "./_Textarea.default";

export const TextareaHighlightUrlsBackdropGrowSync: Story = {
  args: {
    highlightUrl: true,
    highlightUrlType: "info",
    allowBreakLines: true,
    value: "Check www.google.ro",
    valueAsDefaultValue: true,
  },
  play: async ({ canvasElement }) => {
    await wait(100);
    const textarea = canvasElement.querySelector("textarea");
    const backdrop = canvasElement.querySelector(".vanguard-input-backdrop") as HTMLElement;
    if (!textarea || !backdrop) throw new Error("Textarea or backdrop not found");

    const initialHeight = textarea.getBoundingClientRect().height;

    // Insert text and break lines before the link so the textarea autogrows
    await userEvent.type(textarea, "First line{enter}Second line{enter}{enter}", {
      initialSelectionStart: 0,
      initialSelectionEnd: 0,
      delay: 1,
    });
    await wait(200);

    await expect(textarea.getBoundingClientRect().height).toBeGreaterThan(initialHeight);

    // The backdrop must follow the autogrown textarea, otherwise highlights drift below the box
    await expect(backdrop.getBoundingClientRect().height).toBeCloseTo(textarea.getBoundingClientRect().height, 0);
    await expect(backdrop.getBoundingClientRect().width).toBeCloseTo(textarea.getBoundingClientRect().width, 0);

    const mark = canvasElement.querySelector(".vanguard-input-mark-blue");
    await expect(mark).not.toBeNull();
    await expect(mark?.textContent).toBe("www.google.ro");
  },
};
