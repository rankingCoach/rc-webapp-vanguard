# MediaItemSelectInput

Form input for selecting media items (images/videos) with preview and selection controls.

- Kind: component
- Import: `import { MediaItemSelectInput } from '@rankingcoach/vanguard';`
- WordPress bundle: no
- Source: `src/core/FileSelect/MediaItemSelectInput.tsx`
- Keywords: media, select, image, video, picker, input, preview

## DOM contract

No slots yet.

## Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `accept` | `ContentType[]` | no |  |
| `isOpen` | `boolean` | yes |  |
| `mediaItemProcessors` | `MediaItemProcessor[]` | no |  |
| `mediaItemTransformers` | `MediaItemTransformer[]` | no |  |
| `mediaItemValidators` | `MediaItemValidator[]` | no |  |
| `multiple` | `boolean` | no |  |
| `onFilesSelected` | `(selectedFiles: MediaItemFile[]) => void` | yes |  |
| `openCallback` | `() => void` | yes |  |
