# Breadcrumbs

- Kind: component
- Import: `import { Breadcrumbs } from '@rankingcoach/vanguard';`
- WordPress bundle: no
- Source: `src/core/Breadcrumbs/Breadcrumbs.tsx`

> Internals pending rebuild: this component still renders MUI internally. Its DOM contract (data-slot parts) is not final yet; style it through the props and classes it documents.

## DOM contract

No slots yet.

## Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `aria-label` | `string` | no | Accessible name of the navigation landmark. Default 'breadcrumb'. |
| `children` | `React.ReactNode` | no | Breadcrumb entries (links, text). The last one is usually the current page. |
| `className` | `string` | no |  |
| `itemsAfterCollapse` | `number` | no |  |
| `itemsBeforeCollapse` | `number` | no |  |
| `maxItems` | `number` | no | Collapse to an ellipsis when there are more entries than this. Default 8. |
| `separator` | `React.ReactNode` | no | Rendered between entries. Default '/'. |
| `testId` | `string` | no |  |
