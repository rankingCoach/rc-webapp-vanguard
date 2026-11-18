# LineChartBase

Base line chart component providing core rendering and series handling for line charts.

- Kind: component
- Import: `import { LineChartBase } from '@rankingcoach/vanguard';`
- WordPress bundle: no
- Source: `src/core/Charts/LineChart/LineChart.tsx`
- Keywords: line-chart, chart, line, series, visualization

## DOM contract

No slots yet.

## Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `bigLegendData` | `BigLegendDataTypeBase` | no |  |
| `bigLegendProps` | `Partial<Omit<BigLegendProps, "bigLegendData">>` | no |  |
| `chartTitle` | `React.ReactNode` | no |  |
| `colors` | `string[]` | no |  |
| `customLegendItems` | `string[][]` | no |  |
| `height` | `string` | no |  |
| `infoIconData` | `{ title: string; message: string; messageReplacements?: TextReplacements; }` | no |  |
| `isLoading` | `boolean` | no |  |
| `labelDateFormatter` | `(date: Date) => string` | no |  |
| `labels` | `string[]` | no |  |
| `options` | `ApexCharts.ApexOptions` | no |  |
| `previousSeries` | `lineChartBaseSeriesType<string>[]` | no |  |
| `previousSeriesTotal` | `number` | no |  |
| `provideCustomTotals` | `boolean` | no |  |
| `replacements` | `TextReplacements` | no |  |
| `series` | `lineChartBaseSeriesType<string>[]` | yes |  |
| `seriesTotal` | `number` | no |  |
| `showBadge` | `boolean` | no |  |
| `showBigLegend` | `boolean` | no |  |
| `showChartHeader` | `boolean` | no |  |
| `showInfoIcon` | `boolean` | no |  |
| `showLegend` | `boolean` | no |  |
| `showOutOfSeries` | `boolean` | no |  |
| `showPercentage` | `boolean` | no |  |
| `showPreviousNumber` | `boolean` | no |  |
| `showPreviousNumberText` | `boolean` | no |  |
| `showTotalNumberSeries` | `boolean` | no |  |
| `testId` | `string` | no |  |
| `tooltipDateFormatter` | `(date: Date) => string` | no |  |
| `totalBudgetFormatted` | `string` | no |  |
| `totalBudgetUsedFormatted` | `string` | no |  |
| `width` | `string` | no |  |
| `yaxisMax` | `number` | no |  |
| `yaxisMin` | `number` | no |  |
| `yaxisTickAmount` | `number` | no |  |
