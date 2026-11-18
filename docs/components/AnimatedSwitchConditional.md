# AnimatedSwitchConditional

Helper that toggles between two states with an animated transition when a condition changes.

- Kind: component
- Import: `import { AnimatedSwitchConditional } from '@rankingcoach/vanguard';`
- WordPress bundle: no
- Source: `src/core/AnimatedSwitchConditional/AnimatedSwitchConditional.tsx`
- Keywords: animation, conditional, switch, transition, helper

## DOM contract

No slots yet.

## Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `animation` | `"rotate" \| "scale" \| "zoom" \| "none" \| "fade" \| "slide" \| "flip" \| "slideRight" \| …` | no |  |
| `children` | `React.ReactNode` | yes |  |
| `className` | `string` | no |  |
| `condition` | `boolean` | no |  |
| `if` | `boolean` | no |  |

## Examples

From `src/core/AnimatedSwitchConditional/stories/Default.story.tsx`:

```tsx
import React from "react";
import { within, expect } from "storybook/test";
import { AnimatedSwitchConditional } from "../AnimatedSwitchConditional";
import { Story, testContent } from "./_AnimatedSwitchConditional.default";

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

From `src/core/AnimatedSwitchConditional/stories/WithBounceAnimation.story.tsx`:

```tsx
import React from "react";
import { within, expect } from "storybook/test";
import { AnimatedSwitchConditional } from "../AnimatedSwitchConditional";
import { Story, testContent } from "./_AnimatedSwitchConditional.default";

export const WithBounceAnimation: Story = {
  args: {
    children: testContent,
    condition: true,
    animation: "bounce",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Animated Content")).toBeInTheDocument();
  },
};
```
