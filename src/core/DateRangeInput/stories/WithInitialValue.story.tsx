import { within, expect, waitFor } from "storybook/test";
import { Story, createMockFormConfig } from "./_DateRangeInput.default";

export const WithInitialValue: Story = {
  args: {
    formconfig: createMockFormConfig("2023-01-01_2023-01-31"),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvasElement.querySelector("input") as HTMLInputElement;
    const button = canvas.getByRole("button");
    await waitFor(() => expect(input).toHaveValue("2023-01-01_2023-01-31"));
    await expect(button).toBeInTheDocument();
  },
};