# Pagination

- Kind: component
- Import: `import { Pagination } from '@rankingcoach/vanguard';`
- WordPress bundle: no
- Source: `src/core/Pagination/Pagination.tsx`

> Internals pending rebuild: this component still renders MUI internally. Its DOM contract (data-slot parts) is not final yet; style it through the props and classes it documents.

## DOM contract

No slots yet.

## Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `boundaryCount` | `number` | no | Pages always shown at the start and end. Default 1. |
| `className` | `string` | no |  |
| `count` | `number` | yes | Number of pages. |
| `defaultPage` | `number` | no | Initial page, 1-based (uncontrolled). Default 1. |
| `disabled` | `boolean` | no |  |
| `hideNextButton` | `boolean` | no |  |
| `hidePrevButton` | `boolean` | no |  |
| `onChange` | `(event: React.ChangeEvent<unknown>, page: number) => void` | no | Called with the new 1-based page. |
| `page` | `number` | no | Current page, 1-based (controlled). |
| `shape` | `"rounded" \| "circular"` | no | Default 'circular'. |
| `showFirstButton` | `boolean` | no |  |
| `showLastButton` | `boolean` | no |  |
| `siblingCount` | `number` | no | Pages shown on each side of the current page. Default 1. |
| `size` | `"small" \| "medium" \| "large"` | no | Default 'medium'. |
| `testId` | `string` | no |  |
