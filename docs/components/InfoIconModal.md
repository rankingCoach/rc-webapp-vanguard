# InfoIconModal

Modal component triggered from an InfoIcon to display extended help or documentation.

- Kind: component
- Import: `import { InfoIconModal } from '@rankingcoach/vanguard';`
- WordPress bundle: no
- Source: `src/common/InfoIcon/InfoIconModal/InfoIconModal.tsx`
- Keywords: modal, info, help, documentation, tooltip, dialog

## DOM contract

No slots yet.

## Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `backgroundColor` | `string` | no |  |
| `hasPuller` | `boolean` | no |  |
| `message` | `React.ReactNode` | no |  |
| `onOutsideClick` | `(event: React.MouseEvent<Element, MouseEvent>) => void` | no |  |
| `onTouchEnd` | `(event: React.TouchEvent<Element>) => void` | no |  |
| `replacements` | `TextReplacements` | no |  |
| `title` | `React.ReactNode` | no |  |
