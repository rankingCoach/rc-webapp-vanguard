# AnimatedConditional

Utility that renders children with conditional animations based on state changes.

- Kind: component
- Import: `import { AnimatedConditional } from '@rankingcoach/vanguard';`
- WordPress bundle: no
- Source: `src/core/AnimatedConditional/AnimatedConditional.tsx`
- Keywords: animation, conditional, transition, motion, helper, toggle

## DOM contract

No slots yet.

## Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `animation` | `"none" \| "growWidth" \| "growHeight"` | no |  |
| `children` | `React.ReactNode` | yes |  |
| `className` | `string` | no |  |
| `condition` | `boolean` | no |  |
| `testId` | `string` | no |  |

## Examples

From `src/core/AnimatedConditional/stories/Default.story.tsx`:

```tsx
import React from "react";
import { within, expect } from "storybook/test";
import { AnimatedConditional } from "../AnimatedConditional";
import { Story, testContent } from "./_AnimatedConditional.default";

export const Default: Story = {
  args: {
    children: testContent,
    condition: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Animated Content")).toBeInTheDocument();
  },
};
```

From `src/core/AnimatedConditional/stories/WithClassName.story.tsx`:

```tsx
import React from "react";
import { within, expect } from "storybook/test";
import { AnimatedConditional } from "../AnimatedConditional";
import { Story, testContent } from "./_AnimatedConditional.default";

export const WithClassName: Story = {
  args: {
    children: testContent,
    condition: true,
    className: "custom-animated-class",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // The className is applied to the parent animated.div, not the content div
    const animatedDiv = canvas.getByText("Animated Content").parentElement;
    await expect(animatedDiv).toHaveClass("custom-animated-class");
  },
};
```
