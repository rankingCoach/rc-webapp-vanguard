# DonutChartStatistics

Donut chart component that surfaces statistical summaries and percentages alongside the visualization.

- Kind: component
- Import: `import { DonutChartStatistics } from '@rankingcoach/vanguard';`
- WordPress bundle: no
- Source: `src/core/Charts/DonutChart/Custom/DonutChartStatistics/DonutChartStatistics.tsx`
- Keywords: donut, chart, statistics, percentages, visualization

## DOM contract

No slots yet.

## Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `badgeText` | `string[]` | yes |  |
| `colors` | `string[]` | no |  |
| `isLoading` | `boolean` | no |  |
| `labels` | `string[]` | no |  |
| `renderChildrenNotHoveredFn` | `() => React.ReactNode` | no |  |
| `replacements` | `TextReplacements` | no |  |
| `roundNumbers` | `boolean` | no |  |
| `series` | `number[]` | yes |  |
| `showBadge` | `boolean` | no |  |
| `showLegend` | `boolean` | no |  |
| `testId` | `string` | no |  |
| `total` | `number` | yes |  |
| `totalBadgeText` | `string` | yes |  |
| `totalText` | `string` | no |  |
