# BigLegend

Large-format legend used to provide detailed labels and color mappings for charts.

- Kind: component
- Import: `import { BigLegend } from '@rankingcoach/vanguard';`
- WordPress bundle: no
- Source: `src/core/Charts/BigLegend/BigLegend.tsx`
- Keywords: legend, chart, labels, color, big-legend, key

## DOM contract

No slots yet.

## Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `avatar` | `IconNames` | no |  |
| `bigLegendData` | `BigLegendItemProps[]` | yes |  |
| `className` | `string` | no |  |
| `currencyISO` | `string` | no |  |
| `description` | `string` | no |  |
| `descriptionColor` | `string` | no |  |
| `descriptionFont` | `FontWeights` | no |  |
| `descriptionType` | `TextTypes` | no |  |
| `formatWithCurrency` | `boolean` | no |  |
| `iconFillColor` | `string` | no |  |
| `iconName` | `IconNames` | no |  |
| `iconSize` | `IconSize` | no |  |
| `isDateTime` | `boolean` | no |  |
| `isLoading` | `boolean` | no |  |
| `isPercentageFormat` | `boolean` | no |  |
| `isTime` | `boolean` | no |  |
| `locale` | `string` | no |  |
| `maxWidth` | `string \| number` | no |  |
| `previousNumberText` | `string` | no |  |
| `replacements` | `TextReplacements` | no |  |
| `roundNumbers` | `boolean` | no |  |
| `showAvatar` | `boolean` | no |  |
| `showBadge` | `boolean` | no |  |
| `showOutOfSeries` | `boolean` | no |  |
| `showPercentage` | `boolean` | no |  |
| `showPercentageFromTotal` | `boolean` | no |  |
| `showPreviousNumber` | `boolean` | no |  |
| `showPreviousNumberText` | `boolean` | no |  |
| `showTotalNumberSeries` | `boolean` | no |  |
| `style` | `React.CSSProperties` | no |  |
| `testId` | `string` | no |  |
| `title` | `string` | no |  |
| `topTitle` | `React.ReactNode` | no |  |
| `totalNumber` | `number` | no |  |
| `totalNumberSeries` | `string[]` | no |  |
| `totalNumberType` | `TextTypes` | no |  |

## Examples

From `src/core/Charts/BigLegend/stories/Loading.story.tsx`:

```tsx
import React from "react";
import { BigLegend } from "../BigLegend";
import { within, expect } from "storybook/test";
import { IconNames } from "@vanguard/Icon/IconNames";
import { Story } from "./_BigLegend.default";

export const Loading: Story = {
  args: {
    showBadge: true,
    showPercentage: false,
    showPreviousNumber: true,
    previousNumberText: "previously",
    roundNumbers: true,
    maxWidth: "400px",
    isLoading: true,
    testId: "loading-big-legend",
    bigLegendData: [
      {
        currentNumber: 110,
        previousNumber: 105,
        iconName: IconNames.notification,
        iconFillColor: "--p400",
        title: "Website",
        description: "Website clicks made from our Business Profile",
      },
    ],
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    // Test that the component is rendered
    const component = canvas.getByTestId("loading-big-legend");
    await expect(component).toBeInTheDocument();

    // Test that items are not rendered when loading
    await expect(canvas.queryByText("Website")).toBeNull();
  },
};
```
