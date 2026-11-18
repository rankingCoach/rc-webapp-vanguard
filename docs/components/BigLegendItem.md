# BigLegendItem

Single item within a `BigLegend`, showing color swatch and descriptive label.

- Kind: component
- Import: `import { BigLegendItem } from '@rankingcoach/vanguard';`
- WordPress bundle: no
- Source: `src/core/Charts/BigLegend/BigLegendItem/BigLegendItem.tsx`
- Keywords: legend-item, big-legend, chart, label, swatch

## DOM contract

No slots yet.

## Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `avatar` | `IconNames` | no |  |
| `className` | `string` | no |  |
| `currencyISO` | `string` | no |  |
| `currentNumber` | `number` | yes |  |
| `description` | `string` | no |  |
| `descriptionColor` | `string` | no |  |
| `descriptionFont` | `FontWeights` | no |  |
| `descriptionType` | `TextTypes` | no |  |
| `formatWithCurrency` | `boolean` | no |  |
| `iconFillColor` | `string` | no |  |
| `iconName` | `IconNames` | no |  |
| `iconSize` | `IconSize` | no |  |
| `isDateTime` | `boolean` | no |  |
| `isPercentageFormat` | `boolean` | no |  |
| `isTime` | `boolean` | no |  |
| `locale` | `string` | no |  |
| `maxWidth` | `string \| number` | no |  |
| `previousNumber` | `number` | no |  |
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

From `src/core/Charts/BigLegend/BigLegendItem/stories/CustomStyling.story.tsx`:

```tsx
import { within, expect } from "storybook/test";
import { Story, baseArgs } from "./_BigLegendItem.default";
import { FontWeights, TextTypes } from "@vanguard/Text/Text";

export const CustomStyling: Story = {
  args: {
    ...baseArgs,
    descriptionColor: "--s400",
    descriptionFont: FontWeights.medium,
    descriptionType: TextTypes.text,
    iconFillColor: "--a2900",
    title: "Custom Styled Item",
    description: "Item with custom styling applied",
    testId: "custom-styling-big-legend-item",
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    // Test that title and description are updated
    await expect(canvas.getByText("Custom Styled Item")).toBeInTheDocument();
    await expect(canvas.getByText("Item with custom styling applied")).toBeInTheDocument();
  },
};
```

From `src/core/Charts/BigLegend/BigLegendItem/stories/Default.story.tsx`:

```tsx
import React from "react";
import { within, expect } from "storybook/test";
import { Story, baseArgs } from "./_BigLegendItem.default";
import { BigLegendItem } from "../BigLegendItem";

export const Default: Story = {
  args: {
    ...baseArgs,
  },
  render: (args) => (
    <div style={{ width: "100%" }}>
      <BigLegendItem {...args} />
    </div>
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    // Test that basic elements are rendered
    await expect(canvas.getByText("Website")).toBeInTheDocument();
    await expect(canvas.getByText("Website clicks made from our Business Profile")).toBeInTheDocument();
    await expect(canvas.getByText("110")).toBeInTheDocument();
    await expect(canvas.getByText("105")).toBeInTheDocument();
    await expect(canvas.getByText("previously")).toBeInTheDocument();

    // Test that badge is shown with correct value
    await expect(canvas.getByText("+4.8%")).toBeInTheDocument();
  },
};
```
