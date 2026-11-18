# ClipboardText

Small control that copies text to clipboard and shows visual confirmation/snackbars.

- Kind: component
- Import: `import { ClipboardText } from '@rankingcoach/vanguard';`
- WordPress bundle: no
- Source: `src/core/ClipboardText/ClipboardText.tsx`
- Keywords: clipboard, copy, text, copy-to-clipboard, feedback

## DOM contract

No slots yet.

## Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `label` | `string` | yes |  |
| `value` | `string` | yes |  |

## Examples

From `src/core/ClipboardText/stories/Default.story.tsx`:

```tsx
import React from "react";
import { ClipboardText } from "../ClipboardText";
import { within, expect } from "storybook/test";
import { Story, testData } from "./_ClipboardText.default";

export const Default: Story = {
  args: {
    label: testData.label,
    value: testData.value,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(testData.label)).toBeInTheDocument();
    await expect(canvas.getByText(testData.value)).toBeInTheDocument();
  },
};
```
