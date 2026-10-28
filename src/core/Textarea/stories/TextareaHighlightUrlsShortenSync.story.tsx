import React, { useState } from "react";
import { expect, userEvent, within } from "storybook/test";
import { wait } from "@helpers/wait";
import { Textarea } from "@vanguard/Textarea/Textarea";
import { Story } from "./_Textarea.default";

const LONG_VALUE = [...Array(4)]
  .map((_, i) => `Post line ${i + 1}\nhttp://very-long-url-number-${i + 1}.example.com/with/a/long/path/segment?query=${i + 1}`)
  .join("\n");
const SHORT_VALUE = [...Array(4)].map((_, i) => `Post line ${i + 1}\nhttp://gosho.rt/a${i + 1}`).join("\n");

// Simulates the app's "Shorten identified URLs" flow: a programmatic value
// replacement that makes the content much shorter while the textarea is scrolled
const ShortenDemo = () => {
  const [value, setValue] = useState(LONG_VALUE);
  return (
    <Textarea
      highlightUrl={true}
      highlightUrlType="info"
      allowBreakLines={true}
      maxRows={3}
      value={value}
      helperLinkText="Shorten URLs"
      onHelperLinkClick={() => setValue(SHORT_VALUE)}
    />
  );
};

export const TextareaHighlightUrlsShortenSync: Story = {
  render: () => <ShortenDemo />,
  play: async ({ canvasElement }) => {
    await wait(100);
    const textarea = canvasElement.querySelector("textarea");
    const backdrop = canvasElement.querySelector(".vanguard-input-backdrop") as HTMLElement;
    const highlights = canvasElement.querySelector(".vanguard-input-highlights") as HTMLElement;
    if (!textarea || !backdrop || !highlights) throw new Error("Textarea, backdrop or highlights not found");

    // Scroll down first, then shorten — the value swap must not desync the mirror
    textarea.scrollTop = textarea.scrollHeight;
    textarea.dispatchEvent(new Event("scroll", { bubbles: true }));
    await wait(100);
    await expect(textarea.scrollTop).toBeGreaterThan(0);

    await userEvent.click(within(canvasElement).getByText("Shorten URLs"));
    await wait(200);

    // The mirror must show the shortened text and track the (possibly clamped) scroll exactly
    await expect(highlights.textContent).toBe(SHORT_VALUE);
    await expect(highlights.style.transform).toBe(`translate(0px, ${-textarea.scrollTop}px)`);
    await expect(backdrop.getBoundingClientRect().height).toBeCloseTo(textarea.getBoundingClientRect().height, 0);

    const marks = canvasElement.querySelectorAll(".vanguard-input-mark-blue");
    await expect(marks.length).toBe(4);
    await expect(marks[0].textContent).toBe("http://gosho.rt/a1");
  },
};
