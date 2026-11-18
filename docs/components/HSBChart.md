# HSBChart

HSB chart visualization supporting hue/saturation/brightness metrics and custom series.

- Kind: component
- Import: `import { HSBChart } from '@rankingcoach/vanguard';`
- WordPress bundle: no
- Source: `src/core/Charts/HSBChart/HSBChart.tsx`
- Keywords: hsb, chart, visualization, hue, saturation, brightness

## DOM contract

No slots yet.

## Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `categories` | `string[]` | yes |  |
| `hasPercentageXaxis` | `boolean` | no |  |
| `height` | `string` | no |  |
| `isLoading` | `boolean` | no |  |
| `isStacked` | `boolean` | no |  |
| `previousSeries` | `HSBChartSeries[]` | no |  |
| `renderBigLegendFn` | `RenderBigLegendFnType` | no |  |
| `series` | `HSBChartSeries[]` | yes |  |
| `showBigLegend` | `boolean` | no |  |
| `showLegend` | `boolean` | no |  |
| `testId` | `string` | no |  |

## Examples

From `src/core/Charts/HSBChart/stories/Default.story.tsx`:

```tsx
import React from "react";
import { Story, defaultProps } from "./_HSBChart.default";
import { within, expect } from "storybook/test";

export const Default: Story = {
  args: {
    ...defaultProps,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Check that the chart container is rendered
    const chartContainer = canvas.getByTestId("HSBChart_TestId");
    expect(chartContainer).toBeInTheDocument();

    // Check that the big legend is rendered
    const bigLegend = canvas.getByTestId("undefined_BigLegend");
    expect(bigLegend).toBeInTheDocument();
  },
};
```

From `src/core/Charts/HSBChart/stories/Loading.story.tsx`:

```tsx
import React from "react";
import { Story, defaultProps } from "./_HSBChart.default";
import { within, expect } from "storybook/test";

export const Loading: Story = {
  args: {
    ...defaultProps,
    isLoading: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Check that the chart container is rendered
    const chartContainer = canvas.getByTestId("HSBChart_TestId");
    expect(chartContainer).toBeInTheDocument();

    // Check that loading placeholder is shown and big legend is not
    const loadingPlaceholder = canvas.getByTestId("ChartsPlaceholder_Container");
    expect(loadingPlaceholder).toBeInTheDocument();
  },
};
```
