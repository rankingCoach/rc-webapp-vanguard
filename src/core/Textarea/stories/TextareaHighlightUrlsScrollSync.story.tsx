import { expect } from "storybook/test";
import { wait } from "@helpers/wait";
import { Story } from "./_Textarea.default";

export const TextareaHighlightUrlsScrollSync: Story = {
  args: {
    highlightUrl: true,
    highlightUrlType: "info",
    allowBreakLines: true,
    maxRows: 3,
    // Trailing newlines are the worst case: they render an extra line inside the
    // textarea but no line box in the pre-wrap mirror, so a scrollTop-copy would clamp
    value:
      "www.link-one.com\nsome text\nwww.link-two.com\nmore text\nwww.link-three.com\neven more text\nwww.link-four.com\n\n",
    valueAsDefaultValue: true,
  },
  play: async ({ canvasElement }) => {
    await wait(100);
    const textarea = canvasElement.querySelector("textarea");
    const highlights = canvasElement.querySelector(".vanguard-input-highlights") as HTMLElement;
    if (!textarea || !highlights) throw new Error("Textarea or highlights not found");

    // Scroll to the maximum bottom
    textarea.scrollTop = textarea.scrollHeight;
    textarea.dispatchEvent(new Event("scroll", { bubbles: true }));
    await wait(100);

    await expect(textarea.scrollTop).toBeGreaterThan(0);
    // The mirror must track the textarea scroll exactly (no clamping),
    // otherwise highlights sit on the wrong lines when scrolled to the bottom
    await expect(highlights.style.transform).toBe(`translate(0px, ${-textarea.scrollTop}px)`);
  },
};
