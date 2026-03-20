import { expect, userEvent } from "storybook/test";
import { Story, urlMaskTestData } from "./_InputBase.default";

export const HighlightUrlTest: Story = {
  args: {
    highlightUrl: true,
  },
  play: async ({ canvasElement }) => {
    const input = canvasElement.querySelector('input[type="text"]') as HTMLInputElement;

    await userEvent.type(input, urlMaskTestData.testText);

    await new Promise((resolve) => setTimeout(resolve, 200));

    const highlights = canvasElement.querySelector('.vanguard-input-highlights') as HTMLElement;

    await expect(highlights).not.toBeNull();

    const redMarks = highlights.querySelectorAll('.vanguard-input-mark-red');
    await expect(redMarks.length).toBeGreaterThan(0);
    await expect(redMarks[0].textContent).toBe(urlMaskTestData.testUrl);
  },
};
