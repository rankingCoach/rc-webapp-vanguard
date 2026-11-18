# Star

Single star icon component used in rating UIs and visual displays.

- Kind: component
- Import: `import { Star } from '@rankingcoach/vanguard';`
- WordPress bundle: no
- Source: `src/core/StarRating/Star/Star.tsx`
- Keywords: star, rating, icon, visual, score

## DOM contract

Slots: `[data-slot="star"]`, `[data-slot="star-background"]`, `[data-slot="star-hover"]`, `[data-slot="star-result"]`

## Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `bgColor` | `string` | no |  |
| `bgHoverColor` | `string` | no |  |
| `color` | `string` | no |  |
| `disabled` | `boolean` | no | . |
| `hoverValue` | `number` | no |  |
| `index` | `number` | no |  |
| `isBlurred` | `boolean` | no |  |
| `onChange` | `StarValueChangedEventHandler` | no |  |
| `onHoverUpdate` | `StarValueChangedEventHandler` | no |  |
| `readonly` | `boolean` | no |  |
| `size` | `number` | no |  |
| `value` | `number` | yes |  |
