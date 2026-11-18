# Gallery

Media gallery component for displaying and interacting with image/video collections.

- Kind: component
- Import: `import { Gallery } from '@rankingcoach/vanguard';`
- WordPress bundle: no
- Source: `src/core/Gallery/Gallery/Gallery.tsx`
- Keywords: gallery, images, media, photos, videos, grid, carousel

## DOM contract

No slots yet.

## Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `canDownload` | `boolean` | no |  |
| `className` | `string` | no |  |
| `config` | `{ maxNumberOfMediaItems?: number; maxNumberOfMediaItemsPerType?: Record<string, number>; r \| …` | no |  |
| `downloadCallback` | `(mediaItem: MediaItemFile) => void` | no |  |
| `downloading` | `boolean` | no |  |
| `editMode` | `boolean` | yes |  |
| `mediaItems` | `MediaItemFile[]` | yes |  |
| `onChange` | `GalleryChange` | no |  |
| `onSecondaryChange` | `GalleryChange` | no |  |
| `placeholderConfig` | `{ text: string; format?: GalleryPlaceholderFormat; }` | no |  |

## Examples

From `src/core/Gallery/Gallery/stories/Default.story.tsx`:

```tsx
import React from "react";
import { within, expect } from "storybook/test";
import { Story } from "./_Gallery.default";
import { Gallery, MediaItemFile } from "../Gallery";

const mockMediaItems: MediaItemFile[] = [
  {
    uuid: "1",
    publicUrl: "https://via.placeholder.com/300x200?text=Image+1",
    mediaItemName: "image1.jpg",
    objectType: "mediaItem",
  },
  {
    uuid: "2",
    publicUrl: "https://via.placeholder.com/300x200?text=Image+2",
    mediaItemName: "image2.jpg",
    objectType: "mediaItem",
  },
];

export const Default: Story = {
  render: () => (
    <Gallery
      mediaItems={mockMediaItems}
      editMode={false}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Check that gallery container is present
    const galleryContainer = document.querySelector('.gallery-container');
    await expect(galleryContainer).toBeInTheDocument();
  },
};
```
