import { within, expect } from "storybook/test";
import { Story, demoCardContent, demoCardStyle, demoTestId, getTopElementAtCenterOf } from "./_GlobalStateComponent.default";

export const Default: Story = {
  args: {
    testId: demoTestId,
    style: demoCardStyle,
    children: demoCardContent,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const wrapper = canvas.getByTestId(demoTestId);

    await expect(canvas.getByText("Business hours")).toBeInTheDocument();

    // No state set: no layer is rendered and the content stays clickable
    await expect(wrapper.className).not.toContain("hoverable");
    await expect(wrapper.querySelector('[class*="blurLayer"]')).toBeNull();
    await expect(wrapper.querySelector('[class*="shimmerLayer"]')).toBeNull();

    const button = canvas.getByRole("button", { name: "Edit" });
    await expect(getTopElementAtCenterOf(button)).toBe(button);
  },
};
