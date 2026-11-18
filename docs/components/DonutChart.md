# DonutChart

Donut chart visualization for showing proportions with legends and tooltips.

- Kind: component
- Import: `import { DonutChart } from '@rankingcoach/vanguard';`
- WordPress bundle: no
- Source: `src/core/Charts/DonutChart/DonutChart.tsx`
- Keywords: donut, chart, pie, visualization, legend, tooltip

## DOM contract

No slots yet.

## Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `colors` | `string[]` | no |  |
| `isLoading` | `boolean` | no |  |
| `labels` | `string[]` | no |  |
| `renderChildrenFn` | `(index: number, series: number, labels?: string, colors?: string) => React.ReactNode` | no |  |
| `renderChildrenNotHoveredFn` | `() => React.ReactNode` | no |  |
| `series` | `number[]` | yes |  |
| `showLegend` | `boolean` | no |  |
| `testId` | `string` | no |  |
