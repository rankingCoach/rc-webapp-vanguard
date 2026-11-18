# ModalFooter

Footer area for modals to host actions such as confirm, cancel or secondary buttons.

- Kind: component
- Import: `import { ModalFooter } from '@rankingcoach/vanguard';`
- WordPress bundle: no
- Source: `src/core/Modal/ModalFooter/ModalFooter.tsx`
- Keywords: modal, footer, actions, buttons, confirm, cancel

## DOM contract

No slots yet.

## Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `buttonsPosition` | `"start" \| "end" \| "between" \| "center"` | no |  |
| `buttonsShape` | `ButtonShape` | no |  |
| `children` | `React.ReactNode` | no |  |
| `className` | `string` | no |  |
| `negative` | `ModalFooterAction & SubButtonProps` | no |  |
| `neutral` | `ModalFooterAction & SubButtonProps & { popoverMessage?: string; }` | no |  |
| `padding` | `string \| number` | no |  |
| `positive` | `ModalFooterAction & SubButtonProps & { popoverMessage?: string; }` | no |  |
| `showTopBorder` | `boolean` | no |  |
