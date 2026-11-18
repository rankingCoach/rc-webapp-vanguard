# ArcGauge

Visual arc gauge used to represent progress, percentages or single-value metrics.

- Kind: component
- Import: `import { ArcGauge } from '@rankingcoach/vanguard';`
- WordPress bundle: no
- Source: `src/core/ArcGauge/ArcGauge.tsx`
- Keywords: gauge, arc, progress, metric, visualization

## DOM contract

No slots yet.

## Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `color1` | `string` | no |  |
| `color2` | `string` | no |  |
| `mask` | `"full" \| "simple"` | no |  |
| `text` | `string` | no |  |
| `value` | `number` | yes |  |

## Examples

From `src/core/ArcGauge/stories/Default.story.tsx`:

```tsx
import { Story, testValues } from "./_ArcGauge.default";
import { within, expect } from "storybook/test";

export const Default: Story = {
  args: {
    value: testValues.ninety,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Test that the component renders
    await expect(canvas.getByAltText("")).toBeInTheDocument();
  },
};
```

From `src/core/ArcGauge/stories/WithCustomColors.story.tsx`:

```tsx
import { Story, testValues, testColors } from "./_ArcGauge.default";
import { within, expect } from "storybook/test";

export const WithCustomColors: Story = {
  args: {
    value: testValues.ninety,
    color1: testColors.primary,
    color2: testColors.secondary,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Test that the component renders with custom colors
    await expect(canvas.getByAltText("")).toBeInTheDocument();
  },
};
```
