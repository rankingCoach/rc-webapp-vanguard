import { expect } from "storybook/test";
import { wait } from "@helpers/wait";
import { Story } from "./_Textarea.default";

const SPECIAL_TEXT = "Special chars <b>bold</b> & <tags> should not break www.google.ro highlights";

export const TextareaHighlightUrlsSpecialCharsSync: Story = {
  args: {
    highlightUrl: true,
    highlightUrlType: "info",
    value: SPECIAL_TEXT,
    valueAsDefaultValue: true,
  },
  play: async ({ canvasElement }) => {
    await wait(100);
    const highlights = canvasElement.querySelector(".vanguard-input-highlights");

    // The backdrop text must match the textarea text character-for-character,
    // otherwise every highlight after a "<" drifts out of position
    await expect(highlights?.textContent).toBe(SPECIAL_TEXT);

    const mark = canvasElement.querySelector(".vanguard-input-mark-blue");
    await expect(mark).not.toBeNull();
    await expect(mark?.textContent).toBe("www.google.ro");

    // The blue mark must not add padding, it would shift the text that follows it
    await expect(getComputedStyle(mark as Element).padding).toBe("0px");
  },
};
