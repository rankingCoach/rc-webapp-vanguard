# Avatar

User avatar component that displays images, initials or icon placeholders with sizing options.

- Kind: component
- Import: `import { Avatar } from '@rankingcoach/vanguard';`
- WordPress bundle: no
- Source: `src/core/Avatar/Avatar.tsx`
- Keywords: avatar, user, profile, image, initials, placeholder

## DOM contract

Slots: `[data-slot="avatar"]`, `[data-slot="avatar-notification"]`

State / variant attributes: `data-size`

## Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `bgColor` | `string` | no |  |
| `clearIcon` | `string` | no |  |
| `fullName` | `string` | no |  |
| `greyScale` | `boolean` | no |  |
| `hasNotifications` | `boolean` | no |  |
| `icon` | `string` | no |  |
| `image` | `string` | no |  |
| `name` | `string` | no |  |
| `noHover` | `boolean` | no |  |
| `size` | `AvatarSize` | no |  |
| `translate` | `boolean` | no |  |

## Examples

From `src/core/Avatar/stories/Default.story.tsx`:

```tsx
import React from "react";
import { Avatar } from "../Avatar";
import { Story, testIcon } from "./_Avatar.default";

export const Default: Story = {
  args: {
    icon: testIcon,
  },
};
```

From `src/core/Avatar/stories/WithBgColor.story.tsx`:

```tsx
import React from "react";
import { Avatar } from "../Avatar";
import { Story, testName, testBgColor } from "./_Avatar.default";

export const WithBgColor: Story = {
  args: {
    icon: null,
    name: testName,
    bgColor: testBgColor,
  },
};
```
