# LinkConditional

Renders a link only when a condition is met; renders fallback otherwise.

- Kind: component
- Import: `import { LinkConditional } from '@rankingcoach/vanguard';`
- WordPress bundle: no
- Source: `src/core/LinkConditional/LinkConditional.tsx`
- Keywords: link, conditional, render, navigation, fallback

## DOM contract

No slots yet.

## Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `childFullWidth` | `boolean` | no |  |
| `children` | `React.ReactNode` | yes |  |
| `childVisible` | `boolean` | yes |  |
| `linkProps` | `Omit<LinkProps, "children">` | no |  |
| `linkText` | `string` | yes |  |
| `onDeleteClick` | `() => void` | no |  |

## Examples

From `src/core/LinkConditional/stories/Default.story.tsx`:

```tsx
import React from "react";
import { LinkConditional } from "../LinkConditional";
import { Story, testLinkText } from "./_LinkConditional.default.tsx";

export const Default: Story = {
  args: {
    childVisible: false,
    children: null,
    linkText: testLinkText,
  },
  play: async ({ canvasElement }) => {
    const { within, expect } = await import("storybook/test");
    const canvas = within(canvasElement);

    // Should render as a link when childVisible is false
    const link = canvas.getByRole("link", { name: testLinkText });
    await expect(link).toBeInTheDocument();
  },
};
```

From `src/core/LinkConditional/stories/WithChildFullWidth.story.tsx`:

```tsx
import React from "react";
import { LinkConditional } from "../LinkConditional";
import { Story, testChildren, createMockOnDeleteClick } from "./_LinkConditional.default.tsx";

export const WithChildFullWidth: Story = {
  args: {
    childVisible: true,
    children: testChildren,
    linkText: "Add Item",
    childFullWidth: true,
    onDeleteClick: createMockOnDeleteClick(),
  },
  play: async ({ canvasElement }) => {
    const { within, expect } = await import("storybook/test");
    const canvas = within(canvasElement);

    // Should render children when childVisible is true
    await expect(canvas.getByText("Test Child Content")).toBeInTheDocument();

    // Should have a container with the children
    const container = canvas.getByText("Test Child Content").parentElement;
    await expect(container).toBeInTheDocument();
    await expect(container?.className).toContain("container");

    // The container should have child-full-width class applied
    await expect(container?.className).toContain("child-full-width");
  },
};
```
