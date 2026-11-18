# LineAlert

Single-line inline alert for prominent notices (info, warning, error) within layouts.

- Kind: component
- Import: `import { LineAlert } from '@rankingcoach/vanguard';`
- WordPress bundle: no
- Source: `src/core/LineAlert/LineAlert.tsx`
- Keywords: alert, line, message, inline, warning, error

## DOM contract

No slots yet.

## Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `children` | `string` | yes |  |
| `type` | `LineAlertType` | no |  |

## Examples

From `src/core/LineAlert/stories/Danger.story.tsx`:

```tsx
import React from "react";
import { LineAlert } from "../LineAlert";
import { Story, testMessages } from "./_LineAlert.default";

export const Danger: Story = {
  args: {
    children: testMessages.danger,
    type: "danger",
  },
};
```

From `src/core/LineAlert/stories/Default.story.tsx`:

```tsx
import React from "react";
import { LineAlert } from "../LineAlert";
import { Story, testMessages } from "./_LineAlert.default";

export const Default: Story = {
  args: {
    children: testMessages.default,
    type: "info",
  },
};
```
