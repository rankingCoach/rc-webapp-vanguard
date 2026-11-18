# PopoverModal

Modal that appears anchored to an element like a popover for contextual interactions.

- Kind: component
- Import: `import { PopoverModal } from '@rankingcoach/vanguard';`
- WordPress bundle: no
- Source: `src/core/PopoverModal/PopoverModal.tsx`
- Keywords: popover, modal, anchor, contextual, dialog

> Internals pending rebuild: this component still renders MUI internally. Its DOM contract (data-slot parts) is not final yet; style it through the props and classes it documents.

## DOM contract

No slots yet.

## Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `anchorEl` | `HTMLElement \| HTMLDivElement` | no |  |
| `centerPopover` | `boolean` | no |  |
| `content` | `React.ReactNode` | yes |  |
| `dimRestOfPage` | `boolean` | no |  |
| `disableBackdropClick` | `boolean` | no |  |
| `isOpen` | `boolean` | yes |  |
| `onClose` | `() => void` | no |  |
| `openOnHover` | `boolean` | no |  |
| `placement` | `"bottom" \| "top" \| "auto" \| "bottom-end" \| "bottom-start" \| "top-end" \| "top-start"` | no |  |
| `renderInPortal` | `boolean` | no |  |
| `zIndex` | `number` | no |  |
