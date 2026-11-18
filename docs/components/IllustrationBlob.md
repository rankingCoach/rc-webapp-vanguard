# IllustrationBlob

Decorative blob illustration used as background or accent in hero and layout sections.

- Kind: component
- Import: `import { IllustrationBlob } from '@rankingcoach/vanguard';`
- WordPress bundle: no
- Source: `src/core/IllustrationBlob/IllustrationBlob.tsx`
- Keywords: illustration, blob, decorative, background, hero, graphic

## DOM contract

No slots yet.

## Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `color` | `string` | no |  |
| `icon` | `IconNames` | no |  |
| `imageAlignments` | `{ top?: number; left: number; }` | no |  |
| `onlyImage` | `boolean` | no |  |
| `SVGObject` | `SVGObject` | no |  |

## Examples

From `src/core/IllustrationBlob/stories/AllProps.story.tsx`:

```tsx
import {
  Story,
  testIcons,
  testImageAlignments,
  testColors,
  testSVGObjects,
} from './_IllustrationBlob.default';
import { within, expect } from "storybook/test";

export const AllProps: Story = {
  args: {
    icon: testIcons.post,
    SVGObject: testSVGObjects.postsPreview,
    onlyImage: false,
    imageAlignments: testImageAlignments.centered,
    color: testColors.secondary,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Check that the component renders with all props
    await expect(canvasElement).toBeInTheDocument();
  },
};
```

From `src/core/IllustrationBlob/stories/Default.story.tsx`:

```tsx
import { Story } from "./_IllustrationBlob.default";
import { within, expect } from "storybook/test";

export const Default: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Check that the component renders without errors
    await expect(canvasElement).toBeInTheDocument();
  },
};
```
