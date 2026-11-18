# DonutChartDirectories

Donut-chart variant showing directory-based breakdowns, optimized for multi-group data.

- Kind: component
- Import: `import { DonutChartDirectories } from '@rankingcoach/vanguard';`
- WordPress bundle: no
- Source: `src/core/Charts/DonutChart/Custom/DonutChartDirectories/DonutChartDirectories.tsx`
- Keywords: donut, chart, directories, visualization, data, breakdown

## DOM contract

No slots yet.

## Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `badgeStatuses` | `any[]` | no |  |
| `colors` | `string[]` | no |  |
| `isLoading` | `boolean` | no |  |
| `labels` | `string[]` | no |  |
| `renderChildrenNotHoveredFn` | `() => React.ReactNode` | no |  |
| `series` | `number[]` | yes |  |
| `showLegend` | `boolean` | no |  |
| `testId` | `string` | no |  |
