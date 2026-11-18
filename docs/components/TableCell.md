# TableCell

Table cell component with flexible rendering and alignment options.

- Kind: component
- Import: `import { TableCell } from '@rankingcoach/vanguard';`
- WordPress bundle: no
- Source: `src/core/Table/TableCell/TableCell.tsx`
- Keywords: cell, table, column, render, align

## DOM contract

Slots: `[data-slot="table-cell"]`, `[data-slot="table-cell-content"]`, `[data-slot="table-cell-inner"]`

State / variant attributes: `data-type`

## Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `colIndex` | `number` | no |  |
| `column` | `TableColumnProps` | no |  |
| `hasGreyBody` | `boolean` | no |  |
| `isBlurred` | `boolean` | no |  |
| `options` | `TableOptionsProps` | no |  |
| `row` | `any` | no |  |
| `rowIndex` | `number` | no |  |
