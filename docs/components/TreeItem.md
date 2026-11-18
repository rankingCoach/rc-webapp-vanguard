# TreeItem

- Kind: component
- Import: `import { TreeItem } from '@rankingcoach/vanguard';`
- WordPress bundle: no
- Source: `src/core/TreeView/TreeItem.tsx`

## DOM contract

No slots yet.

## Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `children` | `React.ReactNode` | no | Nested TreeItems. A node with at least one child element is expandable. |
| `className` | `string` | no |  |
| `collapseIcon` | `React.ReactNode` | no | Overrides the TreeView's defaultCollapseIcon for this node. |
| `contentClassName` | `string` | no | Class of the clickable row. |
| `disabled` | `boolean` | no | Disabled nodes cannot be selected or toggled. |
| `expandIcon` | `React.ReactNode` | no | Overrides the TreeView's defaultExpandIcon for this node. |
| `icon` | `React.ReactNode` | no | Icon shown in the icon slot regardless of state (leaf icon). Overrides defaultEndIcon. |
| `label` | `React.ReactNode` | yes |  |
| `labelClassName` | `string` | no | Class of the label element (replacement for MUI `classes.label`). |
| `nodeId` | `string` | yes | Unique id of the node inside its TreeView. |
| `testId` | `string` | no |  |
