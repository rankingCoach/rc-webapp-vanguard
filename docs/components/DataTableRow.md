# DataTableRow

- Kind: component
- Import: `import { DataTableRow } from '@rankingcoach/vanguard';`
- WordPress bundle: no
- Source: `src/core/DataTable/DataTable.tsx`

## DOM contract

Slots: `[data-slot="data-table"]`, `[data-slot="data-table-body"]`, `[data-slot="data-table-cell"]`, `[data-slot="data-table-container"]`, `[data-slot="data-table-foot"]`, `[data-slot="data-table-head"]`, `[data-slot="data-table-row"]`

State / variant attributes: `data-selected`, `data-size`

## Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `children` | `React.ReactNode` | no |  |
| `className` | `string` | no |  |
| `hover` | `boolean` | no | Highlight the row on hover (body rows). |
| `onClick` | `(event: React.MouseEvent<HTMLTableRowElement, MouseEvent>) => void` | no |  |
| `selected` | `boolean` | no |  |
| `testId` | `string` | no |  |
