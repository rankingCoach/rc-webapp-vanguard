# ModalHeader

Header element for modals typically containing the title and optional close control.

- Kind: component
- Import: `import { ModalHeader } from '@rankingcoach/vanguard';`
- WordPress bundle: no
- Source: `src/core/Modal/Modalheader/ModalHeader.tsx`
- Keywords: modal, header, title, close, dialog

## DOM contract

No slots yet.

## Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `children` | `React.ReactNode` | no |  |
| `className` | `string` | no |  |
| `closeFn` | `(response?: ModalResponse<any>) => void` | no |  |
| `hideCloseButtonOnMobile` | `boolean` | no |  |
| `hideHeaderCloseBtn` | `boolean` | no |  |
| `hideTypeIcon` | `boolean` | no |  |
| `replacements` | `TextReplacements` | no |  |
| `title` | `string` | no |  |
| `titleTextType` | `TextTypes` | no |  |
| `type` | `ModalType` | no |  |
