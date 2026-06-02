import { within, expect, userEvent, fn } from "storybook/test";
import { Story, testOptions } from "./_Autocomplete.default";

export const WithMultiple: Story = {
  args: {
    placeholder: "Select multiple fruits...",
    options: testOptions,
    optionKey: "title",
    multiple: true,
    splitCommaTag: true,
    onChange: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);
    const input = canvas.getByRole("combobox");

    // Select Apple
    await userEvent.click(input);
    await userEvent.click(await body.findByText("Apple"));

    // Select Plum
    await userEvent.click(input);
    await userEvent.click(await body.findByText("Plum"));

    // Select Cherry
    await userEvent.click(input);
    await userEvent.click(await body.findByText("Cherry"));

    // All three chips present (accumulation works)
    await expect(canvas.getByText("Apple")).toBeInTheDocument();
    await expect(canvas.getByText("Plum")).toBeInTheDocument();
    await expect(canvas.getByText("Cherry")).toBeInTheDocument();

    // onChange last call has all 3 values
    const calls = (args.onChange as ReturnType<typeof fn>).mock.calls;
    const lastValue = calls[calls.length - 1][1];
    await expect(Array.isArray(lastValue)).toBe(true);
    await expect(lastValue.length).toBe(3);

    // No duplicates: open dropdown, Apple should be aria-selected
    await userEvent.click(input);
    const options = document.querySelectorAll('[role="option"]');
    const appleOption = Array.from(options).find((o) => o.textContent === "Apple");
    if (appleOption) {
      await expect(appleOption).toHaveAttribute("aria-selected", "true");
    }
    await userEvent.keyboard("{Escape}");

    // Still exactly 3 chips
    const chips = canvasElement.querySelectorAll(".MuiChip-root");
    await expect(chips.length).toBe(3);
  },
};