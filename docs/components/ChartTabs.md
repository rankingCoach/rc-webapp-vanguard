# ChartTabs

Tabs control to switch between different chart views or datasets.

- Kind: component
- Import: `import { ChartTabs } from '@rankingcoach/vanguard';`
- WordPress bundle: no
- Source: `src/core/Charts/ChartTabs/ChartTabs.tsx`
- Keywords: chart, tabs, switch, view, datasets

## DOM contract

No slots yet.

## Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `defaultSelectedTab` | `number` | no |  |
| `onClick` | `(index: number) => void` | no |  |
| `tabs` | `ChartTabType[]` | yes |  |
| `testId` | `string` | no |  |

## Examples

From `src/core/Charts/ChartTabs/stories/Default.story.tsx`:

```tsx
import React from "react";
import { ChartTabs } from "../ChartTabs";
import { within, expect } from "storybook/test";
import { IconNames } from "@vanguard/Icon/IconNames";
import { Story } from "./_ChartTabs.default";

const tabs = [
  {
    name: "Overview",
    icon: IconNames.lineChart,
  },
  {
    name: "Demographics",
    icon: IconNames.user,
  },
  {
    name: "Platforms",
    icon: IconNames.duplicate,
  },
];

export const Default: Story = {
  args: {
    tabs: tabs,
    testId: "chart-tabs",
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    // Test that the tabs are rendered
    const tabContainer = canvas.getByTestId("chart-tabs");
    await expect(tabContainer).toBeInTheDocument();

    // Test that tab buttons are present
    await expect(canvas.getByTestId("ChartsTabs-btn-Overview")).toBeInTheDocument();
    await expect(canvas.getByTestId("ChartsTabs-btn-Demographics")).toBeInTheDocument();
    await expect(canvas.getByTestId("ChartsTabs-btn-Platforms")).toBeInTheDocument();
  },
};
```
