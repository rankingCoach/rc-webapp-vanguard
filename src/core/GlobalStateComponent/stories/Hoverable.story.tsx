import { within, expect } from "storybook/test";
import { Story, demoCardContent, demoCardStyle, demoTestId, getTopElementAtCenterOf } from "./_GlobalStateComponent.default";

export const Hoverable: Story = {
  args: {
    hoverable: true,
    testId: demoTestId,
    style: demoCardStyle,
    children: demoCardContent,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const wrapper = canvas.getByTestId(demoTestId);

    await expect(wrapper.className).toContain("hoverable");

    // The hover layer is drawn over the content but must not swallow its clicks
    await expect(getComputedStyle(wrapper, "::before").pointerEvents).toBe("none");
    const button = canvas.getByRole("button", { name: "Edit" });
    await expect(getTopElementAtCenterOf(button)).toBe(button);
  },
};
