# Select

Dropdown select with options rendering, keyboard navigation and optional search support. `size="small"` is the compact 32px filled toolbar select (12px medium text, 16px chevron): `<Select size="small" labelType="hidden" options={...} />`.

- Kind: component
- Import: `import { Select } from '@rankingcoach/vanguard';`
- WordPress bundle: yes
- Source: `src/core/Select/Select.tsx`
- Keywords: select, dropdown, options, keyboard, accessibility, search, compact, small, toolbar, filled, sort

## DOM contract

Slots: `[data-slot="menu-option"]`

State / variant attributes: `data-disabled`, `data-selected`

## Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `adornment` | `React.ReactNode[]` | no |  |
| `autoFocus` | `boolean` | no |  |
| `className` | `string` | no |  |
| `containToSelectWidth` | `boolean` | no |  |
| `customInputRenderer` | `React.ComponentType<SelectOptionsComponentProps>` | no |  |
| `customOptionsRenderer` | `React.ComponentType<SelectOptionsComponentProps>` | no |  |
| `defaultValue` | `string \| number` | no |  |
| `descriptionUnderTitle` | `boolean` | no |  |
| `disabled` | `boolean` | no |  |
| `ellipsis` | `boolean` | no |  |
| `field` | `string` | no | F3: bind to the nearest <Form config>'s field of this name, at any depth, without passing `formconfig`. An explicit `formconfig` wins. |
| `formconfig` | `FormConfigElement` | no |  |
| `freeSolo` | `boolean` | no |  |
| `hideOptionalLabel` | `boolean` | no | Hides the "Optional" hint appended to the label of non-required fields. Has no effect on required fields (they never show the hint). |
| `id` | `string` | no |  |
| `index` | `number` | no | F3: element index for array fields bound with `field`. |
| `infoText` | `string` | no |  |
| `inputRef` | `React.MutableRefObject<HTMLInputElement \| HTMLTextAreaElement>` | no |  |
| `label` | `string \| false` | no |  |
| `labelStyle` | `React.CSSProperties` | no |  |
| `labelType` | `"hidden" \| "static" \| "floating" \| "outer"` | no |  |
| `maxMenuItemsUntilScroll` | `number` | no |  |
| `menuItemHeight` | `number` | no |  |
| `nativeSelect` | `boolean` | no |  |
| `onBlur` | `(e: React.FocusEvent<HTMLInputElement \| HTMLTextAreaElement, Element>) => void` | no |  |
| `onChange` | `((e: React.ChangeEvent<HTMLInputElement \| HTMLTextAreaElement>) => void) & SelectOnChange` | no |  |
| `onClick` | `(event: React.MouseEvent<Element, MouseEvent>) => void` | no |  |
| `onFocus` | `(e: React.FocusEvent<HTMLInputElement \| HTMLTextAreaElement, Element>) => void` | no |  |
| `onInput` | `(e: React.FormEvent<HTMLDivElement>) => void` | no |  |
| `onKeyDown` | `(e: React.KeyboardEvent<HTMLDivElement>) => void` | no |  |
| `onKeyUp` | `(e: React.KeyboardEvent<HTMLDivElement>) => void` | no |  |
| `onStepDownNumericClick` | `(event: React.MouseEvent<Element, MouseEvent>) => void` | no |  |
| `onStepUpNumericClick` | `(event: React.MouseEvent<Element, MouseEvent>) => void` | no |  |
| `options` | `SelectOptionProps<any>` | no |  |
| `placeholder` | `string` | no |  |
| `popoverMessage` | `string` | no |  |
| `popoverPosition` | `"left" \| "right" \| "bottom" \| "top"` | no |  |
| `replacements` | `TextReplacements` | no |  |
| `required` | `boolean` | no |  |
| `select` | `boolean` | no |  |
| `selectDisplayEmpty` | `boolean` | no |  |
| `selectRenderValue` | `(key: string) => React.ReactNode` | no |  |
| `size` | `"small" \| "medium"` | no |  |
| `testId` | `string` | no |  |
| `theme` | `"default" \| "grey"` | no |  |
| `translateOptions` | `boolean` | no |  |
| `triggerChangeOnStateFieldChange` | `boolean` | no |  |
| `value` | `InputBaseValueType` | no |  |
| `valueAsDefaultValue` | `boolean` | no |  |
