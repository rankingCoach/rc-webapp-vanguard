# StarRating

Star rating control for collecting and displaying ratings with interactive selection.

- Kind: component
- Import: `import { StarRating } from '@rankingcoach/vanguard';`
- WordPress bundle: no
- Source: `src/core/StarRating/StarRating.tsx`
- Keywords: rating, stars, component, survey, feedback

## DOM contract

Slots: `[data-slot="star-rating"]`

State / variant attributes: `data-rating`, `data-readonly`

## Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `bgColor` | `string` | no |  |
| `bgHoverColor` | `string` | no |  |
| `color` | `string` | no |  |
| `disabled` | `boolean` | no |  |
| `isBlurred` | `boolean` | no |  |
| `maxNumberOfStars` | `number` | no |  |
| `onChange` | `StarValueChangedEventHandler` | no |  |
| `readonly` | `boolean` | no |  |
| `size` | `number` | yes |  |
| `step` | `number` | no |  |
| `value` | `number` | yes |  |
