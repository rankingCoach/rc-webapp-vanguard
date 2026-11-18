# Table

Configurable data table component with headers, footers, custom cell renderers and actions.

- Kind: component
- Import: `import { Table } from '@rankingcoach/vanguard';`
- WordPress bundle: no
- Source: `src/core/Table/Table.tsx`
- Keywords: table, data, grid, columns, cells, render

## DOM contract

Slots: `[data-slot="table"]`, `[data-slot="table-container"]`

## Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `blurredCta` | `{ text: string; cta: () => void; }` | no |  |
| `blurredMessage` | `string` | no |  |
| `className` | `string` | no |  |
| `clientPagination` | `TableClientPagination` | no | Client-side paging of `data.collections`; ignores `pagination`/`onNextPage`/`onPrevPage`. |
| `containerClassName` | `string` | no |  |
| `data` | `TableDataProps` | no |  |
| `defaultSort` | `TableSort` | no | Initial sort (uncontrolled). |
| `hasGreyBody` | `boolean` | no |  |
| `hideBlurredMessage` | `boolean` | no |  |
| `hideFooter` | `boolean` | no |  |
| `isLoading` | `boolean` | no |  |
| `onNextPage` | `(currentOffset: number) => void` | no |  |
| `onPrevPage` | `(currentOffset: number) => void` | no |  |
| `onShowLess` | `(currentLimit?: number) => void` | no |  |
| `onShowMore` | `(currentLimit?: number) => void` | no |  |
| `onSortChange` | `(sort: TableSort) => void` | no | Called with the next sort when a sortable header is clicked (asc first, then flips). |
| `pagination` | `TablePaginationProps` | no |  |
| `replacements` | `TextReplacements` | no |  |
| `sort` | `TableSort` | no | Controlled sort. |
| `testId` | `string` | no | Test id of the container; prefixes the toolbar control ids (`table` when unset). |
| `toolbar` | `TableToolbarOptions` | no | Optional toolbar: search, CSV download, column picker, title and actions. Off by default. |

## Examples

From `src/core/Table/stories/Default.story.tsx`:

```tsx
import React from 'react';
import { Story, defaultProps, mockColumns, mockRows, tableTest } from './_Table.default';

export const Default: Story = {
  args: {
    ...defaultProps,
  },
  play: async ({ canvasElement }) => {
    await tableTest({
      canvasElement,
      expectedRows: mockRows.length,
      expectedColumns: mockColumns.length,
    });
  },
};
```

From `src/core/Table/stories/Loading.story.tsx`:

```tsx
import React from 'react';
import { Story, defaultProps } from './_Table.default';
import { within, expect } from 'storybook/test';

export const Loading: Story = {
  args: {
    ...defaultProps,
    isLoading: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // When loading, the table should NOT be rendered
    const table = canvas.queryByRole('table');
    await expect(table).toBeNull();

    // Placeholder/skeletons should be visible instead
    // TablePlaceholder uses Skeleton which has data-testid="Skeleton"
    const skeletons = canvas.getAllByTestId('Skeleton');
    await expect(skeletons.length).toBeGreaterThan(0);
  },
};
```
