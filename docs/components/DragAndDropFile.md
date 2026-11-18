# DragAndDropFile

Drag-and-drop file upload area with visual dropzone, validation and progress.

- Kind: component
- Import: `import { DragAndDropFile } from '@rankingcoach/vanguard';`
- WordPress bundle: no
- Source: `src/core/DragAndDropFile/DragAndDropFile.tsx`
- Keywords: drag-and-drop, dropzone, upload, file, drag, upload

## DOM contract

No slots yet.

## Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `onFileDrop` | `FileCallback` | yes |  |

## Examples

From `src/core/DragAndDropFile/stories/Default.story.tsx`:

```tsx
import { within, expect } from "storybook/test";
import { Story, createMockOnFileDrop } from "./_DragAndDropFile.default";

export const Default: Story = {
  args: {
    onFileDrop: createMockOnFileDrop(),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const dropzone = canvas.getByText("Drag and drop files here");
    await expect(dropzone).toBeInTheDocument();
  },
};
```
