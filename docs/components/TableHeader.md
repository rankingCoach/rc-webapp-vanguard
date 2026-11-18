# TableHeader

Header row component for tables providing column labels, sort controls and actions.

- Kind: component
- Import: `import { TableHeader } from '@rankingcoach/vanguard';`
- WordPress bundle: no
- Source: `src/core/Table/TableHeader/TableHeader.tsx`
- Keywords: table, header, columns, sort, labels

## DOM contract

Slots: `[data-slot="table-header"]`, `[data-slot="table-header-cell"]`, `[data-slot="table-row"]`, `[data-slot="table-sort-button"]`

## Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `children` | `React.ReactNode` | no |  |
| `className` | `string` | no |  |
| `hasGreyTheme` | `boolean` | no |  |
| `order` | `string` | no |  |
| `provider` | `React.Context<TableContextType>` | no |  |
