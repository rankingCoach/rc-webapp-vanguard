# StatusBadge

Small badge indicating status, review or boost states with optional icon and color variants. Supports an Ado-coloured `ado` status and a `size="compact"` (18px, 11px bold) pill, e.g. the "New" badge: `<StatusBadge status="ado" size="compact" hideIcon text="New" />`. A `variant="glass"` label (dark translucent fill with a blur, white 12px text) sits on photos: `<StatusBadge variant="glass" status="neutral" text="Image" />`.

- Kind: component
- Import: `import { StatusBadge } from '@rankingcoach/vanguard';`
- WordPress bundle: yes
- Source: `src/core/StatusBadge/StatusBadge.tsx`
- Keywords: status, badge, indicator, status-badge, review, pill, compact, new, ado, glass, overlay, photo, image-label

## DOM contract

Slots: `[data-slot="status-badge"]`, `[data-slot="status-badge-value"]`

State / variant attributes: `data-size`, `data-status`, `data-variant`

## Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `borderRadius` | `number` | no |  |
| `capitalizeStatus` | `boolean` | no |  |
| `className` | `string` | no |  |
| `fontWeight` | `FontWeights` | no |  |
| `hideIcon` | `boolean` | no |  |
| `icon` | `IconNames` | no |  |
| `iconVariant` | `StatusBadgeIconVariant` | no |  |
| `isBlurred` | `boolean` | no |  |
| `numberValue` | `number` | no |  |
| `size` | `StatusBadgeSize` | no | Only applies to the `small` variant. `compact`: 18px tall, 11px bold text. |
| `status` | `any` | yes |  |
| `text` | `string` | yes |  |
| `translate` | `boolean` | no |  |
| `variant` | `"big" \| "small" \| "glass"` | no | `glass`: the dark glass label for photos (dark translucent fill with a backdrop blur, white 12px text, 24px tall). Text only: `status`, the icon props and `size` are ignored. |

## Examples

From `src/core/StatusBadge/stories/StatusBadgeInfo.story.tsx`:

```tsx
import { Story } from "./_StatusBadge.default";

export const StatusBadgeInfo: Story = {
  args: {
    status: "info",
  },
};
```

From `src/core/StatusBadge/stories/StatusBadgeNeutral.story.tsx`:

```tsx
import { Story } from "./_StatusBadge.default";

export const StatusBadgeNeutral: Story = {
  args: {
    status: "neutral",
    hideIcon: true,
    text: "Internal text",
  },
};
```
