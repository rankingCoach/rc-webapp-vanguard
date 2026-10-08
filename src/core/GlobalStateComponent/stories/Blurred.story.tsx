import { within, expect } from "storybook/test";
import { Story, demoCardContent, demoCardStyle, demoTestId, getTopElementAtCenterOf } from "./_GlobalStateComponent.default";

export const Blurred: Story = {
  args: {
    blurred: true,
    testId: demoTestId,
    style: demoCardStyle,
    children: demoCardContent,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const wrapper = canvas.getByTestId(demoTestId);

    const blurLayer = wrapper.querySelector('[class*="blurLayer"]') as HTMLElement;
    await expect(blurLayer).toBeTruthy();
    await expect(getComputedStyle(blurLayer).backdropFilter).toBe("blur(4px)");

    // The blur layer covers the content, so a click lands on the layer, not the button
    const button = canvas.getByRole("button", { name: "Edit" });
    await expect(getTopElementAtCenterOf(button)).toBe(blurLayer);
  },
};
