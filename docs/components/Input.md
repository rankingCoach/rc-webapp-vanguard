# Input

Text input with label, validation, counters, and adornment support used in forms. `size="small"` is the compact 32px filled toolbar field, e.g. a search: `<Input size="small" labelType="hidden" adornment={<Icon>{IconNames.search}</Icon>} />`.

- Kind: component
- Import: `import { Input } from '@rankingcoach/vanguard';`
- WordPress bundle: yes
- Source: `src/core/Input/Input.tsx`
- Keywords: input, text, form, validation, adornment, counter, control, compact, small, search, toolbar, filled

## DOM contract

No slots yet.

## Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `adornment` | `React.ReactNode` | no |  |
| `autoFocus` | `boolean` | no |  |
| `className` | `string` | no |  |
| `counter` | `boolean` | no |  |
| `defaultValue` | `string \| number` | no |  |
| `disabled` | `boolean` | no |  |
| `endAdornment` | `React.ReactNode` | no |  |
| `field` | `string` | no | F3: bind to the nearest <Form config>'s field of this name, at any depth, without passing `formconfig`. An explicit `formconfig` wins. |
| `formconfig` | `FormConfigElement` | no |  |
| `hideOptionalLabel` | `boolean` | no | Hides the "Optional" hint appended to the label of non-required fields. Has no effect on required fields (they never show the hint). |
| `highlightLengthExceeded` | `boolean` | no |  |
| `highlightUrl` | `boolean` | no |  |
| `highlightUrlType` | `"info" \| "positive" \| "negative"` | no |  |
| `highlightWords` | `string[]` | no |  |
| `id` | `string` | no |  |
| `index` | `number` | no | F3: element index for array fields bound with `field`. |
| `infoText` | `string` | no |  |
| `inputClassName` | `string` | no |  |
| `inputRef` | `React.MutableRefObject<HTMLInputElement \| HTMLTextAreaElement>` | no |  |
| `isLoading` | `boolean` | no |  |
| `label` | `string \| false` | no |  |
| `labelStyle` | `React.CSSProperties` | no |  |
| `labelType` | `"hidden" \| "static" \| "floating" \| "outer"` | no |  |
| `loadingText` | `string` | no |  |
| `maxLength` | `number` | no |  |
| `onBlur` | `(e: React.FocusEvent<HTMLInputElement \| HTMLTextAreaElement, Element>) => void` | no |  |
| `onChange` | `(e: React.ChangeEvent<HTMLInputElement \| HTMLTextAreaElement>) => void` | no |  |
| `onClick` | `(event: React.MouseEvent<Element, MouseEvent>) => void` | no |  |
| `onFocus` | `(e: React.FocusEvent<HTMLInputElement \| HTMLTextAreaElement, Element>) => void` | no |  |
| `onHighlightWordFound` | `(word?: string, config?: FormConfigElement) => void` | no |  |
| `onInput` | `(e: React.FormEvent<HTMLDivElement>) => void` | no |  |
| `onKeyDown` | `(e: React.KeyboardEvent<HTMLDivElement>) => void` | no |  |
| `onKeyUp` | `(e: React.KeyboardEvent<HTMLDivElement>) => void` | no |  |
| `onProhibitedWordFound` | `(word?: string, config?: FormConfigElement) => void` | no |  |
| `onStepDownNumericClick` | `(event: React.MouseEvent<Element, MouseEvent>) => void` | no |  |
| `onStepUpNumericClick` | `(event: React.MouseEvent<Element, MouseEvent>) => void` | no |  |
| `placeholder` | `string` | no |  |
| `prohibitedWords` | `string[]` | no |  |
| `readonly` | `boolean` | no |  |
| `replacements` | `TextReplacements` | no |  |
| `required` | `boolean` | no |  |
| `roundedNumericCTAType` | `boolean` | no |  |
| `size` | `"small" \| "medium"` | no | `small`: the compact 32px filled field for toolbars (e.g. a search with a leading icon `adornment`). |
| `testId` | `string` | no |  |
| `textFieldProps` | `VanguardTextFieldProps` | no |  |
| `triggerChangeOnStateFieldChange` | `boolean` | no |  |
| `type` | `"number" \| "text" \| "date" \| "email" \| "password"` | no |  |
| `value` | `InputBaseValueType` | no |  |
| `valueAsDefaultValue` | `boolean` | no |  |

## Examples

From `src/core/Input/stories/Default.story.tsx`:

```tsx
import React from "react";
import { Input } from "../Input";
import { within, expect } from "storybook/test";
import { Story, selectors } from "./_Input.default";

export const Default: Story = {
  args: {
    testId: "default-input",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByTestId("default-input");
    await expect(input).toBeInTheDocument();
  },
};
```

From `src/core/Input/stories/Disabled.story.tsx`:

```tsx
import React from "react";
import { Input } from "../Input";
import { within, expect } from "storybook/test";
import { Story } from "./_Input.default";

export const Disabled: Story = {
  args: {
    disabled: true,
    value: "Disabled input",
    testId: "disabled-input",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByDisplayValue("Disabled input");
    await expect(input).toBeDisabled();
  },
};
```
