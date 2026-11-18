# TableFooter

Footer section for tables to host totals, actions, and pagination controls.

- Kind: component
- Import: `import { TableFooter } from '@rankingcoach/vanguard';`
- WordPress bundle: no
- Source: `src/core/Table/TableFooter/TableFooter.tsx`
- Keywords: table, footer, totals, pagination, actions

## DOM contract

Slots: `[data-slot="table-footer"]`, `[data-slot="table-footer-cell"]`, `[data-slot="table-footer-controls"]`, `[data-slot="table-footer-more-controls"]`, `[data-slot="table-footer-pagination"]`, `[data-slot="table-footer-row"]`

## Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `children` | `React.ReactNode` | no |  |
| `provider` | `React.Context<TableContextType>` | no |  |
