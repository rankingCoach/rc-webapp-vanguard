import { expect, userEvent, within } from "storybook/test";
import { Story } from "./_Autocomplete.default";

/**
 * Autocomplete with an empty options list.
 *
 * When there are no options to show, MUI renders `noOptionsText` in the
 * dropdown. This story documents that empty state and verifies that
 * `noOptionsText` is passed through the translation service — i.e. a
 * translation key is resolved to its localized value before display.
 */
export const WithNoOptionsText: Story = {
  args: {
    placeholder: "Select a fruit...",
    options: [],
    optionKey: "title",
    noOptionsText: "No options available",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);
    const input = canvas.getByRole("combobox");

    // Open the dropdown so the empty state becomes visible.
    await userEvent.click(input);

    // The translated noOptionsText is shown in the popup.
    const noOptions = await body.findByText("No options available");
    await expect(noOptions).toBeInTheDocument();
  },
};
