# Autocomplete

Input with suggestion dropdown supporting keyboard navigation and async sources.

- Kind: component
- Import: `import { Autocomplete } from '@rankingcoach/vanguard';`
- WordPress bundle: yes
- Source: `src/core/Autocomplete/Autocomplete.tsx`
- Keywords: autocomplete, suggestions, input, dropdown, keyboard, async

> Internals pending rebuild: this component still renders MUI internally. Its DOM contract (data-slot parts) is not final yet; style it through the props and classes it documents.

## DOM contract

No slots yet.

## Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `adornment` | `React.ReactNode[]` | no |  |
| `autoFocus` | `boolean` | no |  |
| `autoSelect` | `boolean` | no |  |
| `chipSize` | `"small" \| "medium"` | no | Size of the chips of a `multiple` Autocomplete. Default 'medium'. |
| `className` | `string` | no |  |
| `controlled` | `boolean` | no | When true, `value` is the single source of truth (MUI controlled mode): the input/chips always show `value` and a selection only changes through `onChange`. Default false keeps the legacy uncontrolled behaviour. |
| `defaultValue` | `string \| number` | no |  |
| `disabled` | `boolean` | no |  |
| `field` | `string` | no | F3: bind to the nearest <Form config>'s field of this name, at any depth, without passing `formconfig`. An explicit `formconfig` wins. |
| `formconfig` | `FormConfigElement` | no |  |
| `getOptionLabel` | `(option: any) => string` | no | Text of an option (input value, highlight, chip label). Overrides the `optionKey` lookup. |
| `hideCaret` | `boolean` | no |  |
| `hideClearButton` | `boolean` | no |  |
| `hideOptionalLabel` | `boolean` | no | Hides the "Optional" hint appended to the label of non-required fields. Has no effect on required fields (they never show the hint). |
| `highlightOptions` | `boolean` | no |  |
| `id` | `string` | no |  |
| `index` | `number` | no | F3: element index for array fields bound with `field`. |
| `infoText` | `string` | no |  |
| `inputAriaLabel` | `string` | no | Accessible name of the input when there is no visible label. |
| `inputRef` | `React.MutableRefObject<HTMLInputElement \| HTMLTextAreaElement>` | no |  |
| `isLoading` | `boolean` | no |  |
| `isOptionEqualToValue` | `(option: any, value: any) => boolean` | no | Whether `option` represents `value`. Overrides the `optionKey` / identity comparison. |
| `label` | `string \| false` | no |  |
| `labelStyle` | `React.CSSProperties` | no |  |
| `labelType` | `"hidden" \| "static" \| "floating" \| "outer"` | no |  |
| `noOptionsComponent` | `React.ReactNode` | no |  |
| `noOptionsText` | `React.ReactNode` | no |  |
| `open` | `boolean` | no |  |
| `optionKey` | `string` | no |  |
| `placeholder` | `string` | no |  |
| `popoverMessage` | `string` | no |  |
| `popoverPosition` | `"left" \| "right" \| "bottom" \| "top"` | no |  |
| `renderOption` | `(optionProps: React.HTMLAttributes<HTMLLIElement> & { key?: React.Key; }, option: any, sta \| …` | no | Custom option row; must return an `<li {...optionProps}>`. Same signature as MUI. |
| `replacements` | `TextReplacements` | no |  |
| `required` | `boolean` | no |  |
| `restrictToOptions` | `boolean` | no |  |
| `showOptionCheckbox` | `boolean` | no | Prefix every default option row with a checkbox reflecting its selection (for `multiple`). |
| `splitCommaTag` | `boolean` | no |  |
| `testId` | `string` | no |  |
| `triggerChangeOnStateFieldChange` | `boolean` | no |  |
| `valueAsDefaultValue` | `boolean` | no |  |

Also accepts: 21 MUI props, 3 React DOM attributes (not listed).

## Examples

From `src/core/Autocomplete/stories/Default.story.tsx`:

```tsx
import React from "react";
import { Autocomplete } from "../Autocomplete";
import { within, expect } from "storybook/test";
import { Story, testOptions } from "./_Autocomplete.default";

/**
 * Default Autocomplete story.
 * Tests basic functionality with options and optionKey.
 */
export const Default: Story = {
  args: {
    placeholder: "Select a fruit...",
    options: testOptions,
    optionKey: "title",
    onChange: (event, value) => console.log("Selected:", value),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("textbox");
    await expect(input).toBeInTheDocument();
    // Check that the component renders without errors
    await expect(canvasElement).toBeInTheDocument();
  },
};
```

From `src/core/Autocomplete/stories/Disabled.story.tsx`:

```tsx
import React from "react";
import { Autocomplete } from "../Autocomplete";
import { within, expect } from "storybook/test";
import { Story, testOptions } from "./_Autocomplete.default";

/**
 * Disabled Autocomplete.
 * Tests disabled prop.
 */
export const Disabled: Story = {
  args: {
    placeholder: "Can't type here...",
    options: testOptions,
    optionKey: "title",
    disabled: true,
    onChange: (event, value) => console.log("Selected:", value),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("textbox");
    await expect(input).toBeInTheDocument();
    // Check that the component renders without errors - disabled state is tested via args
    await expect(canvasElement).toBeInTheDocument();
  },
};
```
