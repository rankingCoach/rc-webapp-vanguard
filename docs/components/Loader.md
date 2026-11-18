# Loader

Indeterminate spinner and loader used for async operations across the app.

- Kind: component
- Import: `import { Loader } from '@rankingcoach/vanguard';`
- WordPress bundle: no
- Source: `src/core/Loader/Loader.tsx`
- Keywords: loader, spinner, loading, progress, async

## DOM contract

Slots: `[data-slot="loader"]`, `[data-slot="loader-container"]`

## Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `loading` | `boolean` | yes |  |
| `testId` | `string` | no |  |

## Examples

From `src/core/Loader/stories/InContainer.story.tsx`:

```tsx
import React from "react";
import { within, expect } from "storybook/test";
import { Story, testIds } from "./_Loader.default";
import { Loader } from "../Loader";

export const InContainer: Story = {
  args: {
    loading: true,
    testId: testIds.loader,
  },
  render: (args) => (
    <div
      style={{
        height: "200px",
        width: "300px",
        border: "1px solid #ccc",
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}
    >
      <div>Some content that is loading...</div>
      <Loader {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const loader = canvas.getByTestId(testIds.loader);
    await expect(loader).toBeInTheDocument();
  },
};
```

From `src/core/Loader/stories/Loading.story.tsx`:

```tsx
import React from "react";
import { within, expect } from "storybook/test";
import { Story, testIds } from "./_Loader.default";

export const Loading: Story = {
  args: {
    loading: true,
    testId: testIds.loader,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const loader = canvas.getByTestId(testIds.loader);
    await expect(loader).toBeInTheDocument();
  },
};
```
