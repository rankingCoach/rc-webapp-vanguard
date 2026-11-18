# ActionCard

Card component that groups primary content with actionable controls and metadata.

- Kind: component
- Import: `import { ActionCard } from '@rankingcoach/vanguard';`
- WordPress bundle: no
- Source: `src/core/ActionCard/ActionCard.tsx`
- Keywords: card, action, panel, controls, metadata

## DOM contract

Slots: `[data-slot="action-card"]`, `[data-slot="action-card-content"]`

## Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `actions` | `ActionCardActionProps[]` | no |  |
| `cardBodyStyle` | `React.CSSProperties` | no |  |
| `children` | `React.ReactNode` | yes |  |
| `id` | `string` | no |  |
| `innerRef` | `React.MutableRefObject<HTMLDivElement>` | no |  |
| `testId` | `string` | no |  |
| `transparent` | `boolean` | no |  |

## Examples

From `src/core/ActionCard/stories/Default.story.tsx`:

```tsx
import React from "react";
import { ActionCard } from "../ActionCard";
import { Story, testChildren } from "./_ActionCard.default.tsx";

export const Default: Story = {
  args: {
    children: testChildren,
  },
};
```

From `src/core/ActionCard/stories/Transparent.story.tsx`:

```tsx
import React from "react";
import { ActionCard } from "../ActionCard";
import { Story, testChildren } from "./_ActionCard.default.tsx";

export const Transparent: Story = {
  args: {
    children: testChildren,
    transparent: true,
  },
};
```
