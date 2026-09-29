import { within, expect } from "storybook/test";
import { Story, createMockFormConfig } from "./_DateRangeInput.default";

export const WithInputFormatter: Story = {
  args: {
    formconfig: createMockFormConfig("2023-01-01 to 2023-01-31"),
    inputFormatter: {
      formatFn: (val: string) => val.replace("_", " to "),
      reverseFormatFn: (val: string) => val.replace(" to ", "_"),
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = await canvas.findByDisplayValue("2023-01-01 to 2023-01-31");
    const button = canvas.getByRole("button");
    await expect(input).toBeInTheDocument();
    await expect(button).toBeInTheDocument();
  },
};