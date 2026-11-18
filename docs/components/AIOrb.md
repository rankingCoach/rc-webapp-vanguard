# AIOrb

Small indicator showing AI status and activity with size and status variants.

- Kind: component
- Import: `import { AIOrb } from '@rankingcoach/vanguard';`
- WordPress bundle: yes
- Source: `src/core/AIOrb/AIOrb.tsx`
- Keywords: ai, indicator, status, orb, status-indicator

## DOM contract

No slots yet.

## Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `className` | `string` | no |  |
| `size` | `AIOrbSize` | no |  |
| `state` | `AIOrbStatus` | no |  |

## Examples

From `src/core/AIOrb/stories/Default.story.tsx`:

```tsx
import React from "react";
import { AIOrb } from "../AIOrb";
import { within, expect } from "storybook/test";
import { Story } from "./_AIOrb.default";

export const Default: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Test that the component renders
    const aiOrb = canvasElement.querySelector('[class*="ai-orb"]');
    await expect(aiOrb).toBeTruthy();

    // Test that orbs containers are present
    const orbsContainers = canvasElement.querySelectorAll('[class*="orbs-container"]');
    await expect(orbsContainers.length).toBe(4);
  },
};
```

From `src/core/AIOrb/stories/Disconnected.story.tsx`:

```tsx
import React from "react";
import { AIOrb, AIOrbStatus } from "../AIOrb";
import { within, expect } from "storybook/test";
import { Story } from "./_AIOrb.default";

export const Disconnected: Story = {
  args: {
    state: AIOrbStatus.Disconnected,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Test that the component renders
    const aiOrb = canvasElement.querySelector('[class*="ai-orb"]');
    await expect(aiOrb).toBeTruthy();

    // Test that orbs containers are present
    const orbsContainers = canvasElement.querySelectorAll('[class*="orbs-container"]');
    await expect(orbsContainers.length).toBe(4);
  },
};
```
