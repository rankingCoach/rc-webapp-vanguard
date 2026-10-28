import { within, expect } from "storybook/test";
import { Story, selectors, testValues } from "./_InputBase.default";

export const OptionalLabelVisibleTest: Story = {
  args: {
    label: testValues.sampleLabel,
    required: false,
    // hideOptionalLabel intentionally omitted - it defaults to false
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const labelElement = canvas.getAllByText(testValues.sampleLabel).find((element) => {
      return element.tagName === "LABEL";
    });
    await expect(labelElement).toBeInTheDocument();

    // Non-required fields show the "Optional" hint by default
    await expect(canvasElement.querySelector(selectors.optionalLabel)).toBeInTheDocument();
  },
};
