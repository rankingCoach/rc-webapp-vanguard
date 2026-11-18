# Popover

Floating, anchored panel positioned relative to a target element for contextual UI content.

- Kind: component
- Import: `import { Popover } from '@rankingcoach/vanguard';`
- WordPress bundle: yes
- Source: `src/core/Popover/Popover.tsx`
- Keywords: popover, tooltip, anchor, position, overlay, contextual

> Internals pending rebuild: this component still renders MUI internally. Its DOM contract (data-slot parts) is not final yet; style it through the props and classes it documents.

## DOM contract

No slots yet.

## Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `arrow` | `boolean` | no |  |
| `children` | `React.ReactElement<unknown, string \| React.JSXElementConstructor<any>>` | yes |  |
| `className` | `Partial<TooltipClasses>` | no |  |
| `describeChild` | `boolean` | no | Use the message as the child's accessible description instead of its label (MUI `describeChild`). |
| `fixedPosition` | `boolean` | no | Position the popper with `position: fixed` from viewport coordinates only (Popper `strategy: 'fixed'` + `computeStyles.adaptive: false`). Use it on pages rendered in quirks mode (no doctype), where the default placement math reads the document height as the viewport and throws the popover off-screen. |
| `hideUnderBreakpoint` | `number` | no | The popover does not appear when the window width is below this given parameter |
| `interactive` | `boolean` | no |  |
| `maxWidth` | `string` | no |  |
| `message` | `React.ReactNode` | no |  |
| `openOnFocus` | `boolean` | no | Also open while the child has keyboard focus (and close on blur). |
| `position` | `PopoverPosition` | no |  |
| `replacements` | `TextReplacements` | no |  |
| `theme` | `PopoverTheme` | no |  |
| `title` | `React.ReactNode` | no |  |
| `wrapChildren` | `boolean` | no |  |
