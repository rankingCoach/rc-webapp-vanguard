# Fade

- Kind: component
- Import: `import { Fade } from '@rankingcoach/vanguard';`
- WordPress bundle: no
- Source: `src/core/Fade/Fade.tsx`

> Internals pending rebuild: this component still renders MUI internally. Its DOM contract (data-slot parts) is not final yet; style it through the props and classes it documents.

## DOM contract

No slots yet.

## Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `appear` | `boolean` | no | Run the enter transition on first mount when `in` is true. Default true. |
| `children` | `React.ReactElement<unknown, string \| React.JSXElementConstructor<any>>` | yes | Single element that can hold a ref. It stays mounted (visibility: hidden) after fading out. |
| `in` | `boolean` | yes | Fades the child in while true, out while false. |
| `mountOnEnter` | `boolean` | no | Mount the child only on the first `in`. |
| `onEntered` | `() => void` | no |  |
| `onExited` | `() => void` | no |  |
| `timeout` | `number \| { appear?: number; enter?: number; exit?: number; }` | no | Duration in ms, or per phase. Default enter 225 / exit 195. |
| `unmountOnExit` | `boolean` | no | Unmount the child after it faded out. |
