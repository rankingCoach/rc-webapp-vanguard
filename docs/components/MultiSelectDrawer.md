# MultiSelectDrawer

Drawer variant that supports selecting multiple items from a list with search and bulk actions.

- Kind: component
- Import: `import { MultiSelectDrawer } from '@rankingcoach/vanguard';`
- WordPress bundle: no
- Source: `src/core/CustomDrawers/MultiSelectDrawer/MultiSelectDrawer.tsx`
- Keywords: drawer, multi-select, selection, picker, bulk, drawer

## DOM contract

No slots yet.

## Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `description` | `React.ReactNode` | no |  |
| `minSelected` | `number` | no |  |
| `onClose` | `() => void` | yes |  |
| `onSave` | `(value: string[]) => void \| Promise<void>` | yes |  |
| `options` | `MultiSelectDrawerOption[]` | yes |  |
| `title` | `string` | yes |  |
| `value` | `string[]` | yes |  |

## Examples

From `src/core/CustomDrawers/MultiSelectDrawer/stories/Default.story.tsx`:

```tsx
import React from "react";
import { MultiSelectDrawer } from "../MultiSelectDrawer";
import { Story, testOptions, testValue, createMockOnSave, createMockOnClose } from "./_MultiSelectDrawer.default";

export const Default: Story = {
  args: {
    value: testValue,
    title: "Select Fruits",
    description: "Choose your favorite fruits from the list below.",
    options: testOptions,
    onSave: createMockOnSave(),
    onClose: createMockOnClose(),
  },
};
```

From `src/core/CustomDrawers/MultiSelectDrawer/stories/WithMinSelected.story.tsx`:

```tsx
import React from "react";
import { MultiSelectDrawer } from "../MultiSelectDrawer";
import { Story, testOptions, createMockOnSave, createMockOnClose } from "./_MultiSelectDrawer.default";

export const WithMinSelected: Story = {
  args: {
    value: [],
    title: "Select Fruits (Minimum 2)",
    description: "You must select at least 2 fruits.",
    options: testOptions,
    minSelected: 2,
    onSave: createMockOnSave(),
    onClose: createMockOnClose(),
  },
};
```
