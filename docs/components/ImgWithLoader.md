# ImgWithLoader

Image component that wraps `ImgLoader` with additional features like captions and responsive sizing.

- Kind: component
- Import: `import { ImgWithLoader } from '@rankingcoach/vanguard';`
- WordPress bundle: no
- Source: `src/core/ImgWithLoader/ImgWithLoader.tsx`
- Keywords: image, loader, caption, responsive, fallback, placeholder

## DOM contract

No slots yet.

## Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `additionalText` | `string` | no |  |
| `isLoading` | `boolean` | no |  |
| `mediaType` | `"video" \| "photo"` | no |  |
| `shouldShow` | `boolean` | no |  |
| `showMediaType` | `boolean` | no |  |
| `useBorderRadius` | `boolean` | no |  |

Also accepts: 292 React DOM attributes (not listed).

## Examples

From `src/core/ImgWithLoader/stories/AllProps.story.tsx`:

```tsx
import React from "react";
import { within, expect } from "storybook/test";
import { Story, testImageSrc, testAlt, testAdditionalText, selectors } from "./_ImgWithLoader.default";

export const AllProps: Story = {
  args: {
    src: testImageSrc,
    alt: testAlt,
    shouldShow: true,
    isLoading: false,
    showMediaType: true,
    mediaType: "video",
    additionalText: testAdditionalText,
    useBorderRadius: true,
    width: "300px",
    height: "200px",
  },
  play: async ({ canvasElement }) => {
    // Check that the component renders
    await expect(canvasElement).toBeInTheDocument();

    // Check that skeleton is present
    const skeleton = canvasElement.querySelector('[data-testid="Skeleton"]');
    expect(skeleton).toBeInTheDocument();

    // Check that image is present
    const image = canvasElement.querySelector('img');
    expect(image).toBeInTheDocument();
  },
};
```

From `src/core/ImgWithLoader/stories/Default.story.tsx`:

```tsx
import React from "react";
import { within, expect } from "storybook/test";
import { Story, testImageSrc, testAlt, selectors } from "./_ImgWithLoader.default";

export const Default: Story = {
  args: {
    src: testImageSrc,
    alt: testAlt,
  },
  play: async ({ canvasElement }) => {
    // Check that the component renders
    await expect(canvasElement).toBeInTheDocument();

    // Check that skeleton is present
    const skeleton = canvasElement.querySelector('[data-testid="Skeleton"]');
    expect(skeleton).toBeInTheDocument();

    // Check that image is present
    const image = canvasElement.querySelector('img');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute("src", testImageSrc);
    expect(image).toHaveAttribute("alt", testAlt);
  },
};
```
