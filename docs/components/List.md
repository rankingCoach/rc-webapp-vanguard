# List

Generic list renderer supporting different item schemas, layouts and empty states.

- Kind: component
- Import: `import { List } from '@rankingcoach/vanguard';`
- WordPress bundle: no
- Source: `src/core/List/List.tsx`
- Keywords: list, items, collection, render, empty-state, ui

> Internals pending rebuild: this component still renders MUI internally. Its DOM contract (data-slot parts) is not final yet; style it through the props and classes it documents.

## DOM contract

No slots yet.

## Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `classNameListItem` | `string` | no |  |
| `columnsGap` | `number` | no |  |
| `flexBasis` | `boolean` | no |  |
| `footerNote` | `React.ReactNode` | no |  |
| `headerNote` | `React.ReactNode` | no |  |
| `isText` | `boolean` | no |  |
| `limit` | `number` | no |  |
| `listElements` | `ListElementSchema[]` | yes |  |
| `numberOfColumns` | `number` | no |  |
| `onShowLess` | `() => {}` | no |  |
| `onShowMore` | `() => {}` | no |  |
| `replacements` | `TextReplacements` | no |  |
| `textType` | `TextTypes` | no |  |
| `title` | `React.ReactNode` | no |  |
| `type` | `ListType` | yes |  |

## Examples

From `src/core/List/stories/Default.story.tsx`:

```tsx
import React from "react";
import { List } from "../List";
import { Story, sampleListElements, testTitle, testHeaderNote, testFooterNote } from "./_List.default";

export const Default: Story = {
  args: {
    listElements: sampleListElements,
    title: testTitle,
    type: "alphabetical",
    headerNote: testHeaderNote,
    footerNote: testFooterNote,
  },
  play: async ({ canvasElement }) => {
    const { within, expect } = await import("storybook/test");
    const canvas = within(canvasElement);

    // Should render the title
    await expect(canvas.getByText(testTitle)).toBeInTheDocument();

    // Should render the header note
    await expect(canvas.getByText(testHeaderNote)).toBeInTheDocument();

    // Should render list items
    await expect(canvas.getByText("First item")).toBeInTheDocument();
    await expect(canvas.getByText("Second item")).toBeInTheDocument();
    await expect(canvas.getByText("Third item")).toBeInTheDocument();

    // Should render the footer note
    await expect(canvas.getByText(testFooterNote)).toBeInTheDocument();
  },
};
```

From `src/core/List/stories/WithColumns.story.tsx`:

```tsx
import React from "react";
import { List } from "../List";
import { Story, sampleListElements, testTitle } from "./_List.default";

export const WithColumns: Story = {
  args: {
    listElements: sampleListElements,
    title: testTitle,
    type: "none",
    numberOfColumns: 2,
    columnsGap: 20,
  },
  play: async ({ canvasElement }) => {
    const { within, expect } = await import("storybook/test");
    const canvas = within(canvasElement);

    // Should render the title
    await expect(canvas.getByText(testTitle)).toBeInTheDocument();

    // Should render list items
    await expect(canvas.getByText("First item")).toBeInTheDocument();
    await expect(canvas.getByText("Second item")).toBeInTheDocument();
    await expect(canvas.getByText("Third item")).toBeInTheDocument();

    // The list container should exist
    const listContainer = canvas.getByText("First item").closest('[class*="list"]');
    await expect(listContainer).toBeInTheDocument();
  },
};
```
