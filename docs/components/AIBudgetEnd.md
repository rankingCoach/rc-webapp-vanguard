# AIBudgetEnd

UI component that notifies users when their AI budget or credits have been exhausted.

- Kind: component
- Import: `import { AIBudgetEnd } from '@rankingcoach/vanguard';`
- WordPress bundle: no
- Source: `src/common/AIBudgetEnd/AIBudgetEnd.tsx`
- Keywords: ai, budget, notification, credits, quota, alert

## DOM contract

No slots yet.

## Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `close` | `ModalResponseHandler<null>` | yes |  |
| `compact` | `() => void` | no | Injected only when ModalService.open opts into allowCompact. |
| `ctaNegative` | `ModalFooterAction & SubButtonProps` | no |  |
| `ctaPosition` | `"start" \| "end" \| "between" \| "center"` | no |  |
| `ctaPositive` | `ModalFooterAction & SubButtonProps` | no |  |
| `customNegativeFn` | `(change?: React.Dispatch<React.SetStateAction<number>>) => void` | no |  |
| `expand` | `() => void` | no | Restore the original presentation without losing component state. |
| `firstParagraph` | `string` | no |  |
| `headerType` | `ModalType` | no |  |
| `hideHeaderCloseBtn` | `boolean` | no |  |
| `message` | `React.ReactNode` | no |  |
| `negativeCtaText` | `string` | no |  |
| `positiveCtaText` | `string` | no |  |
| `positiveIconLeft` | `IconNames` | no |  |
| `secondParagraph` | `string` | no |  |
| `title` | `string` | no |  |
