# Chip

- Kind: component
- Import: `import { Chip } from '@rankingcoach/vanguard';`
- WordPress bundle: no
- Source: `src/core/Chip/Chip.tsx`

> Internals pending rebuild: this component still renders MUI internally. Its DOM contract (data-slot parts) is not final yet; style it through the props and classes it documents.

## DOM contract

No slots yet.

## Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `className` | `string` | no |  |
| `disabled` | `boolean` | no |  |
| `icon` | `React.ReactElement<unknown, string \| React.JSXElementConstructor<any>>` | no | Leading icon/avatar. |
| `label` | `React.ReactNode` | yes |  |
| `onClick` | `(event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void` | no | Makes the chip clickable. |
| `onDelete` | `(event: React.SyntheticEvent<Element, Event>) => void` | no | Shows a delete icon; called when it is clicked or Backspace/Delete is pressed on the chip. |
| `size` | `"small" \| "medium"` | no | Default 'medium'. |
| `testId` | `string` | no |  |
| `variant` | `"outlined" \| "filled"` | no | Default 'filled'. |

Also accepts: 274 React DOM attributes (not listed).
