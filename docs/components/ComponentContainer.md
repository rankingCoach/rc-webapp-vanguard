# ComponentContainer

Container component that wraps content and provides consistent structure, accessibility attributes, and layout helpers.

- Kind: component
- Import: `import { ComponentContainer } from '@rankingcoach/vanguard';`
- WordPress bundle: yes
- Source: `src/core/ComponentContainer/ComponentContainer.tsx`
- Keywords: container, layout, wrapper, accessibility, component, section, box

## DOM contract

No slots yet.

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

From `src/core/ComponentContainer/stories/Default.story.tsx`:

```tsx
import React from "react";
import { within, expect } from "storybook/test";
import { Story, testChildren, testIds } from "./_ComponentContainer.default";

export const Default: Story = {
  args: {
    children: testChildren.default,
    testId: testIds.default,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const container = canvas.getByTestId(testIds.default);
    await expect(container).toBeInTheDocument();
    await expect(container).toHaveTextContent(testChildren.default);
  },
};
```

From `src/core/ComponentContainer/stories/WithClassName.story.tsx`:

```tsx
import React from "react";
import { within, expect } from "storybook/test";
import { Story, testChildren, testIds } from "./_ComponentContainer.default";

export const WithClassName: Story = {
  args: {
    className: "custom-class",
    children: testChildren.withClass,
    testId: testIds.custom,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const container = canvas.getByTestId(testIds.custom);
    await expect(container).toBeInTheDocument();
    await expect(container).toHaveClass("custom-class");
  },
};
```
