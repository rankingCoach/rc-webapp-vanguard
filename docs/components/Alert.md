# Alert

Alert component for displaying prominent messages (success, warning, error, info) with optional actions.

- Kind: component
- Import: `import { Alert } from '@rankingcoach/vanguard';`
- WordPress bundle: no
- Source: `src/core/Alert/Alert.tsx`
- Keywords: alert, message, error, warning, success, info

## DOM contract

Slots: `[data-slot="alert"]`, `[data-slot="alert-container"]`

State / variant attributes: `data-type`

## Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `children` | `string` | yes |  |
| `type` | `"danger" \| "info" \| "warn" \| "success"` | yes |  |

## Examples

From `src/core/Alert/stories/Danger.story.tsx`:

```tsx
import React from "react";
import { within, expect } from "storybook/test";
import { Alert } from "../Alert";
import { Story, testMessages } from "./_Alert.default";

export const Danger: Story = {
  args: {
    type: "danger",
    children: testMessages.danger,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(testMessages.danger)).toBeInTheDocument();
  },
};
```

From `src/core/Alert/stories/Default.story.tsx`:

```tsx
import React from "react";
import { within, expect } from "storybook/test";
import { Alert } from "../Alert";
import { Story, testMessages } from "./_Alert.default";

export const Default: Story = {
  args: {
    type: "info",
    children: testMessages.info,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(testMessages.info)).toBeInTheDocument();
  },
};
```
