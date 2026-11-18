# Notification

Notification card for system or user messages with optional actions and variants.

- Kind: component
- Import: `import { Notification } from '@rankingcoach/vanguard';`
- WordPress bundle: no
- Source: `src/core/Notification/Notification.tsx`
- Keywords: notification, message, toast, card, alert, action

## DOM contract

No slots yet.

## Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `actions` | `Props[]` | no |  |
| `children` | `React.ReactNode` | no |  |
| `date` | `string` | yes |  |
| `icon` | `string` | no |  |
| `isCompetitor` | `boolean` | yes |  |
| `title` | `string \| React.ReactElement<unknown, string \| React.JSXElementConstructor<any>>` | yes |  |
