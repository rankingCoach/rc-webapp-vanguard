# Collapse

Collapsible container to hide or reveal content with animation and controlled height.

- Kind: component
- Import: `import { Collapse } from '@rankingcoach/vanguard';`
- WordPress bundle: no
- Source: `src/core/Collapse/Collapse/Collapse.tsx`
- Keywords: collapse, accordion, toggle, hide, show, expand

> Internals pending rebuild: this component still renders MUI internally. Its DOM contract (data-slot parts) is not final yet; style it through the props and classes it documents.

## DOM contract

No slots yet.

## Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `children` | `React.ReactNode` | yes |  |
| `className` | `string` | no |  |
| `isOpen` | `boolean` | yes |  |
| `orientation` | `"horizontal" \| "vertical"` | no |  |

## Examples

From `src/core/Collapse/Collapse/stories/Closed.story.tsx`:

```tsx
import React from "react";
import { Collapse } from "../Collapse";
import { within, expect } from "storybook/test";
import { Story, testData } from "./_Collapse.default";

export const Closed: Story = {
  args: {
    isOpen: false,
    children: testData.children,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // MUI Collapse keeps content in DOM when closed, so check it's there
    await expect(canvas.getByText("Collapsible content")).toBeInTheDocument();
  },
};
```

From `src/core/Collapse/Collapse/stories/Default.story.tsx`:

```tsx
import React from "react";
import { Collapse } from "../Collapse";
import { within, expect } from "storybook/test";
import { Story, testData } from "./_Collapse.default";

export const Default: Story = {
  args: {
    isOpen: true,
    children: testData.children,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Collapsible content")).toBeInTheDocument();
  },
};
```
