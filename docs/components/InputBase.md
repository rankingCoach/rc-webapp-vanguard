# InputBase

Low-level input base used by higher-level Input components for adornments and shared behavior.

- Kind: component
- Import: `import { InputBase } from '@rankingcoach/vanguard';`
- WordPress bundle: no
- Source: `src/core/_internal/InputBase/InputBase.tsx`
- Keywords: input, base, adornment, form, control, component, internal

> Internals pending rebuild: this component still renders MUI internally. Its DOM contract (data-slot parts) is not final yet; style it through the props and classes it documents.

## DOM contract

No slots yet.

## Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `adornment` | `React.ReactNode` | no |  |
| `allowBreakLines` | `boolean` | no |  |
| `autoFocus` | `boolean` | no |  |
| `children` | `React.ReactNode` | no |  |
| `className` | `string` | no |  |
| `counter` | `boolean` | no |  |
| `defaultValue` | `string \| number` | no |  |
| `disabled` | `boolean` | no |  |
| `endAdornment` | `React.ReactNode` | no |  |
| `field` | `string` | no | F3: bind to the nearest <Form config>'s field of this name, at any depth, without passing `formconfig`. An explicit `formconfig` wins. |
| `formconfig` | `FormConfigElement` | no |  |
| `formFieldType` | `FormFieldType` | no |  |
| `helperLinkDisabled` | `boolean` | no |  |
| `helperLinkHref` | `string` | no |  |
| `helperLinkText` | `string` | no |  |
| `hideOptionalLabel` | `boolean` | no | Hides the "Optional" hint appended to the label of non-required fields. Has no effect on required fields (they never show the hint). |
| `highlightLengthExceeded` | `boolean` | no |  |
| `highlightUrl` | `boolean` | no |  |
| `highlightUrlType` | `"info" \| "positive" \| "negative"` | no |  |
| `highlightWords` | `string[]` | no |  |
| `id` | `string` | no |  |
| `index` | `number` | no | F3: element index for array fields bound with `field`. |
| `infoText` | `string` | no |  |
| `inputRef` | `React.MutableRefObject<HTMLInputElement \| HTMLTextAreaElement>` | no |  |
| `isLoading` | `boolean` | no |  |
| `label` | `string \| false` | no |  |
| `labelStyle` | `React.CSSProperties` | no |  |
| `labelType` | `"hidden" \| "static" \| "floating" \| "outer"` | no |  |
| `maxLength` | `number` | no |  |
| `maxMenuItemsUntilScroll` | `number` | no |  |
| `maxRows` | `number` | no |  |
| `menuItemHeight` | `number` | no |  |
| `minRows` | `number` | no |  |
| `multiline` | `boolean` | no |  |
| `nativeSelect` | `boolean` | no |  |
| `onBlur` | `(e: React.FocusEvent<HTMLInputElement \| HTMLTextAreaElement, Element>) => void` | no |  |
| `onChange` | `(e: React.ChangeEvent<HTMLInputElement \| HTMLTextAreaElement>) => void` | no |  |
| `onClick` | `(event: React.MouseEvent<Element, MouseEvent>) => void` | no |  |
| `onFocus` | `(e: React.FocusEvent<HTMLInputElement \| HTMLTextAreaElement, Element>) => void` | no |  |
| `onHelperLinkClick` | `(value: InputBaseValueType) => void` | no |  |
| `onHighlightWordFound` | `(word?: string, config?: FormConfigElement) => void` | no |  |
| `onInput` | `(e: React.FormEvent<HTMLDivElement>) => void` | no |  |
| `onKeyDown` | `(e: React.KeyboardEvent<HTMLDivElement>) => void` | no |  |
| `onKeyUp` | `(e: React.KeyboardEvent<HTMLDivElement>) => void` | no |  |
| `onProhibitedWordFound` | `(word?: string, config?: FormConfigElement) => void` | no |  |
| `onStepDownNumericClick` | `(event: React.MouseEvent<Element, MouseEvent>) => void` | no |  |
| `onStepUpNumericClick` | `(event: React.MouseEvent<Element, MouseEvent>) => void` | no |  |
| `placeholder` | `string` | no |  |
| `popoverHighlight` | `PopoverHighlightType` | no |  |
| `popoverMessage` | `string` | no |  |
| `popoverPosition` | `"left" \| "right" \| "bottom" \| "top"` | no |  |
| `prohibitedWords` | `string[]` | no |  |
| `replacements` | `TextReplacements` | no |  |
| `required` | `boolean` | no |  |
| `roundedNumericCTAType` | `boolean` | no |  |
| `rows` | `number` | no |  |
| `select` | `boolean` | no |  |
| `selectDisplayEmpty` | `boolean` | no |  |
| `selectRenderValue` | `(key: string) => React.ReactNode` | no |  |
| `size` | `"small" \| "medium"` | no |  |
| `testId` | `string` | no |  |
| `textFieldProps` | `VanguardTextFieldProps` | no |  |
| `theme` | `"default" \| "grey"` | no |  |
| `triggerChangeOnStateFieldChange` | `boolean` | no |  |
| `type` | `React.HTMLInputTypeAttribute` | no |  |
| `value` | `InputBaseValueType` | no |  |
| `valueAsDefaultValue` | `boolean` | no |  |

## Examples

From `src/core/_internal/InputBase/stories/AutoFocusTest.story.tsx`:

```tsx
import { within, expect } from "storybook/test";
import { Story } from "./_InputBase.default";

export const AutoFocusTest: Story = {
  args: {
    autoFocus: true,
  },
  play: async ({ canvasElement }) => {
    // Use within to find all input elements with the role "textbox"
    const canvas = within(canvasElement);
    const inputElements = canvas.getAllByRole("textbox");

    // Use a filter or other criteria to select the specific input element you want to test
    const inputElement = inputElements[1]; // Adjust the index or add filtering logic if needed
    // Assert that the input element is focused
    await expect(document.activeElement).toBe(inputElement);
  },
};
```

From `src/core/_internal/InputBase/stories/ClassNameTest.story.tsx`:

```tsx
import { within, expect } from "storybook/test";
import { Story, testValues } from "./_InputBase.default";

export const ClassNameTest: Story = {
  args: {
    className: testValues.customClassName,
  },
  play: async ({ canvasElement }) => {
    // Use querySelector to find the element by its class name
    const canvas = within(canvasElement);
    const elementWithClass = canvasElement.querySelector(`.${testValues.customClassName}`);

    // Assert that the element with the class name is present in the document
    await expect(elementWithClass).toBeInTheDocument();
  },
};
```
