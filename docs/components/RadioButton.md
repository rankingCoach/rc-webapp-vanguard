# RadioButton

Single radio input element supporting labels and accessibility features.

- Kind: component
- Import: `import { RadioButton } from '@rankingcoach/vanguard';`
- WordPress bundle: no
- Source: `src/core/RadioButton/RadioButton.tsx`
- Keywords: radio, input, form, choice, accessibility, option

## DOM contract

No slots yet.

## Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `capitalizeOption` | `boolean` | no |  |
| `checked` | `boolean` | yes |  |
| `children` | `React.ReactNode` | no |  |
| `disabled` | `boolean` | no |  |
| `formConfig` | `FormConfigElement` | no |  |
| `infoText` | `React.ReactNode` | no |  |
| `inputName` | `string` | yes |  |
| `labelClassName` | `string` | no |  |
| `labelText` | `React.ReactNode` | yes |  |
| `onChangeFn` | `() => void` | yes |  |
| `replacements` | `TextReplacements` | no |  |
| `testId` | `string` | no |  |
| `theme` | `"success" \| "standard" \| "bordered"` | yes |  |
| `translate` | `boolean` | no |  |
| `value` | `ValueType` | yes |  |

## Examples

From `src/core/RadioButton/stories/BorderedTheme.story.tsx`:

```tsx
import React from "react";
import { RadioButton } from "../RadioButton";
import { within, expect } from "storybook/test";
import { Story, mockOnChange, testOptions } from "./_RadioButton.default";

export const BorderedTheme: Story = {
  args: {
    inputName: "test-radio",
    theme: "bordered",
    labelText: "Bordered Option",
    value: testOptions.bordered,
    onChangeFn: mockOnChange,
    testId: "radio-button",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const label = canvas.getByText("Bordered Option");
    await expect(label).toBeInTheDocument();
  },
};
```

From `src/core/RadioButton/stories/Checked.story.tsx`:

```tsx
import React from "react";
import { RadioButton } from "../RadioButton";
import { within, expect } from "storybook/test";
import { Story, mockOnChange, testOptions } from "./_RadioButton.default";

export const Checked: Story = {
  args: {
    inputName: "test-radio",
    labelText: "Selected Option",
    value: testOptions.selected,
    checked: true,
    theme: "standard",
    onChangeFn: mockOnChange,
    testId: "radio-button",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const radioButton = canvas.getByTestId("radio-button");
    await expect(radioButton).toBeChecked();
  },
};
```
