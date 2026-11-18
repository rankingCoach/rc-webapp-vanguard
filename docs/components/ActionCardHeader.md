# ActionCardHeader

Header section for `ActionCard` that contains title, subtitle and optional controls.

- Kind: component
- Import: `import { ActionCardHeader } from '@rankingcoach/vanguard';`
- WordPress bundle: no
- Source: `src/core/ActionCard/ActionCardHeader/ActionCardHeader.tsx`
- Keywords: card, header, title, subtitle, controls

## DOM contract

Slots: `[data-slot="action-card-header"]`, `[data-slot="action-card-header-menu"]`

## Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `actions` | `ActionCardActionProps[]` | no |  |
| `children` | `React.ReactNode` | yes |  |
| `disabled` | `boolean` | no |  |
| `dropdownItems` | `DropdownMenuItemProps[]` | no |  |
