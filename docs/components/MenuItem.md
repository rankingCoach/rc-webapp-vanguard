# MenuItem

- Kind: component
- Import: `import { MenuItem } from '@rankingcoach/vanguard';`
- WordPress bundle: no
- Source: `src/core/MenuItem/MenuItem.tsx`

> Internals pending rebuild: this component still renders MUI internally. Its DOM contract (data-slot parts) is not final yet; style it through the props and classes it documents.

## DOM contract

Slots: `[data-slot="menu-option"]`

State / variant attributes: `data-disabled`, `data-selected`

## Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `className` | `string` | no |  |
| `icon` | `IconNames` | no |  |
| `iconPosition` | `MenuItemIconPosition` | no |  |
| `iconProps` | `Omit<IconProps, "children">` | no |  |
| `testId` | `string` | no |  |
| `textType` | `TextTypes` | no |  |
| `useActiveIcon` | `boolean` | no |  |

Also accepts: 24 MUI props, 276 React DOM attributes (not listed).
