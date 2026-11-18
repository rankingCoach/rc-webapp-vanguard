# TextEditDrawer

Drawer UI for editing large text fields with controls for save/cancel and validation.

- Kind: component
- Import: `import { TextEditDrawer } from '@rankingcoach/vanguard';`
- WordPress bundle: no
- Source: `src/core/CustomDrawers/TextEditDrawer/TextEditDrawer.tsx`
- Keywords: drawer, text-edit, editor, textarea, save, cancel

## DOM contract

No slots yet.

## Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `defaultValue` | `string` | no |  |
| `description` | `string` | no |  |
| `maxLength` | `number` | no |  |
| `onClose` | `() => void` | yes |  |
| `onSave` | `(value: string) => void` | yes |  |
| `required` | `boolean` | no |  |
| `title` | `string` | yes |  |
| `value` | `string` | yes |  |

## Examples

From `src/core/CustomDrawers/TextEditDrawer/stories/Default.story.tsx`:

```tsx
import React from "react";
import { TextEditDrawer } from "../TextEditDrawer";
import { Story, testValue, testTitle, testDescription, testMaxLength, createMockOnSave, createMockOnClose } from "./_TextEditDrawer.default";

export const Default: Story = {
  args: {
    value: testValue,
    title: testTitle,
    description: testDescription,
    maxLength: testMaxLength,
    onSave: createMockOnSave(),
    onClose: createMockOnClose(),
  },
};
```

From `src/core/CustomDrawers/TextEditDrawer/stories/Required.story.tsx`:

```tsx
import React from "react";
import { TextEditDrawer } from "../TextEditDrawer";
import { Story, testTitle, createMockOnSave, createMockOnClose } from "./_TextEditDrawer.default";

export const Required: Story = {
  args: {
    value: "",
    title: testTitle,
    description: "This field is required and cannot be empty.",
    required: true,
    onSave: createMockOnSave(),
    onClose: createMockOnClose(),
  },
};
```
