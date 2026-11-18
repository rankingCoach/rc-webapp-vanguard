# DataTableCell

- Kind: component
- Import: `import { DataTableCell } from '@rankingcoach/vanguard';`
- WordPress bundle: no
- Source: `src/core/DataTable/DataTable.tsx`

## DOM contract

Slots: `[data-slot="data-table"]`, `[data-slot="data-table-body"]`, `[data-slot="data-table-cell"]`, `[data-slot="data-table-container"]`, `[data-slot="data-table-foot"]`, `[data-slot="data-table-head"]`, `[data-slot="data-table-row"]`

State / variant attributes: `data-selected`, `data-size`

## Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `align` | `"center" \| "left" \| "right"` | no |  |
| `children` | `React.ReactNode` | no |  |
| `className` | `string` | no |  |
| `colSpan` | `number` | no |  |
| `header` | `boolean` | no | Render a header cell (`th`). Automatic inside DataTableHead; use it for row labels in the body. |
| `muted` | `boolean` | no | Shade the cell like a header (key column of a key/value table). |
| `numeric` | `boolean` | no | Right-aligned tabular numbers. |
| `rowSpan` | `number` | no |  |
| `scope` | `"col" \| "colgroup" \| "row" \| "rowgroup"` | no | Default: 'col' in DataTableHead, 'row' for a body `header` cell. |
| `style` | `React.CSSProperties` | no |  |
| `testId` | `string` | no |  |
| `title` | `string` | no |  |
