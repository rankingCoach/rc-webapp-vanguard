# TrendDelta

- Kind: component
- Import: `import { TrendDelta } from '@rankingcoach/vanguard';`
- WordPress bundle: no
- Source: `src/core/TrendIndicator/TrendIndicator.tsx`

## DOM contract

Slots: `[data-slot="trend-delta"]`, `[data-slot="trend-delta-value"]`

## Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `className` | `string` | no |  |
| `current` | `number` | yes |  |
| `format` | `(magnitude: number) => string` | no | Override the magnitude formatter. |
| `higherIsBetter` | `boolean` | no | False for inverse metrics where a lower number is better (rank, CPC, unanswered). |
| `previous` | `number` | no |  |
| `showValue` | `boolean` | no | Hide the magnitude text (arrow only). |
| `size` | `number` | no | Icon size in px. |
