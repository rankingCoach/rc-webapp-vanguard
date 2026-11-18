# GalleryMediaItem

Individual media item used inside `Gallery` with preview, selection and metadata display.

- Kind: component
- Import: `import { GalleryMediaItem } from '@rankingcoach/vanguard';`
- WordPress bundle: no
- Source: `src/core/Gallery/Gallery/GalleryMediaItem/GalleryMediaItem.tsx`
- Keywords: media, item, gallery, preview, image, video, thumbnail

## DOM contract

No slots yet.

## Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `actions` | `GalleryMediaItemAction[]` | no |  |
| `format` | `GalleryPlaceholderFormat` | no |  |
| `height` | `number` | no |  |
| `isSelected` | `boolean` | no |  |
| `mediaItem` | `MediaItemFile` | yes |  |
| `onSelect` | `(selected: boolean) => void` | no |  |
| `selectable` | `boolean` | no |  |
| `width` | `number` | no |  |
