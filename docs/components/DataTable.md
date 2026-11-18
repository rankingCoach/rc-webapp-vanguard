# DataTable

- Kind: component
- Import: `import { DataTable } from '@rankingcoach/vanguard';`
- WordPress bundle: no
- Source: `src/core/DataTable/DataTable.tsx`

## DOM contract

Slots: `[data-slot="data-table"]`, `[data-slot="data-table-body"]`, `[data-slot="data-table-cell"]`, `[data-slot="data-table-container"]`, `[data-slot="data-table-foot"]`, `[data-slot="data-table-head"]`, `[data-slot="data-table-row"]`

State / variant attributes: `data-selected`, `data-size`

## Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `aria-label` | `string` | no |  |
| `aria-labelledby` | `string` | no |  |
| `children` | `React.ReactNode` | no |  |
| `className` | `string` | no |  |
| `containerClassName` | `string` | no | Class of the scroll wrapper around the table. |
| `maxHeight` | `string` | no | Max height of the scroll wrapper, e.g. '480px'. Needed for a sticky header to have something to stick in. |
| `minWidth` | `string` | no | Minimum table width (the wrapper scrolls horizontally below it), e.g. '720px'. |
| `size` | `"small" \| "medium"` | no | 'small' = compact rows (admin stats). Default 'medium'. |
| `stickyFirstColumn` | `boolean` | no | First column stays visible while the wrapper scrolls horizontally. |
| `stickyHeader` | `boolean` | no | Header row stays visible while the wrapper scrolls vertically (give the table a `maxHeight`). |
| `testId` | `string` | no |  |
