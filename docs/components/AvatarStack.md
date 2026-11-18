# AvatarStack

Displays overlapping avatars with count overflow handling for group representations.

- Kind: component
- Import: `import { AvatarStack } from '@rankingcoach/vanguard';`
- WordPress bundle: no
- Source: `src/core/AvatarStack/AvatarStack.tsx`
- Keywords: avatar, stack, group, overlap, count, team

## DOM contract

No slots yet.

## Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `className` | `string` | no |  |
| `defaultBorderColor` | `string` | no |  |
| `items` | `readonly AvatarStackItem[]` | yes |  |
| `stackWidth` | `string` | no |  |

## Examples

From `src/core/AvatarStack/stories/Default.story.tsx`:

```tsx
import React from "react";
import { AvatarStack } from "../AvatarStack";
import { Story, testItems } from "./_AvatarStack.default";

export const Default: Story = {
  args: {
    items: testItems,
  },
};
```

From `src/core/AvatarStack/stories/Empty.story.tsx`:

```tsx
import React from "react";
import { AvatarStack } from "../AvatarStack";
import { Story, emptyItems } from "./_AvatarStack.default";

export const Empty: Story = {
  args: {
    items: emptyItems,
  },
};
```
