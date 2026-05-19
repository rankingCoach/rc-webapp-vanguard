import { expect, userEvent } from "storybook/test";
import { Story } from "./_InputBase.default";

export const HighlightLengthExceededTest: Story = {
  args: {
    highlightLengthExceeded: true,
    maxLength: 10,
    counter: true,
  },
  play: async ({ canvasElement }) => {
    const input = canvasElement.querySelector('input[type="text"]') as HTMLInputElement;

    await userEvent.type(input, "This text exceeds the max length");

    await new Promise((resolve) => setTimeout(resolve, 200));

    const highlights = canvasElement.querySelector('.vanguard-input-highlights') as HTMLElement;

    await expect(highlights).not.toBeNull();

    const redMarks = highlights.querySelectorAll('.vanguard-input-mark-red');
    await expect(redMarks.length).toBeGreaterThan(0);
  },
};
