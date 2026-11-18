# TableBody

Table body container used to render rows and manage scroll or virtualization.

- Kind: component
- Import: `import { TableBody } from '@rankingcoach/vanguard';`
- WordPress bundle: no
- Source: `src/core/Table/TableBody/TableBody.tsx`
- Keywords: table, body, rows, virtualization, scroll

## DOM contract

Slots: `[data-slot="table-blurred-message"]`, `[data-slot="table-blurred-message-cell"]`, `[data-slot="table-blurred-message-row"]`, `[data-slot="table-body-blurred"]`

## Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `blurredCta` | `{ text: string; cta: () => void; }` | no |  |
| `blurredMessage` | `string` | no |  |
| `children` | `React.ReactNode` | no |  |
| `hasGreyBody` | `boolean` | no |  |
| `hideBlurredMessage` | `boolean` | no |  |
| `provider` | `React.Context<any>` | no |  |
