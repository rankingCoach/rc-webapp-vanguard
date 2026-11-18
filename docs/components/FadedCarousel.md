# FadedCarousel

Carousel component with fade effects for transitioning between items.

- Kind: component
- Import: `import { FadedCarousel } from '@rankingcoach/vanguard';`
- WordPress bundle: no
- Source: `src/core/FadedCarousel/FadedCarousel.tsx`
- Keywords: carousel, fade, gallery, slides, transition

## DOM contract

No slots yet.

## Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `arrows` | `ArrowOptions` | no |  |
| `className` | `string` | no |  |
| `fade` | `FadeOptions` | no |  |
| `items` | `React.JSX.Element[]` | yes |  |
| `maxVisibleItems` | `number` | no |  |
| `mode` | `Mode` | no |  |
| `scrollOffset` | `number` | no |  |

## Examples

From `src/core/FadedCarousel/stories/CenterMode.story.tsx`:

```tsx
import React from "react";
import { Story, sampleItems } from "./_FadedCarousel.default";

export const CenterMode: Story = {
  args: {
    items: sampleItems,
    mode: "center",
    fade: { enabled: true, hideAtEdges: true },
    arrows: {
      color: "#333",
      hideOnMobile: false,
      circleSize: 48,
      hoverColor: "#555",
      showBorder: true,
    },
  },
};
```

From `src/core/FadedCarousel/stories/CenterWithElementsBeforeAfter.story.tsx`:

```tsx
import React from "react";
import { Story, sampleItems } from "./_FadedCarousel.default";

export const CenterWithElementsBeforeAfter: Story = {
  args: {
    items: sampleItems,
    mode: "centerWithElementsBeforeAfter",
    maxVisibleItems: 5,
    fade: { enabled: true, hideAtEdges: true },
    arrows: {
      color: "teal",
      hideOnMobile: false,
      circleSize: 48,
      hoverColor: "rgba(0, 128, 128, 0.8)",
      showBorder: true,
    },
  },
};
```
