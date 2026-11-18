# AiGlow

Visual glow effect component used to indicate AI processing or emphasis around elements.

- Kind: component
- Import: `import { AiGlow } from '@rankingcoach/vanguard';`
- WordPress bundle: no
- Source: `src/core/AiGlow/AiGlow.tsx`
- Keywords: ai, glow, visual, indicator, highlight, effect

## DOM contract

Slots: `[data-slot="ai-glow"]`

## Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `baseColor` | `string` | no | The glow's only colour; the other stops are derived from it. Defaults to the inherited `--ai-base-color`. |
| `blurWidth` | `number` | no |  |
| `borderRadius` | `number` | no |  |
| `borderWidth` | `number` | no |  |
| `children` | `React.ReactNode` | yes |  |
| `className` | `string` | no |  |

## Examples

From `src/core/AiGlow/stories/Default.story.tsx`:

```tsx
import React from "react";
import { AiGlow } from "../AiGlow";
import { within, expect } from "storybook/test";
import { Story } from "./_AiGlow.default";

export const Default: Story = {
  args: {
    children: (
      <div
        style={{
          width: 200,
          height: 100,
          backgroundColor: "#f0f0f0",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "8px",
        }}
        data-testid="ai-glow-content"
      >
        Basic Content
      </div>
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Test that the component renders
    const glowContainer = canvasElement.querySelector('[class*="grad"]');
    await expect(glowContainer).toBeTruthy();

    // Test that children are rendered
    const content = canvas.getByTestId("ai-glow-content");
    await expect(content).toBeInTheDocument();
    await expect(content).toHaveTextContent("Basic Content");

    // Test that the CSS custom property is set
    await expect(glowContainer).toHaveStyle({ "--ai-border-radius": "24px" });
  },
};
```
