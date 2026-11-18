# ActionCardAction

Action component used inside `ActionCard` for inline controls like buttons or links.

- Kind: component
- Import: `import { ActionCardAction } from '@rankingcoach/vanguard';`
- WordPress bundle: no
- Source: `src/core/ActionCard/ActionCardActions/ActionCardAction/ActionCardAction.tsx`
- Keywords: action, card, button, link, control

## DOM contract

Slots: `[data-slot="action-card-action"]`, `[data-slot="action-card-action-loader"]`

State / variant attributes: `data-disabled`, `data-loading`

## Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `cta` | `() => void` | yes |  |
| `disabled` | `boolean` | no |  |
| `iconLeft` | `IconNames` | no |  |
| `iconRight` | `IconNames` | no |  |
| `label` | `string` | yes |  |
| `loading` | `boolean` | no |  |
| `testId` | `string` | no |  |
| `textWrap` | `"wrap" \| "no-wrap"` | no |  |
| `type` | `"primary" \| "secondary"` | no |  |
| `width` | `number` | no |  |
