# CheckBox

Checkbox input with accessible labels and focused state handling for forms.

- Kind: component
- Import: `import { CheckBox } from '@rankingcoach/vanguard';`
- WordPress bundle: yes
- Source: `src/core/CheckBox/CheckBox.tsx`
- Keywords: checkbox, input, form, toggle, accessibility, ui

## DOM contract

No slots yet.

## Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `_hoverMode` | `"border" \| "check"` | no |  |
| `_size` | `"small" \| "large"` | no |  |
| `backgroundColor` | `string` | no |  |
| `checked` | `boolean` | no |  |
| `className` | `string` | no |  |
| `disabled` | `boolean` | no |  |
| `field` | `string` | no | F3: bind to the nearest <Form config>'s field of this name (no `formconfig` prop needed). |
| `formconfig` | `FormConfigElement` | no |  |
| `hovered` | `boolean` | no |  |
| `index` | `number` | no | F3: element index for array fields bound with `field`. |
| `inputRef` | `React.MutableRefObject<HTMLInputElement>` | no |  |
| `intermediate` | `boolean` | no |  |
| `label` | `React.ReactNode` | no |  |
| `labelClassName` | `string` | no |  |
| `labelWordBreak` | `"initial" \| "break-all" \| "break-word"` | no |  |
| `onChange` | `(e: React.ChangeEvent<HTMLInputElement>) => void` | no |  |
| `replacements` | `TextReplacements` | no |  |
| `testId` | `string` | no |  |
| `translate` | `boolean` | no |  |

## Examples

From `src/core/CheckBox/stories/Checked.story.tsx`:

```tsx
import React from "react";
import { CheckBox } from "../CheckBox";
import { within, expect } from "storybook/test";
import { Story, testLabels } from "./_CheckBox.default";

export const Checked: Story = {
  args: {
    label: testLabels.checked,
    checked: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const checkbox = await canvas.findByRole("checkbox");
    await expect(checkbox).toBeChecked();
  },
};
```

From `src/core/CheckBox/stories/Default.story.tsx`:

```tsx
import React from "react";
import { CheckBox } from "../CheckBox";
import { within, expect, userEvent } from "storybook/test";
import { Story, testLabels, selectors } from "./_CheckBox.default";

export const Default: Story = {
  args: {
    label: testLabels.default,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const checkbox = await canvas.findByRole("checkbox");
    await expect(checkbox).not.toBeChecked();

    const label = await canvas.findByText(testLabels.default);
    const user = userEvent.setup();
    await user.click(label);
    await expect(checkbox).toBeChecked();
  },
};
```
