# DocumentDisplay

Component that previews documents (PDF, images) with optional download and view controls.

- Kind: component
- Import: `import { DocumentDisplay } from '@rankingcoach/vanguard';`
- WordPress bundle: no
- Source: `src/core/Documents/DocumentDisplay/DocumentDisplay.tsx`
- Keywords: document, preview, pdf, display, viewer, media

> Internals pending rebuild: this component still renders MUI internally. Its DOM contract (data-slot parts) is not final yet; style it through the props and classes it documents.

## DOM contract

No slots yet.

## Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `documentName` | `string` | no |  |
| `fileMimeType` | `DocumentFileMimeType` | yes |  |
| `fileName` | `string` | yes |  |
| `fileSrc` | `string` | yes |  |
| `height` | `string` | no |  |
| `showDownload` | `boolean` | no |  |
| `srcIsBase64` | `boolean` | no |  |
| `testId` | `string` | no |  |
| `width` | `string` | no |  |

## Examples

From `src/core/Documents/DocumentDisplay/stories/CustomDimensions.story.tsx`:

```tsx
import React from "react";
import { DocumentDisplay } from "../DocumentDisplay";
import { within, expect } from "storybook/test";
import { Story, testDocumentData } from "./_DocumentDisplay.default";

export const CustomDimensions: Story = {
  args: {
    ...testDocumentData,
    width: "300px",
    height: "200px",
  },
  render: (args) => (
    <div style={{ padding: "20px" }}>
      <DocumentDisplay {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const container = canvas.getByTestId("DocumentDisplay");
    await expect(container).toBeInTheDocument();
    const pdfEmbed = canvas.getByTestId("DocumentDisplay_PDF");
    await expect(pdfEmbed).toBeInTheDocument();
    await expect(pdfEmbed).toHaveAttribute("width", "300px");
    await expect(pdfEmbed).toHaveAttribute("height", "200px");
  },
};
```

From `src/core/Documents/DocumentDisplay/stories/Default.story.tsx`:

```tsx
import React from "react";
import { DocumentDisplay } from "../DocumentDisplay";
import { within, expect } from "storybook/test";
import { Story, testDocumentData } from "./_DocumentDisplay.default";

export const Default: Story = {
  args: testDocumentData,
  render: (args) => (
    <div style={{ padding: "20px" }}>
      <DocumentDisplay {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const container = canvas.getByTestId("DocumentDisplay");
    await expect(container).toBeInTheDocument();
    const pdfEmbed = canvas.getByTestId("DocumentDisplay_PDF");
    await expect(pdfEmbed).toBeInTheDocument();
  },
};
```
