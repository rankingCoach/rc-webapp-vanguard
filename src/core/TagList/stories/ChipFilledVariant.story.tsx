import { within, expect, waitFor } from "storybook/test";
import { Story, mockDeleteCallback } from "./_TagList.default";

// variant="chip-filled": the small filled chip (24px, muted fill, 12px medium text, not uppercase)
export const ChipFilledVariant: Story = {
  args: {
    variant: "chip-filled",
    tags: [
      { id: 1, text: "storefront" },
      { id: 2, text: "summer" },
      { id: 3, text: "Window display" },
      { id: 4, text: "removable", hasDeleteBtn: true, deleteBtnCallback: mockDeleteCallback },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const label = canvas.getByText("storefront");
    const chip = label.closest<HTMLElement>(".chip-filled")!;

    await waitFor(() => {
      expect(chip.getBoundingClientRect().height, "height").toBe(24);
      expect(getComputedStyle(chip).paddingLeft, "side padding").toBe("10px");
      expect(getComputedStyle(chip).backgroundColor, "filled").not.toBe("rgba(0, 0, 0, 0)");
      expect(getComputedStyle(label).fontSize, "font size").toBe("12px");
      expect(getComputedStyle(label).fontWeight, "font weight").toBe("500");
      expect(getComputedStyle(label).textTransform, "not uppercase").toBe("none");
    });

    // with the delete button it stays 24px
    const removable = canvas.getByText("removable").closest<HTMLElement>(".chip-filled")!;
    expect(removable.getBoundingClientRect().height, "removable height").toBe(24);
  },
};
