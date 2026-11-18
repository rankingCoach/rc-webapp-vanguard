# AreaChart

Area chart for visualizing time-series or stacked area datasets with axes and legends.

- Kind: component
- Import: `import { AreaChart } from '@rankingcoach/vanguard';`
- WordPress bundle: no
- Source: `src/core/Charts/AreaChart/AreaChart.tsx`
- Keywords: area-chart, chart, time-series, visualization, legend

## DOM contract

No slots yet.

## Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `height` | `string \| number` | no |  |
| `isLoading` | `boolean` | no |  |
| `options` | `object \| ApexCharts.ApexOptions` | no |  |
| `series` | `any[]` | yes |  |
| `testId` | `string` | no |  |
| `width` | `string \| number` | no |  |

## Examples

From `src/core/Charts/AreaChart/stories/Default.story.tsx`:

```tsx
import React from "react";
import { AreaChart } from "../AreaChart";
import { within, expect } from "storybook/test";
import { Story } from "./_AreaChart.default";

const mockSeries = [
  [10, 20],
  [15, 25],
  [20, 30],
  [25, 35],
  [30, 40],
];

export const Default: Story = {
  args: {
    options: {},
    series: mockSeries,
    testId: "area-chart",
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    // Test that the chart is rendered
    const chart = canvas.getByTestId("area-chart");
    await expect(chart).toBeInTheDocument();
  },
};
```
