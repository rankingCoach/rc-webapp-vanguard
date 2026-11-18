# Rating

Star rating component for collecting and displaying ratings with optional precision.

- Kind: component
- Import: `import { Rating } from '@rankingcoach/vanguard';`
- WordPress bundle: no
- Source: `src/core/Rating/Rating.tsx`
- Keywords: rating, stars, review, score, feedback

## DOM contract

Slots: `[data-slot="rating"]`, `[data-slot="rating-container"]`, `[data-slot="rating-value"]`

## Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `bgColor` | `string` | no |  |
| `bgHoverColor` | `string` | no |  |
| `className` | `string` | no |  |
| `color` | `string` | no |  |
| `disabled` | `boolean` | no |  |
| `isBlurred` | `boolean` | no |  |
| `maxNumberOfStars` | `number` | no |  |
| `onChange` | `StarValueChangedEventHandler` | no |  |
| `readonly` | `boolean` | no |  |
| `size` | `number` | yes |  |
| `step` | `number` | no |  |
| `type` | `"stars" \| "emoji"` | no |  |
| `value` | `number` | yes |  |
| `valueAlign` | `"left" \| "right" \| "top"` | no |  |
| `valueColor` | `string` | no |  |
| `valueSize` | `number` | no |  |
