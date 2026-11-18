# ErrorModal

Modal used to surface errors and failure states with optional retry or support actions.

- Kind: component
- Import: `import { ErrorModal } from '@rankingcoach/vanguard';`
- WordPress bundle: no
- Source: `src/core/StandardModals/ErrorModal/ErrorModal.tsx`
- Keywords: modal, error, failure, alert, retry, dialog

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
| `err` | `any` | no |  |
| `errorCodes` | `string[]` | no | The error codes the caller received, shown verbatim under the message so the user can quote them to support. Never translated — they are identifiers (e.g. INVALID_CATEGORY), not copy. `err` stays the log payload and is still not rendered. |
| `expand` | `() => void` | no | Restore the original presentation without losing component state. |
| `headerType` | `ModalType` | no |  |
| `hideHeaderCloseBtn` | `boolean` | no |  |
| `message` | `React.ReactNode` | no |  |
| `negativeCtaText` | `string` | no |  |
| `positiveCtaText` | `string` | no |  |
| `positiveIconLeft` | `IconNames` | no |  |
| `replacements` | `TextReplacements` | no | Replacements for `title` and `message`, so a translated sentence can name what was rejected |
| `source` | `string` | yes |  |
| `title` | `string` | no |  |
