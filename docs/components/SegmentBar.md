# SegmentBar

- Kind: component
- Import: `import { SegmentBar } from '@rankingcoach/vanguard';`
- WordPress bundle: no
- Source: `src/core/SegmentBar/SegmentBar.tsx`

## DOM contract

No slots yet.

## Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `className` | `string` | no |  |
| `height` | `number` | no | Bar height in px. |
| `loading` | `boolean` | no | Render an evenly-split neutral placeholder. |
| `segments` | `SegmentBarSegment[]` | yes |  |

## Examples

From `src/core/SegmentBar/stories/Default.story.tsx`:

```tsx
import { Story, testSegments } from './_SegmentBar.default';

export const Default: Story = {
  args: {
    segments: [...testSegments.sentiment],
    height: 8,
  },
};
```

From `src/core/SegmentBar/stories/Loading.story.tsx`:

```tsx
import { Story, testSegments } from './_SegmentBar.default';

export const Loading: Story = {
  args: {
    segments: [...testSegments.coverage],
    height: 8,
    loading: true,
  },
};
```
