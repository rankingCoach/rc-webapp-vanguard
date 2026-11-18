# ImgLoader

Image loader that handles lazy loading, placeholders and retry/fallback behavior.

- Kind: component
- Import: `import { ImgLoader } from '@rankingcoach/vanguard';`
- WordPress bundle: no
- Source: `src/core/ImgLoader/ImgLoader.tsx`
- Keywords: image, loader, lazy, placeholder, fallback, progressive

## DOM contract

No slots yet.

## Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `description` | `string` | no |  |
| `replacements` | `TextReplacements` | no |  |
| `title` | `string` | no |  |

## Examples

From `src/core/ImgLoader/stories/AllProps.story.tsx`:

```tsx
import React from "react";
import { within, expect } from "storybook/test";
import { Story, testTitle, testDescription, testReplacements } from "./_ImgLoader.default";

export const AllProps: Story = {
  args: {
    title: "Loading {count} {item}",
    description: "Please wait for {count} {item} to load.",
    replacements: testReplacements,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Check that all props are rendered correctly
    const title = canvas.getByTestId("title");
    await expect(title).toBeInTheDocument();
    await expect(title).toHaveTextContent("Loading 5 images");

    const description = canvas.getByTestId("description");
    await expect(description).toBeInTheDocument();
    await expect(description).toHaveTextContent("Please wait for 5 images to load.");
  },
};
```

From `src/core/ImgLoader/stories/Default.story.tsx`:

```tsx
import React from "react";
import { within, expect } from "storybook/test";
import { Story } from "./_ImgLoader.default";

export const Default: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Check that the component renders without props
    const img = canvas.getByRole("img");
    await expect(img).toBeInTheDocument();

    // Title and description should be empty
    const title = canvas.getByTestId("title");
    const description = canvas.getByTestId("description");
    await expect(title).toHaveTextContent("");
    await expect(description).toHaveTextContent("");
  },
};
```
