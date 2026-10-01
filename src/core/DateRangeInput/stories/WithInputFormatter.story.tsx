import { within, expect, waitFor } from "storybook/test";
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
    const input = canvasElement.querySelector("input") as HTMLInputElement;
    const button = canvas.getByRole("button");
    await waitFor(() => expect(input).toHaveValue("2023-01-01 to 2023-01-31"));
    await expect(button).toBeInTheDocument();
  },
};