# ListItems

Renderer for collections of list items with layout options and optional selection handling.

- Kind: component
- Import: `import { ListItems } from '@rankingcoach/vanguard';`
- WordPress bundle: no
- Source: `src/core/ListItems/ListItems.tsx`
- Keywords: list, items, collection, render, selection, ui

## DOM contract

No slots yet.

## Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `activeIndex` | `number` | no |  |
| `bottomNote` | `React.ReactNode` | no |  |
| `className` | `string` | no |  |
| `hasSidebarPositionCircle` | `boolean` | no |  |
| `items` | `ListItemType<ObjectType>[]` | yes |  |
| `listClassName` | `string` | no |  |
| `onClick` | `(el: ObjectType, index: number) => void` | no |  |
| `onHover` | `(hoverEl: ObjectType, index: number, isHovered: boolean) => void` | no |  |
| `stickyIndex` | `number` | no |  |
| `stickyItemStyles` | `StickyItemStyles` | no |  |
| `testId` | `string` | no |  |
| `topNote` | `React.ReactNode` | no |  |
