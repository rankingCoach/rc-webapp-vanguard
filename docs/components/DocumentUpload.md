# DocumentUpload

Upload control for documents supporting validation, progress and previews.

- Kind: component
- Import: `import { DocumentUpload } from '@rankingcoach/vanguard';`
- WordPress bundle: no
- Source: `src/core/Documents/DocumentUpload/DocumentUpload.tsx`
- Keywords: document, upload, pdf, validation, progress, file

> Internals pending rebuild: this component still renders MUI internally. Its DOM contract (data-slot parts) is not final yet; style it through the props and classes it documents.

## DOM contract

No slots yet.

## Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `documentName` | `string` | no |  |
| `height` | `string` | no |  |
| `onDocumentRemoved` | `() => void` | yes |  |
| `onDocumentSelected` | `(document: DocumentDataType) => void` | yes |  |
| `testId` | `string` | no |  |
| `width` | `string` | no |  |

## Examples

From `src/core/Documents/DocumentUpload/stories/Default.story.tsx`:

```tsx
import React from "react";
import { DocumentUpload } from "../DocumentUpload";
import { within, expect } from "storybook/test";
import { Story, mockOnDocumentSelected, mockOnDocumentRemoved } from "./_DocumentUpload.default";

export const Default: Story = {
  args: {
    onDocumentSelected: mockOnDocumentSelected,
    onDocumentRemoved: mockOnDocumentRemoved,
    documentName: "Test Document",
  },
  render: (args) => (
    <div style={{ padding: "20px" }}>
      <DocumentUpload {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const container = canvas.getByTestId("DocumentUpload");
    await expect(container).toBeInTheDocument();
  },
};
```

From `src/core/Documents/DocumentUpload/stories/WithCustomDimensions.story.tsx`:

```tsx
import { expect, within } from 'storybook/test';
import React from 'react';

import { DocumentUpload } from '../DocumentUpload';
import { mockOnDocumentRemoved, mockOnDocumentSelected, Story } from './_DocumentUpload.default';

export const WithCustomDimensions: Story = {
  args: {
    onDocumentSelected: mockOnDocumentSelected,
    onDocumentRemoved: mockOnDocumentRemoved,
    width: '120px',
    height: '100px',
  },
  render: (args) => (
    <div style={{ padding: '20px' }}>
      <DocumentUpload {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByTestId('DocumentUpload')).toBeInTheDocument();

    const uploadArea = canvas.getByTestId('UploadDocumentPlaceholder').parentElement!;
    await expect(uploadArea).toHaveStyle({ width: '120px', height: '100px' });
  },
};
```
