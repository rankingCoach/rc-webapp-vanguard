# TagList

Layout component that displays a list of `Tag` items with wrapping, ordering and optional removal. `variant="chip-filled"` renders small filled chips (24px, 12px medium text).

- Kind: component
- Import: `import { TagList } from '@rankingcoach/vanguard';`
- WordPress bundle: yes
- Source: `src/core/TagList/TagList.tsx`
- Keywords: tags, list, chips, wrap, remove, labels, chip-filled, filled, small

## DOM contract

Slots: `[data-slot="tag-list"]`

State / variant attributes: `data-variant`

## Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `className` | `string` | no |  |
| `tags` | `TagProps[]` | no |  |
| `variant` | `TagVariant` | no | `chip-filled`: the small filled chip (24px, muted fill, 12px medium text, not uppercase). |

## Examples

From `src/core/TagList/stories/ActiveTags.story.tsx`:

```tsx
import { within, expect } from "storybook/test";
import { Story } from "./_TagList.default";

export const ActiveTags: Story = {
  args: {
    tags: [
      { id: 1, text: "Active Tag", active: true },
      { id: 2, text: "Inactive Tag", active: false },
      { id: 3, text: "Default Tag" },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const activeTag = canvas.getByText("Active Tag");
    const inactiveTag = canvas.getByText("Inactive Tag");

    await expect(activeTag).toBeInTheDocument();
    await expect(inactiveTag).toBeInTheDocument();
  },
};
```

From `src/core/TagList/stories/ChipFilledVariant.story.tsx`:

```tsx
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
```
