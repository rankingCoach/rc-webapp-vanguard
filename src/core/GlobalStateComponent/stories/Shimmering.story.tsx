import { within, expect } from "storybook/test";
import { Story, demoCardContent, demoCardStyle, demoTestId, getTopElementAtCenterOf } from "./_GlobalStateComponent.default";

export const Shimmering: Story = {
  args: {
    shimmering: true,
    testId: demoTestId,
    style: demoCardStyle,
    children: demoCardContent,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const wrapper = canvas.getByTestId(demoTestId);

    const shimmerLayer = wrapper.querySelector('[class*="shimmerLayer"]') as HTMLElement;
    await expect(shimmerLayer).toBeTruthy();
    await expect(getComputedStyle(shimmerLayer).animationName).not.toBe("none");

    // The shimmer is visual only: clicks still reach the content
    const button = canvas.getByRole("button", { name: "Edit" });
    await expect(getTopElementAtCenterOf(button)).toBe(button);
  },
};
