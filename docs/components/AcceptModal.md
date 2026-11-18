# AcceptModal

Standard accept confirmation modal with primary/secondary actions.

- Kind: component
- Import: `import { AcceptModal } from '@rankingcoach/vanguard';`
- WordPress bundle: no
- Source: `src/core/StandardModals/AcceptModal/AcceptModal.tsx`
- Keywords: modal, accept, confirm, dialog, action

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
| `headerType` | `ModalType` | no |  |
| `hideHeaderCloseBtn` | `boolean` | no |  |
| `message` | `React.ReactNode` | no |  |
| `negativeCtaText` | `string` | no |  |
| `positiveCtaText` | `string` | no |  |
| `positiveIconLeft` | `IconNames` | no |  |
| `replacements` | `TextReplacements` | no |  |
| `title` | `string` | no |  |
