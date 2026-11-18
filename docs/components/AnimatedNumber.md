# AnimatedNumber

- Kind: component
- Import: `import { AnimatedNumber } from '@rankingcoach/vanguard';`
- WordPress bundle: no
- Source: `src/core/AnimatedNumber/AnimatedNumber.tsx`

## DOM contract

Slots: `[data-slot="animated-number"]`

## Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `animate` | `boolean` | no | Set false to freeze at 0 (e.g. while the parent is loading). |
| `className` | `string` | no |  |
| `decimals` | `number` | no | Decimal places to display. |
| `durationMs` | `number` | no | Tween duration in ms. |
| `formatter` | `(value: number) => string` | no | Format the final value (applied once the tween reaches the target). |
| `style` | `React.CSSProperties` | no |  |
| `value` | `number` | yes | Target value to count up to. |

## Examples

From `src/core/AnimatedNumber/stories/Decimals.story.tsx`:

```tsx
import { Story, testValues } from './_AnimatedNumber.default';

export const Decimals: Story = {
  args: {
    value: testValues.rating,
    decimals: 1,
  },
};
```

From `src/core/AnimatedNumber/stories/Default.story.tsx`:

```tsx
import { Story, testValues } from './_AnimatedNumber.default';

export const Default: Story = {
  args: {
    value: testValues.actions,
  },
};
```
