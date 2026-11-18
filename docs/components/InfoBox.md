# InfoBox

Box component used to display informational messages with optional icon and actions.

- Kind: component
- Import: `import { InfoBox } from '@rankingcoach/vanguard';`
- WordPress bundle: yes
- Source: `src/core/InfoBox/InfoBox.tsx`
- Keywords: info, box, message, notification, help, alert

## DOM contract

Slots: `[data-slot="info-box"]`, `[data-slot="info-box-body"]`, `[data-slot="info-box-content"]`

State / variant attributes: `data-type`

## Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `borderRadius` | `number` | no |  |
| `className` | `string` | no |  |
| `description` | `React.ReactNode \| string[]` | yes |  |
| `dismissCallback` | `() => void` | no |  |
| `dismissible` | `boolean` | no |  |
| `links` | `LinkReplacements` | no |  |
| `maxWidth` | `string` | no |  |
| `negative` | `InfoBoxButtonAction` | no |  |
| `position` | `InfoBoxPosition` | no |  |
| `positive` | `InfoBoxButtonAction` | no |  |
| `replacements` | `TextReplacements` | no |  |
| `testId` | `string` | no |  |
| `title` | `string` | no |  |
| `type` | `InfoBoxType` | no |  |
| `width` | `string` | no |  |

## Examples

From `src/core/InfoBox/stories/Danger.story.tsx`:

```tsx
import React from "react";
import { InfoBox } from "../InfoBox";
import { Story, testData, selectors } from "./_InfoBox.default";
import { within, expect } from "storybook/test";

export const Danger: Story = {
  args: {
    type: "danger",
    title: testData.title,
    description: testData.description,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(testData.title)).toBeInTheDocument();
    await expect(canvas.getByText(testData.description)).toBeInTheDocument();
  },
};
```

From `src/core/InfoBox/stories/Default.story.tsx`:

```tsx
import React from "react";
import { InfoBox } from "../InfoBox";
import { Story, testData } from "./_InfoBox.default";
import { within, expect } from "storybook/test";

export const Default: Story = {
  args: {
    description: testData.description,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(testData.description)).toBeInTheDocument();
  },
};
```
