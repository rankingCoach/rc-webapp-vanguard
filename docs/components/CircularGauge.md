# CircularGauge

- Kind: component
- Import: `import { CircularGauge } from '@rankingcoach/vanguard';`
- WordPress bundle: no
- Source: `src/core/CircularGauge/CircularGauge.tsx`

## DOM contract

No slots yet.

## Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `children` | `React.ReactNode` | no | Centered content (number, label, icon). |
| `className` | `string` | no |  |
| `color` | `string` | no | Filled-arc color — CSS variable (`--s400`) or hex. |
| `loading` | `boolean` | no | Render a neutral, partially-filled placeholder ring. |
| `max` | `number` | no | Value that represents a full ring. Defaults to 100. |
| `size` | `number` | no | Outer diameter in px. |
| `strokeWidth` | `number` | no | Ring thickness in px. |
| `trackColor` | `string` | no | Unfilled-track color — CSS variable or hex. |
| `value` | `number` | yes | Current value. Combined with `max` to fill the ring. |

## Examples

From `src/core/CircularGauge/stories/Default.story.tsx`:

```tsx
import { Story, testValues } from './_CircularGauge.default';

export const Default: Story = {
  args: {
    value: testValues.visibility,
  },
};
```

From `src/core/CircularGauge/stories/Loading.story.tsx`:

```tsx
import { Story, testValues } from './_CircularGauge.default';

export const Loading: Story = {
  args: {
    value: testValues.zero,
    loading: true,
  },
};
```
