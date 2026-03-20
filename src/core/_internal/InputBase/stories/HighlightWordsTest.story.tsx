import { expect, userEvent } from "storybook/test";
import { Story } from "./_InputBase.default";

export const HighlightWordsTest: Story = {
  args: {
    highlightWords: ["hello", "world"],
  },
  play: async ({ canvasElement }) => {
    const input = canvasElement.querySelector('input[type="text"]') as HTMLInputElement;

    await userEvent.type(input, "hello world this is a test");

    await new Promise((resolve) => setTimeout(resolve, 200));

    const highlights = canvasElement.querySelector('.vanguard-input-highlights') as HTMLElement;

    await expect(highlights).not.toBeNull();

    const greenMarks = highlights.querySelectorAll('.vanguard-input-mark-green');
    await expect(greenMarks.length).toBe(2);
    await expect(greenMarks[0].textContent).toBe("hello");
    await expect(greenMarks[1].textContent).toBe("world");
  },
};
