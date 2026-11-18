# NotificationAction

Action control used inside notifications for quick interactions (undo, view, open).

- Kind: component
- Import: `import { NotificationAction } from '@rankingcoach/vanguard';`
- WordPress bundle: no
- Source: `src/core/Notification/NotificationAction/NotificationAction.tsx`
- Keywords: notification, action, button, cta, undo, view

## DOM contract

No slots yet.

## Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `cb` | `() => void` | yes |  |
| `iconLeft` | `IconNames` | no |  |
| `iconRight` | `IconNames` | no |  |
| `label` | `string` | yes |  |
| `width` | `number` | no |  |
