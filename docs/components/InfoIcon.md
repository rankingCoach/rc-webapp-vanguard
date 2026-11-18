# InfoIcon

Small informational icon used to show helper text or tooltips for UI elements.

- Kind: component
- Import: `import { InfoIcon } from '@rankingcoach/vanguard';`
- WordPress bundle: no
- Source: `src/common/InfoIcon/InfoIcon.tsx`
- Keywords: info, icon, tooltip, help, assistant, modal

## DOM contract

No slots yet.

## Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `handleClick` | `(event: React.MouseEvent<Element, MouseEvent>) => void` | no |  |
| `hasModalPuller` | `boolean` | no |  |
| `icon` | `IconNames` | no |  |
| `maxWidth` | `string` | no |  |
| `message` | `React.ReactNode` | no |  |
| `modalBackgroundColor` | `string` | no |  |
| `position` | `PopoverPosition` | no |  |
| `replacements` | `TextReplacements` | no |  |
| `size` | `IconSize` | no |  |
| `testId` | `string` | no |  |
| `theme` | `PopoverTheme` | no |  |
| `title` | `React.ReactNode` | no |  |
