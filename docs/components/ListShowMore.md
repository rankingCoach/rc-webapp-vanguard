# ListShowMore

List variant that supports expanding or loading more items with a show-more control.

- Kind: component
- Import: `import { ListShowMore } from '@rankingcoach/vanguard';`
- WordPress bundle: no
- Source: `src/core/List/ListShowMore/ListShowMore.tsx`
- Keywords: list, show-more, load-more, pagination, expand, lazy

> Internals pending rebuild: this component still renders MUI internally. Its DOM contract (data-slot parts) is not final yet; style it through the props and classes it documents.

## DOM contract

No slots yet.

## Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `classNameListItem` | `string` | no |  |
| `columnsGap` | `number` | no |  |
| `flexBasis` | `boolean` | no |  |
| `footerNote` | `React.ReactNode` | no |  |
| `headerNote` | `React.ReactNode` | no |  |
| `isText` | `boolean` | no |  |
| `limit` | `number` | no |  |
| `listElements` | `ListElementSchema[]` | yes |  |
| `numberOfColumns` | `number` | no |  |
| `onShowLess` | `() => {}` | no |  |
| `onShowMore` | `() => {}` | no |  |
| `replacements` | `TextReplacements` | no |  |
| `textType` | `TextTypes` | no |  |
| `title` | `React.ReactNode` | no |  |
| `type` | `ListType` | yes |  |
