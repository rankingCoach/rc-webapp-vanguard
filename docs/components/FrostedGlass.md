# FrostedGlass

Visual container that applies a frosted glass (blur + overlay) effect to its content.

- Kind: component
- Import: `import { FrostedGlass } from '@rankingcoach/vanguard';`
- WordPress bundle: no
- Source: `src/core/FrostedGlass/FrostedGlass.tsx`
- Keywords: frosted, glass, blur, overlay, visual, container

## DOM contract

Slots: `[data-slot="frosted-glass"]`

## Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `children` | `React.ReactNode` | yes |  |
| `className` | `string` | no |  |
| `data-slot` | `string` | no |  |
| `id` | `string` | no |  |
| `innerRef` | `React.MutableRefObject<HTMLDivElement> \| ((node?: Element) => void)` | no |  |
| `onClick` | `React.MouseEventHandler<Element>` | no |  |
| `role` | `"article"` | no |  |
| `style` | `React.CSSProperties` | no |  |
| `testId` | `string` | no |  |

## Examples

From `src/core/FrostedGlass/stories/Default.story.tsx`:

```tsx
import React from "react";
import { SbJumpPageBackground } from "@test-utils/get-storybook-decorator";
import { FontWeights, Text } from "@vanguard/Text/Text";
import { within, expect } from "storybook/test";
import { Story } from "./_FrostedGlass.default";
import { FrostedGlass } from "../FrostedGlass";

export const Default: Story = {
  render: () => (
    <SbJumpPageBackground>
      <FrostedGlass>
        <Text textTight={true} fontWeight={FontWeights.medium}>
          Frosted Glass is used for backgrounds
        </Text>
        <Text textTight={true} fontWeight={FontWeights.medium}>
          This is an example of the implementation
        </Text>
      </FrostedGlass>
    </SbJumpPageBackground>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const text1 = canvas.getByText("Frosted Glass is used for backgrounds");
    const text2 = canvas.getByText("This is an example of the implementation");
    await expect(text1).toBeInTheDocument();
    await expect(text2).toBeInTheDocument();
  },
};
```

From `src/core/FrostedGlass/stories/WithClassName.story.tsx`:

```tsx
import React from "react";
import { SbJumpPageBackground } from "@test-utils/get-storybook-decorator";
import { FontWeights, Text } from "@vanguard/Text/Text";
import { within, expect } from "storybook/test";
import { Story } from "./_FrostedGlass.default";
import { FrostedGlass } from "../FrostedGlass";

export const WithClassName: Story = {
  render: () => (
    <SbJumpPageBackground>
      <FrostedGlass className="custom-frosted-glass">
        <Text textTight={true} fontWeight={FontWeights.medium}>
          Frosted Glass with custom class
        </Text>
      </FrostedGlass>
    </SbJumpPageBackground>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const text = canvas.getByText("Frosted Glass with custom class");
    await expect(text).toBeInTheDocument();
    // Check that the custom class is applied
    const frostedGlass = text.closest('.custom-frosted-glass');
    await expect(frostedGlass).toBeInTheDocument();
  },
};
```
