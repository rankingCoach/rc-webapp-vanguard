# ToggleButtonGroup

Group component managing multiple toggle buttons and their selection state. `variant="segmented"` is the 32px segmented control (muted track, pressed item a white chip) for text or icon-only items: `<ToggleButtonGroup variant="segmented" exclusive value={v} onChange={...}>`.

- Kind: component
- Import: `import { ToggleButtonGroup } from '@rankingcoach/vanguard';`
- WordPress bundle: no
- Source: `src/core/ToggleButtonGroup/ToggleButtonGroup.tsx`
- Keywords: toggle, group, buttons, selection, control, segmented, segmented-control, button-group, tabs, view-switch

## DOM contract

Slots: `[data-slot="toggle-button-group"]`

State / variant attributes: `data-disabled`, `data-orientation`

## Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `classes` | `Partial<Record<"disabled" \| "root" \| "horizontal" \| "vertical" \| "selected" \| …` | no | MUI `classes` keys (toggleButtonGroupClasses). |
| `color` | `"info" \| "success" \| "primary" \| "secondary" \| "error" \| "warning" \| "standard"` | no |  |
| `disabled` | `boolean` | no |  |
| `exclusive` | `boolean` | no |  |
| `fullWidth` | `boolean` | no |  |
| `onChange` | `(event: React.MouseEvent<HTMLElement, MouseEvent>, value: any) => void` | no |  |
| `orientation` | `"horizontal" \| "vertical"` | no |  |
| `ref` | `React.Ref<HTMLDivElement>` | no |  |
| `rounded` | `boolean` | no | Segmented only: the track and its items as pills. |
| `segmentedSize` | `"default" \| "large"` | no | Segmented only: `large` is a 48px track with 16px labels, for a page's main switch (e.g. its sources). |
| `size` | `"small" \| "medium" \| "large"` | no |  |
| `sx` | `SxCompat` | no | Accepts every MUI SxProps shape; only flat CSS objects apply (see sx-compat). |
| `value` | `any` | no |  |
| `variant` | `"default" \| "segmented"` | no | `segmented`: a 32px muted track with the pressed item as a white glass chip; labels keep their case. Holds text items and icon-only items (a single `Icon` child, painted in the item's text colour). |

Also accepts: 276 React DOM attributes (not listed).

## Examples

From `src/core/ToggleButtonGroup/stories/Default.story.tsx`:

```tsx
import React from "react";
import { ToggleButtonGroup } from "../ToggleButtonGroup";
import { ToggleButton } from "@vanguard/ToggleButton/ToggleButton";
import { expect, screen } from "storybook/test";
import { Story, mockOnChange } from "./_ToggleButtonGroup.default";

export const Default: Story = {
  args: {
    onChange: mockOnChange,
  },
  render: (args) => (
    <ToggleButtonGroup {...args}>
      <ToggleButton value="left">Left</ToggleButton>
      <ToggleButton value="center">Center</ToggleButton>
      <ToggleButton value="right">Right</ToggleButton>
    </ToggleButtonGroup>
  ),
  play: async () => {
    const leftButton = screen.getByText("Left");
    await expect(leftButton).toBeInTheDocument();

    const centerButton = screen.getByText("Center");
    await expect(centerButton).toBeInTheDocument();

    const rightButton = screen.getByText("Right");
    await expect(rightButton).toBeInTheDocument();
  },
};
```

From `src/core/ToggleButtonGroup/stories/Disabled.story.tsx`:

```tsx
import React from "react";
import { ToggleButtonGroup } from "../ToggleButtonGroup";
import { ToggleButton } from "@vanguard/ToggleButton/ToggleButton";
import { within, expect } from "storybook/test";
import { Story, mockOnChange } from "./_ToggleButtonGroup.default";

export const Disabled: Story = {
  args: {
    disabled: true,
    value: "left",
    onChange: mockOnChange,
  },
  render: (args) => (
    <ToggleButtonGroup {...args}>
      <ToggleButton value="left">Left</ToggleButton>
      <ToggleButton value="center">Center</ToggleButton>
      <ToggleButton value="right">Right</ToggleButton>
    </ToggleButtonGroup>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const buttons = canvas.getAllByRole("button");

    for (const button of buttons) {
      await expect(button).toBeDisabled();
    }
  },
};
```
