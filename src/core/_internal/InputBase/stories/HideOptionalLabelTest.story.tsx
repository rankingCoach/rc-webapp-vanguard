import { within, expect } from "storybook/test";
import { Story, selectors, testValues } from "./_InputBase.default";

export const HideOptionalLabelTest: Story = {
  args: {
    label: testValues.sampleLabel,
    required: false,
    hideOptionalLabel: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // The label itself is still rendered
    const labelElement = canvas.getAllByText(testValues.sampleLabel).find((element) => {
      return element.tagName === "LABEL";
    });
    await expect(labelElement).toBeInTheDocument();

    // ...but the "Optional" hint appended to non-required labels is not
    await expect(canvasElement.querySelector(selectors.optionalLabel)).not.toBeInTheDocument();
  },
};
