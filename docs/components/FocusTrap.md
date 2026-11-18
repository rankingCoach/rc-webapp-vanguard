# FocusTrap

- Kind: component
- Import: `import { FocusTrap } from '@rankingcoach/vanguard';`
- WordPress bundle: no
- Source: `src/core/FocusTrap/FocusTrap.tsx`

> Internals pending rebuild: this component still renders MUI internally. Its DOM contract (data-slot parts) is not final yet; style it through the props and classes it documents.

## DOM contract

No slots yet.

## Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `children` | `React.ReactElement<unknown, string \| React.JSXElementConstructor<any>>` | yes | Single element that can hold a ref; give it tabIndex={-1} so it can receive focus. |
| `disableAutoFocus` | `boolean` | no | Do not move focus into the trap when it opens. |
| `disableEnforceFocus` | `boolean` | no | Allow focus to leave the trap. |
| `disableRestoreFocus` | `boolean` | no | Do not restore focus to the previously focused element when the trap closes. |
| `isEnabled` | `() => boolean` | no | Return false to pause the trap (e.g. while another dialog is on top). Default: always enabled. |
| `open` | `boolean` | yes | Trap is mounted and active while true. |
