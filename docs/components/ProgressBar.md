# ProgressBar

Linear progress bar for indicating completion percentage or upload progress.

- Kind: component
- Import: `import { ProgressBar } from '@rankingcoach/vanguard';`
- WordPress bundle: no
- Source: `src/core/ProgressBar/ProgressBar.tsx`
- Keywords: progress, bar, linear, upload, status, indicator

> Internals pending rebuild: this component still renders MUI internally. Its DOM contract (data-slot parts) is not final yet; style it through the props and classes it documents.

## DOM contract

No slots yet.

## Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `bgColor` | `string` | no |  |
| `className` | `string` | no |  |
| `color` | `string` | no |  |
| `height` | `string` | no |  |
| `isBlurred` | `boolean` | no |  |
| `progressValue` | `number` | no |  |
| `variant` | `"indeterminate" \| "determinate" \| "buffer" \| "query"` | no |  |
| `width` | `string` | no |  |
