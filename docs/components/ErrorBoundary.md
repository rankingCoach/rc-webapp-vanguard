# ErrorBoundary

Error boundary component that catches rendering errors and provides fallback UI and reporting.

- Kind: component
- Import: `import { ErrorBoundary } from '@rankingcoach/vanguard';`
- WordPress bundle: no
- Source: `src/core/RcErrorBoundry/RcErrorBoundry.tsx`
- Keywords: error, boundary, fallback, report, react, crash

## DOM contract

No slots yet.

## Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `children` | `React.ReactNode` | yes |  |
| `description` | `string` | no | The line under the heading, translated. Defaults to "An error occurred while processing your request". |
| `isModal` | `boolean` | no |  |
| `onError` | `(error?: Error, errorInfo?: React.ErrorInfo) => void` | yes |  |
| `title` | `string` | no | The card's heading, translated. Defaults to "Aw, snap!". |
