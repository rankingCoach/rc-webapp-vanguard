# Label

Text label for forms and UI elements providing concise contextual captions.

- Kind: component
- Import: `import { Label } from '@rankingcoach/vanguard';`
- WordPress bundle: no
- Source: `src/core/Label/Label.tsx`
- Keywords: label, form, caption, field, text, ui

## DOM contract

No slots yet.

## Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `fontWeight` | `FontWeights` | no |  |
| `replacements` | `TextReplacements` | no |  |
| `value` | `string` | yes |  |

## Examples

From `src/core/Label/stories/AllProps.story.tsx`:

```tsx
import React from "react";
import { within, expect } from "storybook/test";
import { FontWeights } from "@vanguard/Text/Text";
import { Story } from "./_Label.default";

export const AllProps: Story = {
  args: {
    value: "Hello {name}, this is a {weight} label!",
    replacements: {
      name: "World",
      weight: "bold",
    },
    fontWeight: FontWeights.bold,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const label = canvas.getByText("Hello World, this is a bold label!");
    await expect(label).toBeInTheDocument();
  },
};
```

From `src/core/Label/stories/BoldWeight.story.tsx`:

```tsx
import { within, expect } from "storybook/test";
import { FontWeights } from "@vanguard/Text/Text";
import { Story } from "./_Label.default";

export const BoldWeight: Story = {
  args: {
    value: "Bold weight label",
    fontWeight: FontWeights.bold,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const label = canvas.getByText("Bold weight label");
    await expect(label).toBeInTheDocument();
  },
};
```
