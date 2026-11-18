# TreeView

- Kind: component
- Import: `import { TreeView } from '@rankingcoach/vanguard';`
- WordPress bundle: no
- Source: `src/core/TreeView/TreeView.tsx`

## DOM contract

No slots yet.

## Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `aria-label` | `string` | no |  |
| `children` | `React.ReactNode` | no |  |
| `className` | `string` | no |  |
| `defaultCollapseIcon` | `React.ReactNode` | no | Icon of an expanded parent node. Default: caret-down. |
| `defaultEndIcon` | `React.ReactNode` | no | Icon of a leaf node. Default: none. |
| `defaultExpanded` | `string[]` | no | Initially expanded node ids (uncontrolled). |
| `defaultExpandIcon` | `React.ReactNode` | no | Icon of a collapsed parent node. Default: caret-right. |
| `defaultSelected` | `string` | no | Initially selected node id (uncontrolled). |
| `dense` | `boolean` | no | Tighter rows (24px). |
| `expanded` | `string[]` | no | Controlled expanded node ids. |
| `onNodeSelect` | `(event: React.SyntheticEvent<Element, Event>, nodeId: string) => void` | no | Called when a node is selected by click, Enter or Space. |
| `onNodeToggle` | `(event: React.SyntheticEvent<Element, Event>, nodeIds: string[]) => void` | no | Called with the full next list of expanded ids whenever a node is expanded or collapsed. |
| `selected` | `string` | no | Controlled selected node id ('' or null = nothing selected). |
| `showIndentGuide` | `boolean` | no | Draws a vertical guide line next to every nested group. |
| `style` | `React.CSSProperties` | no |  |
| `testId` | `string` | no |  |
