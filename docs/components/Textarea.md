# Textarea

Multi-line text input with validation, autosize and optional counter.

- Kind: component
- Import: `import { Textarea } from '@rankingcoach/vanguard';`
- WordPress bundle: yes
- Source: `src/core/Textarea/Textarea.tsx`
- Keywords: textarea, input, multiline, autosize, validation, counter, form

## DOM contract

No slots yet.

## Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `adornment` | `React.ReactNode` | no |  |
| `allowBreakLines` | `boolean` | no |  |
| `autoFocus` | `boolean` | no |  |
| `className` | `string` | no |  |
| `counter` | `boolean` | no |  |
| `defaultValue` | `string \| number` | no |  |
| `disabled` | `boolean` | no |  |
| `endAdornment` | `React.ReactNode` | no |  |
| `field` | `string` | no | F3: bind to the nearest <Form config>'s field of this name, at any depth, without passing `formconfig`. An explicit `formconfig` wins. |
| `formconfig` | `FormConfigElement` | no |  |
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
| `maxRows` | `number` | no |  |
| `minRows` | `number` | no |  |
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
| `prohibitedWords` | `string[]` | no |  |
| `replacements` | `TextReplacements` | no |  |
| `required` | `boolean` | no |  |
| `roundedNumericCTAType` | `boolean` | no |  |
| `rows` | `number` | no |  |
| `testId` | `string` | no |  |
| `triggerChangeOnStateFieldChange` | `boolean` | no |  |
| `value` | `string` | no |  |
| `valueAsDefaultValue` | `boolean` | no |  |

## Examples

From `src/core/Textarea/stories/TestAdornmentProp.story.tsx`:

```tsx
import { Story } from "./_Textarea.default";
import { within, expect } from "storybook/test";

export const TestAdornmentProp: Story = {
  args: {
    adornment: <span className="adornment-icon">🔍</span>,
    placeholder: "Adornment Test",
  },
  play: async ({ canvasElement }) => {
    const adornment = within(canvasElement).getByText("🔍");
    await expect(adornment).toBeInTheDocument();
  },
};
```

From `src/core/Textarea/stories/TestAutoFocusProp.story.tsx`:

```tsx
import { Story } from "./_Textarea.default";
import { within, expect } from "storybook/test";

export const TestAutoFocusProp: Story = {
  args: {
    autoFocus: true,
    placeholder: "Autofocus Test",
  },
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByPlaceholderText("Autofocus Test");
    await expect(document.activeElement).toBe(input);
  },
};
```
