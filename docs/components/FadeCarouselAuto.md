# FadeCarouselAuto

Auto-advancing carousel with fade transitions for rotating visual content.

- Kind: component
- Import: `import { FadeCarouselAuto } from '@rankingcoach/vanguard';`
- WordPress bundle: no
- Source: `src/core/FadeCarouselAuto/FadeCarouselAuto.tsx`
- Keywords: carousel, fade, slideshow, auto, rotation, gallery

## DOM contract

No slots yet.

## Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `gap` | `number` | no |  |
| `interval` | `number` | no |  |
| `items` | `T[]` | yes |  |
| `ItemType` | `React.FC<T>` | yes |  |
| `speed` | `number` | no |  |

## Examples

From `src/core/FadeCarouselAuto/stories/CustomProps.story.tsx`:

```tsx
import React from "react";
import { FadeCarouselAuto } from "../FadeCarouselAuto";
import { Story, sampleItems, SampleItemComponent } from "./_FadeCarouselAuto.default.tsx";

export const CustomProps: Story = {
  args: {
    items: sampleItems,
    ItemType: SampleItemComponent,
    gap: 15,
    speed: 30,
    interval: 8,
  },
};
```

From `src/core/FadeCarouselAuto/stories/Default.story.tsx`:

```tsx
import React from "react";
import { FadeCarouselAuto } from "../FadeCarouselAuto";
import { within, expect } from "storybook/test";
import { Story, sampleItems, SampleItemComponent } from "./_FadeCarouselAuto.default.tsx";

export const Default: Story = {
  args: {
    items: sampleItems,
    ItemType: SampleItemComponent,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Test that the carousel renders with items
    await expect(canvas.getByText("Item 1")).toBeVisible();
    await expect(canvas.getByText("Item 2")).toBeVisible();
  },
};
```
