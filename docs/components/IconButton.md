# IconButton

Button component primarily for icon actions; supports accessible labels and variants.

- Kind: component
- Import: `import { IconButton } from '@rankingcoach/vanguard';`
- WordPress bundle: no
- Source: `src/core/IconButton/IconButton.tsx`
- Keywords: icon, button, cta, action, tooltip, accessible

## DOM contract

No slots yet.

## Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `icon` | `IconNames` | yes |  |
| `isActive` | `boolean` | yes |  |
| `isDisabled` | `boolean` | no |  |
| `isSpinning` | `boolean` | no |  |
| `message` | `string` | no |  |
| `onClick` | `() => void` | no |  |
| `onHover` | `(isHovered: boolean) => void` | no |  |

## Examples

From `src/core/IconButton/stories/Active.story.tsx`:

```tsx
import React from "react";
import { within, expect } from "storybook/test";
import { Story, testIcons } from "./_IconButton.default";

export const Active: Story = {
  args: {
    icon: testIcons.star,
    isActive: true,
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole("button");
    await expect(button).toBeInTheDocument();
    // Test that active state is applied (this would require checking styles or classes)
  },
};
```

From `src/core/IconButton/stories/AllStates.story.tsx`:

```tsx
import React from "react";
import { IconButton } from "../IconButton";
import { within, expect } from "storybook/test";
import { Story, testIcons } from "./_IconButton.default";

export const AllStates: Story = {
  args: {
    icon: testIcons.star,
    isActive: true,
  },
  render: (props) => {
    return (
      <div style={{ display: "flex", alignItems: "flex-start", flexDirection: "column", gap: 2 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
          <div>Active+Disabled</div>
          <IconButton {...props} isActive={true} isDisabled={true} />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
          <div>Active+Not_Disabled</div>
          <IconButton {...props} isActive={true} isDisabled={false} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
          <div>Not_Active+Not_Disabled</div>
          <IconButton {...props} isActive={false} isDisabled={false} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
          <div>Not_Active+Disabled</div>
          <IconButton {...props} isActive={false} isDisabled={true} />
        </div>
      </div>
    );
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const buttons = canvas.getAllByRole("button");
    await expect(buttons).toHaveLength(4);
  },
};
```
