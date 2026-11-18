# SuccessModal

Modal used to confirm a successful operation with optional next-step actions.

- Kind: component
- Import: `import { SuccessModal } from '@rankingcoach/vanguard';`
- WordPress bundle: no
- Source: `src/core/StandardModals/SuccessModal/SuccessModal.tsx`
- Keywords: modal, success, confirmation, dialog, ok, done

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
| `title` | `string` | no |  |
