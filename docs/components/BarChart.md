# BarChart

Bar chart visualization for comparing categories and values with axis and legends.

- Kind: component
- Import: `import { BarChart } from '@rankingcoach/vanguard';`
- WordPress bundle: no
- Source: `src/core/Charts/BarChart/BarChart.tsx`
- Keywords: bar-chart, chart, visualization, categories, values, legend

## DOM contract

No slots yet.

## Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `categories` | `string[]` | yes |  |
| `chartTitle` | `React.ReactNode` | no |  |
| `colors` | `string[]` | no |  |
| `columnWidth` | `string` | no |  |
| `containerWidth` | `string` | no |  |
| `customLegendItems` | `string[]` | yes |  |
| `customTooltipFormatter` | `(category: string, value: number, dataPointIndex: number) => React.ReactNode` | no |  |
| `distributed` | `boolean` | no |  |
| `height` | `string` | no |  |
| `isLoading` | `boolean` | no |  |
| `legendFillColors` | `string[]` | no |  |
| `legendFormatter` | `(legendName: string, opts?: any) => string` | no |  |
| `replacements` | `TextReplacements` | no |  |
| `series` | `BarChartSeries[]` | yes |  |
| `showBigLegend` | `boolean` | no |  |
| `showGrid` | `boolean` | no |  |
| `showLegend` | `boolean` | yes |  |
| `showPercentage` | `boolean` | no |  |
| `showYaxis` | `boolean` | no |  |
| `testId` | `string` | no |  |
| `width` | `string` | no |  |
| `yAxisDataFormatter` | `(value: number, index: any) => string` | no |  |

## Examples

From `src/core/Charts/BarChart/stories/Default.story.tsx`:

```tsx
import React from "react";
import { BarChart } from "../BarChart";
import { within, expect } from "storybook/test";
import { Story } from "./_BarChart.default";

export const Default: Story = {
  args: {
    series: [
      {
        name: "",
        data: [800, 430, 548, 470, 540],
      },
    ],
    categories: ["5 stars", "4 stars", "3 stars", "2 stars", "1 stars"],
    colors: ["var(--s400)", "var(--s400)", "var(--a2900)", "var(--e500)", "var(--e500)"],
    showLegend: true,
    chartTitle: "Total number of reviews",
    customLegendItems: ["Good", "Neutral", "Bad"],
    legendFillColors: ["var(--s400)", "var(--a2900)", "var(--e500)"],
    height: "250px",
    testId: "bar-chart",
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    // Test that the chart is rendered
    const chart = canvas.getByTestId("bar-chart");
    await expect(chart).toBeInTheDocument();
  },
};
```
