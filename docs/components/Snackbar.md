# Snackbar

Transient notification (snackbar/toast) component for short messages and actions.

- Kind: component
- Import: `import { Snackbar } from '@rankingcoach/vanguard';`
- WordPress bundle: no
- Source: `src/core/Snackbar/Snackbar.tsx`
- Keywords: snackbar, toast, notification, temporary, message, action

> Internals pending rebuild: this component still renders MUI internally. Its DOM contract (data-slot parts) is not final yet; style it through the props and classes it documents.

## DOM contract

No slots yet.

## Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `ClickAwayListenerProps` | `Partial<ClickAwayListenerProps>` | no |  |
| `ContentProps` | `Partial<SnackbarContentProps>` | no |  |
| `TransitionComponent` | `React.JSXElementConstructor<TransitionProps & { children: React.ReactElement<unknown, any> \| …` | no |  |
| `TransitionProps` | `TransitionProps` | no |  |

Also accepts: 18 MUI props, 275 React DOM attributes (not listed).
