# ExportXLS

Utility to export tabular data to XLS/XLSX files, with optional hook for programmatic exports.

- Kind: component
- Import: `import { ExportXLS } from '@rankingcoach/vanguard';`
- WordPress bundle: no
- Source: `src/core/ExportXLS/ExportXLS.tsx`
- Keywords: export, xls, xlsx, spreadsheet, download, excel, data

## DOM contract

No slots yet.

## Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `buttonText` | `string` | no |  |
| `fileName` | `string` | no |  |
| `rows` | `object[]` | no |  |

## Examples

From `src/core/ExportXLS/stories/Default.story.tsx`:

```tsx
import React from "react";
import { ExportXLS } from "../ExportXLS";
import { within, expect } from "storybook/test";
import { Story, sampleRows } from "./_ExportXLS.default";

export const Default: Story = {
  args: {
    rows: sampleRows,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole("button");
    await expect(button).toBeInTheDocument();
    await expect(button).toHaveTextContent("Export XLS");
  },
};
```

From `src/core/ExportXLS/stories/WithCustomButtonText.story.tsx`:

```tsx
import React from "react";
import { ExportXLS } from "../ExportXLS";
import { within, expect } from "storybook/test";
import { Story, sampleRows, customButtonText } from "./_ExportXLS.default";

export const WithCustomButtonText: Story = {
  args: {
    rows: sampleRows,
    buttonText: customButtonText,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole("button");
    await expect(button).toBeInTheDocument();
    await expect(button).toHaveTextContent(customButtonText);
  },
};
```
