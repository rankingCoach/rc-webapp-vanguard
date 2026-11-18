# RadioButtonGroup

Group wrapper that manages radio button sets, keyboard navigation and selection state.

- Kind: component
- Import: `import { RadioButtonGroup } from '@rankingcoach/vanguard';`
- WordPress bundle: no
- Source: `src/core/RadioButtonGroup/RadioButtonGroup.tsx`
- Keywords: radio, group, form, selection, keyboard, options

## DOM contract

No slots yet.

## Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `capitalizeOptions` | `boolean` | no |  |
| `direction` | `"row" \| "column"` | no |  |
| `formClassName` | `string` | no |  |
| `formconfig` | `FormConfigElement` | no |  |
| `groupLabel` | `string` | no |  |
| `groupLabelFontWeight` | `FontWeights` | no |  |
| `groupLabelNoPadding` | `boolean` | no |  |
| `name` | `string` | yes |  |
| `options` | `RadioData<ValueType>[]` | yes |  |
| `replacements` | `TextReplacements` | no |  |
| `setRadioValueFn` | `(value: ValueType) => void` | yes |  |
| `testId` | `string` | no |  |
| `theme` | `"success" \| "standard" \| "bordered"` | no |  |
| `translate` | `boolean` | no |  |
| `value` | `ValueType` | yes |  |
