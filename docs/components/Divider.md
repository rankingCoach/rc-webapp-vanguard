# Divider

Simple horizontal or vertical divider used to separate content or sections visually.

- Kind: component
- Import: `import { Divider } from '@rankingcoach/vanguard';`
- WordPress bundle: no
- Source: `src/core/Divider/Divider.tsx`
- Keywords: divider, rule, separator, layout, line

## DOM contract

Slots: `[data-slot="divider"]`

## Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `className` | `string` | no |  |

Also accepts: 277 React DOM attributes (not listed).

## Examples

From `src/core/Divider/stories/Default.story.tsx`:

```tsx
import React from "react";
import { Divider } from "../Divider";
import { within, expect } from "storybook/test";
import { Story } from "./_Divider.default";

export const Default: Story = {
  render: () => (
    <div style={{ padding: "20px" }}>
      <div>Content above divider</div>
      <Divider data-testid="divider" />
      <div>Content below divider</div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const divider = canvas.getByTestId("divider");
    await expect(divider).toBeInTheDocument();
  },
};
```

From `src/core/Divider/stories/InList.story.tsx`:

```tsx
import React from "react";
import { Divider } from "../Divider";
import { within, expect } from "storybook/test";
import { Story } from "./_Divider.default";

export const InList: Story = {
  render: () => (
    <div style={{ padding: "20px" }}>
      <div>List Item 1</div>
      <Divider data-testid="divider" />
      <div>List Item 2</div>
      <Divider data-testid="divider" />
      <div>List Item 3</div>
      <Divider data-testid="divider" />
      <div>List Item 4</div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const dividers = canvas.getAllByTestId("divider");
    await expect(dividers).toHaveLength(3);
  },
};
```
